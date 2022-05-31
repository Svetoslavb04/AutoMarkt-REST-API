const ShoppingCart = require('../models/ShoppingCart');

exports.get = (owner_id) => ShoppingCart.findOne({ owner_id })
    .then(shoppingCart => shoppingCart)
    .catch(err => { return { items: [] } });

exports.create = async (shoppingCart) => {

    if (shoppingCart.items?.length <= 0) {

        try {

            const deletedCart = await ShoppingCart.findOneAndDelete({ owner_id: shoppingCart.owner_id });

            return deletedCart || { items: [] };

        } catch (error) {
            
        }

    }

    try {

        const cart = await ShoppingCart.findOneAndUpdate(
            { owner_id: shoppingCart.owner_id },
            { items: shoppingCart.items },
            {
                new: true,
                upsert: true
            }
        );

        return cart;

    } catch (err) {
        
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
    }
}

exports.remove = (owner_id) => ShoppingCart.findOneAndDelete({ owner_id })
    .catch(err => {
        throw 'Failed to remove shopping cart!';
    });

exports.clearVehicleFromCarts = (_id) => {
    ShoppingCart.updateMany({}, { $pullAll: { items: [_id] } })
        .then(updatedCount => updatedCount)
        .catch(err => 0)
}