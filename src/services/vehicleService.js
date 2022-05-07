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

exports.getAllVehicles = () => Vehicle.find().select('-__v').lean()
    .then(vehicles => vehicles)
    .catch(err => []);

exports.getAllVehiclesByCategory = (category) => Vehicle.find({ category : { '$regex': new RegExp(category, 'i')}}).select('-__v').lean()
    .then(vehicles => vehicles)
    .catch(err => []);

exports.getVehicle = (_id) => Vehicle.findById(_id).select('-__v').lean()
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
    })