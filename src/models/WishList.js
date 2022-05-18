const mongoose = require('mongoose');

const wishListSchema = new mongoose.Schema({
    owner_id: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Owner _id is required']
    },
    items: {
        type: [String],
        required: [true, 'Items are required'],
    },
});

wishListSchema
    .pre('save', function (next) {

        WishList.deleteMany({ owner_id: this.owner_id })
            .then(() => {
                next();
            })

    });

wishListSchema
    .post('save', function (wishList) {

        if (wishList.items.length == 0) {

            WishList.deleteMany({ owner_id: wishList.owner_id }).exec();

        }

    });

const WishList = mongoose.model('WishList', wishListSchema);

module.exports = WishList;