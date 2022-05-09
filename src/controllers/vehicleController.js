const router = require('express').Router();

const { Authenticated, Publisher } = require('../middlewares/authMiddleware');
const s3 = require('../utils/s3Helper');

const { createVehicle, getVehicle, editVehicle, deleteVehicle, getAllVehicles, getAllVehiclesByCategory, getAllVehiclesCount, getPaginatedVehicles, getLatestVehicles } = require('../services/vehicleService');

router.post('/create', Authenticated, (req, res) => {

    createVehicle({ ...req.body, publisherId: req.user._id })
        .then(vehicle => res.json(vehicle))
        .catch(error => res.status(400).json({ status: 400, ...error }));

});

router.get('/count', (req, res) => {

    getAllVehiclesCount()
        .then(count => res.json({ status: 200, count }))

})

router.get('/imageUploadUrl', Authenticated, (req, res) => {

    s3.generateUploadUrl()
        .then(awsUrl => res.json({ awsUrl }))
        .catch(err => res.status(500).json({ status: 500, message: err.name }));

});

router.get('/', (req, res) => {

    if (req.query.page && req.query.pageSize) {

        return getPaginatedVehicles(req.query.page, req.query.pageSize, req.query.sort ? req.query.sort : 'default')
            .then(vehicles => res.json(vehicles))
            .catch(err => []);

    }

    if (req.query.latest) {

        return getLatestVehicles(Number(req.query.latest))
            .then(vehicles => res.json(vehicles))
            .catch(err => []);

    }

    if (req.query.category) {

        return getAllVehiclesByCategory(req.query.category)
            .then(vehicles => res.json(vehicles))
            .catch(err => []);

    }

    getAllVehicles()
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