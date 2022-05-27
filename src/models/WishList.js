const mongoose = require('mongoose');

const wishListSchema = new mongoose.Schema({
    owner_id: {
        type: [mongoose.Types.ObjectId, 'Owner _id should be Object Id'],
        ref: 'User',
        required: [true, 'Owner _id is required']
    },
    items: {
        type: [String],
        required: [true, 'Items are required'],
    },
});

const WishList = mongoose.model('WishList', wishListSchema);

module.exports = WishList;