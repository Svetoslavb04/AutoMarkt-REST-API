const router = require('express').Router();

const { Authenticated, Publisher } = require('../middlewares/authMiddleware');
const s3 = require('../utils/s3Helper');

const { createVehicle, getVehicles, getLatestVehicles, getVehicle, getAllVehiclesCount, editVehicle, deleteVehicle } = require('../services/vehicleService');

router.post('/create', Authenticated, (req, res) => {

    createVehicle({ ...req.body, publisherId: req.user._id })
        .then(vehicle => res.json(vehicle))
        .catch(error => res.status(400).json({ status: 400, ...error }));

});

router.get('/count', (req, res) => {

    getVehiclesCount(req.query.category)
        .then(count => res.json({ status: 200, count }))

})

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

    if (req.query.page && req.query.pageSize) {

        queryArguments.page = req.query.page;
        queryArguments.pageSize = req.query.pageSize;

    }

    if (req.query.category) {

        queryArguments.category = req.query.category;

    }

    if (req.query.sort) {

        queryArguments.sort = req.query.sort;

    }

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

module.exports = router;