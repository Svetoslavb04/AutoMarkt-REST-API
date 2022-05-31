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
        category: req.query.category,
        priceGreaterThan: req.query.priceGreaterThan,
        priceLowerThan: req.query.priceLowerThan,
        makes: req.query.makes,
        yearGreaterThan: req.query.yearGreaterThan,
        yearLowerThan: req.query.yearLowerThan,
        mileageGreaterThan: req.query.mileageGreaterThan,
        mileageLowerThan: req.query.mileageLowerThan
    }

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
        page: req.query.page,
        pageSize: req.query.pageSize,
        sort: req.query.sort,
        filter: {
            category: req.query.category,
            priceGreaterThan: req.query.priceGreaterThan,
            priceLowerThan: req.query.priceLowerThan,
            makes: req.query.makes ? Array.isArray(req.query.makes) ? req.query.makes : [req.query.makes] : undefined,
            yearGreaterThan: req.query.yearGreaterThan,
            yearLowerThan: req.query.yearLowerThan,
            mileageGreaterThan: req.query.mileageGreaterThan,
            mileageLowerThan: req.query.mileageLowerThan,
        },
        search: req.query.search
    };

    getVehicles(queryArguments)
        .then(data => res.json(data))
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

module.exports = router;