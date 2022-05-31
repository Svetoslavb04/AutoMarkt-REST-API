const WishList = require('../models/WishList');

exports.get = (owner_id) => WishList.findOne({ owner_id })
    .then(wishList => wishList)
    .catch(err => { return { items: [] } });

exports.create = async (wishList) => {

    if (wishList.items?.length <= 0) {

        try {

            const deletedList = await WishList.findOneAndDelete({ owner_id: wishList.owner_id });

            return deletedList || { owner_id: wishList.owner_id, items: [] };

        } catch (error) {

        }

    }

    try {

        const list = await WishList.findOneAndUpdate(
            { owner_id: wishList.owner_id },
            { items: wishList.items },
            {
                new: true,
                upsert: true
            }
        );

        return list;

    } catch (err) {

        const error = {};

        if (err.name == 'ValidationError') {

            error.message = 'WishList Validation Error';
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

exports.remove = (owner_id) => WishList.findOneAndDelete({ owner_id })
    .then(() => 'Wish list succesfully removed!')
    .catch(err => {
        throw 'Failed to remove wish list!';
    });

exports.clearVehicleFromWishLists = (_id) => {
    WishList.updateMany({}, { $pullAll: { items: [_id] } })
        .then(updatedCount => updatedCount)
        .catch(err => 0)
}