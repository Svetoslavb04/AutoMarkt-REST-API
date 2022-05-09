const Vehicle = require('../models/Vehicle');

exports.createVehicle = (vehicle) => Vehicle.create(vehicle)
    .then(vehicle => {
        return {
            _id: vehicle._id,
            make: vehicle.make,
            model: vehicle.model,
            description: vehicle.description,
            mileage: vehicle.mileage,
            year: vehicle.year,
            category: vehicle.category,
            VIN: vehicle.VIN,
            price: vehicle.price,
            imageUrl: vehicle.imageUrl,
            publisherId: vehicle.publisherId
        };
    })
    .catch(err => {

        const error = {};

        if (err.name == 'ValidationError') {

            error.message = 'Product Validation Error';
            error.errors = {};

            const keys = Object.keys(err.errors);

            keys.forEach(key => {

                if (err.errors[key].properties) {

                    error.errors[key] = err.errors[key].properties.message;

                } else {

                    error.errors[key] = 'Invalid data type';

                }

            });

        } else if (err.name == 'MongoServerError') {

            error.message = 'Existing vehicle';

        }
        else {

            error.message = err.name;

        }

        throw error;
    });

exports.getAllVehicles = (sort) => Vehicle.find()
    .sort(createSortQuery(sort))
    .select('-__v')
    .lean()
    .then(vehicles => vehicles)
    .catch(err => []);

exports.getAllVehiclesByCategory = (category) => Vehicle.find({ category: { '$regex': new RegExp(category, 'i') } })
    .select('-__v')
    .lean()
    .then(vehicles => vehicles)
    .catch(err => []);

exports.getPaginatedVehicles = (page, pageSize, sort) => {

    if (isNaN(page) || isNaN(pageSize)) {

        return new Promise((resolve, reject) => {
            resolve([]);
        })

    }

    return Vehicle.find()
        .sort(createSortQuery(sort))
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean()
        .then(vehicles => vehicles)
        .catch(err => []);
}

exports.getLatestVehicles = (count) => !isNaN(count)
    ? Vehicle.find({})
        .sort({ $natural: 'desc' })
        .limit(count)
        .lean()
        .then(vehicles => vehicles)
        .catch(err => [])
    : new Promise((resolve, reject) => {
        resolve([]);
    })

exports.getVehicle = (_id) => Vehicle.findById(_id)
    .select('-__v')
    .lean()
    .then(vehicle => vehicle)
    .catch(err => null);

exports.editVehicle = (vehicle) => Vehicle.findByIdAndUpdate(
    vehicle._id, vehicle,
    {
        runValidators: true,
        new: true
    })
    .then(vehicle => vehicle)
    .catch(err => {

        const error = {};

        if (err.name == 'ValidationError') {

            error.message = 'Vehicle Validation Error';
            error.errors = {};

            const keys = Object.keys(err.errors);

            keys.forEach(key => {

                if (err.errors[key].properties) {

                    error.errors[key] = err.errors[key].properties.message;

                } else {

                    error.errors[key] = 'Invalid data type';

                }

            });

        } else if (err.name == 'MongoServerError') {

            error.message = 'Existing vehicle';

        }
        else {

            error.message = err.name;

        }

        throw error;
    });

exports.deleteVehicle = (_id) => Vehicle.findByIdAndDelete(_id)
    .then(vehicle => {
        if (vehicle == null) {
            throw Error;
        }
    })
    .catch(err => {
        throw {
            message: 'Invalid vehicle'
        }
    });

exports.getAllVehiclesCount = () => Vehicle.estimatedDocumentCount()
    .then(count => count)
    .catch(err => 0);

function createSortQuery(sort) {

    let sortQuery = {};

    switch (sort) {
        case 'makeAsc':
            sortQuery = { make: 'asc' };
            break;
        case 'makeDesc':
            sortQuery = { make: 'desc' };
            break;
        case 'priceAsc':
            sortQuery = { price: 'asc' };
            break;
        case 'priceDesc':
            sortQuery = { price: 'desc' };
            break;
        case 'yearAsc':
            sortQuery = { year: 'asc' };
            break;
        case 'yearDesc':
            sortQuery = { year: 'desc' };
            break;
        default:
            sortQuery = {};
            break;
    }

    return sortQuery;
}