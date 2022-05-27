const Order = require('../models/Order');

exports.getAll = (owner_id) => Order.find({ owner_id })
    .select('-__v')
    .lean()
    .then(orders => orders)
    .catch(err => []);

exports.getOne = (_id) => Order.findOne({ _id })
    .select('-__v')
    .lean()
    .then(orders => orders)
    .catch(err => null);

exports.createOrder = (order) => Order.create(order)
    .then(order => order)
    .catch(err => {
        console.log(err);
        const error = {};

        if (err.name == 'ValidationError') {

            error.message = 'Order Validation Error';
            error.errors = {};

            const keys = Object.keys(err.errors);

            keys.forEach(key => {

                if (err.errors[key].properties) {

                    error.errors[key] = err.errors[key].properties.message;

                } else {

                    error.errors[key] = 'Invalid data type';

                }

            });

        }
        else {

            error.message = err.name;

        }

        throw error;
    });