const mongoose = require('mongoose');

const shoppingCartSchema = new mongoose.Schema({
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

shoppingCartSchema
    .pre('save', function(next) {
        
        ShoppingCart.deleteMany({ owner_id: this.owner_id })
            .then(() => {
                next();
            })

    });

const ShoppingCart = mongoose.model('ShoppingCart', shoppingCartSchema);

module.exports = ShoppingCart;