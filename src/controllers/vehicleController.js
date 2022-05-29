const router = require('express').Router();

const { Authenticated, Publisher } = require('../middlewares/authMiddleware');
const s3 = require('../utils/s3Helper');

const { createVehicle, getVehicles, getLatestVehicles, getVehicle, getVehiclesBySearch,
    getVehiclesCount, editVehicle, deleteVehicle, getUsedCategories, getAggregatedDataPerCategory, getAllCategories }
    = require('../services/vehicleService');

const { clearVehicleFromCarts } = require('../services/shoppingCartService');
const { clearVehicleFromWishLists } = require('../services/wishListService');

router.post('/create', Authenticated, (req, res) => {

    createVehicle({ ...req.body, publisherId: req.user._id })
        .then(vehicle => res.json(vehicle))
        .catch(error => res.status(400).json({ status: 400, ...error }));

});

router.get('/count', (req, res) => {

    const filter = {
        category: undefined,
        priceGreaterThan: undefined,
        priceLowerThan: undefined,
        makes: undefined,
        yearGreaterThan: undefined,
        yearLowerThan: undefined,
        mileageGreaterThan: undefined,
        mileageLowerThan: undefined
    }

    invokeObjectDecorator(
        req,
        filter,
        [
            'category', 'priceGreaterThan', 'priceLowerThan'
            , 'makes', 'yearGreaterThan', 'yearLowerThan', 'mileageGreaterThan', 'mileageLowerThan'
        ]
    );

    getVehiclesCount(filter)
        .then(count => res.json({ status: 200, count }));
})

router.get('/categories', async (req, res) => {

    let categories = [];

    if (req.query.used == 'true') {

        try {

            categories = await getUsedCategories();

        } catch (error) {

            return res.status(404).json({ status: 404, categories });

        }

    } else {

        categories = getAllCategories();

    }

    res.json({ status: 200, categories });

});

router.get('/categoryData', (req, res) => {

    getAggregatedDataPerCategory(req.query.category)
        .then(data => {
            res.json({ status: 200, data })
        })
        .catch(err => res.json({ status: 200, data: {} }))

});


router.get('/imageUploadUrl', Authenticated, (req, res) => {

    s3.generateUploadUrl()
        .then(awsUrl => res.json({ awsUrl }))
        .catch(err => res.status(500).json({ status: 500, message: err.name }));

});

router.get('/', (req, res) => {

    if (req.query.latest) {

        return getLatestVehicles(Number(req.query.latest))
            .then(vehicles => res.json(vehicles))
            .catch(err => []);

    }

    const queryArguments = {
        category: undefined,
        page: undefined,
        pageSize: undefined,
        sort: undefined
    };

    invokeObjectDecorator(
        req,
        queryArguments,
        [
            'page', 'pageSize', 'sort', 'category', 'priceGreaterThan', 'priceLowerThan'
            , 'makes', 'yearGreaterThan', 'yearLowerThan', 'mileageGreaterThan', 'mileageLowerThan'
        ]
    );

    if (req.query.search) {

        return getVehiclesBySearch(req.query.search, queryArguments.page, queryArguments.pageSize)
            .then(data => res.json({ vehicles: data.vehicles, meta: data.meta }))
            .catch(err => []);

    }

    getVehicles(queryArguments)
        .then(vehicles => res.json(vehicles))
        .catch(err => []);

});

router.get('/:_id', (req, res) => {

    getVehicle(req.params._id)
        .then(vehicle => res.json(vehicle))
        .catch(err => res.json(null));

});

router.put('/:_id', Authenticated, Publisher, (req, res) => {

    editVehicle({ _id: req.params._id, ...req.body })
        .then(vehicle => res.json(vehicle))
        .catch(error => res.status(400).json({ status: 400, ...error }));

});

router.delete('/:_id', Authenticated, Publisher, async (req, res) => {

    try {

        const vehicle = await getVehicle(req.params._id);

        await deleteVehicle(req.params._id);

        s3.deleteObjectByKey(s3.getObjectKeyByUrl(vehicle.imageUrl));

        await clearVehicleFromCarts(req.params._id);

        await clearVehicleFromWishLists(req.params._id);

    } catch (error) {
        res.status(400).json({ status: 400, ...error })
    }

    res.json({ status: 200, message: 'Vehicle has been deleted!' });

});

const decorateObjectFromRequestQuertIfParamsAvailable = (req, object, ...params) =>
    params
        .forEach(param =>
            req.query[param]
                ? object[param] = req.query[param]
                : object
        );


const invokeObjectDecorator = (req, object, array) =>
    array
        .forEach(arguments =>
            decorateObjectFromRequestQuertIfParamsAvailable.call(null, req, object, arguments)
        );

module.exports = router;