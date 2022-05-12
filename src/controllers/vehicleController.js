const router = require('express').Router();

const { Authenticated, Publisher } = require('../middlewares/authMiddleware');
const s3 = require('../utils/s3Helper');

const { createVehicle, getVehicles, getLatestVehicles, getVehicle, getVehiclesCount, editVehicle, deleteVehicle, getCategories, getAllMakes, getAggregatedDataPerCategory } = require('../services/vehicleService');

router.post('/create', Authenticated, (req, res) => {

    createVehicle({ ...req.body, publisherId: req.user._id })
        .then(vehicle => res.json(vehicle))
        .catch(error => res.status(400).json({ status: 400, ...error }));

});

router.get('/count', (req, res) => {

    const filter = {
        category: undefined,
        priceInterval: undefined,
        makes: undefined,
        yearInterval: undefined,
        mileageInterval: undefined
    }

    invokeObjectDecorator(
        req,
        filter,
        ['category', 'priceInterval', 'makes', 'yearInterval', 'mileageInterval']
    );

    getVehiclesCount(filter)
        .then(count => res.json({ status: 200, count}));
})

router.get('/categories', (req, res) => {

    getCategories()
        .then(categories => res.json({ status: 200, categories}))
        .catch(err => res.staus(404).json({ status: 404, categories: []}))
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

    const queryArguments = {
        category: undefined,
        page: undefined,
        pageSize: undefined,
        sort: undefined
    };

    invokeObjectDecorator(
        req,
        queryArguments,
        ['page', 'pageSize', 'sort', 'category', 'priceInterval', 'makes', 'yearInterval', 'mileageInterval']
    );

    if (req.query.latest) {

        return getLatestVehicles(Number(req.query.latest))
            .then(vehicles => res.json(vehicles))
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

router.delete('/:_id', Authenticated, Publisher, (req, res) => {

    deleteVehicle(req.params._id)
        .then(vehicle => {
            console.log(vehicle);
            res.json({ status: 200, message: 'Vehicle has been deleted' })
        })
        .catch(error => res.status(400).json({ status: 400, ...error }));

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