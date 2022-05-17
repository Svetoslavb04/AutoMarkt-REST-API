const ShoppingCart = require('../models/ShoppingCart');

exports.get = (owner_id) => ShoppingCart.findOne({ owner_id })
    .then(shoppingCart => shoppingCart)
    .catch(err => { return { items: [] } });

exports.create = (shoppingCart) => ShoppingCart.create(shoppingCart)
    .then(shoppingCart => shoppingCart)
    .catch(err => {
        
        const error = {};

        if (err.name == 'ValidationError') {

            error.message = 'ShoppingCart Validation Error';
            error.errors = {};

            const keys = Object.keys(err.errors);

            keys.forEach(key => {

                if (err.errors[key].properties) {

                    error.errors[key] = err.errors[key].properties.message;

                } else {

                    error.errors[key] = 'Invalid data type';

                }

            });

        } else {

            error.message = err.name;

        }

        throw error;
    });

exports.remove = (owner_id) => ShoppingCart.findOneAndDelete({ owner_id })
    .catch(err => {
        throw 'Failed to remove shopping cart!';
    })