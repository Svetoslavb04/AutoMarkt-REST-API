const mongoose = require('mongoose');

const validator = require('validator');

const productSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: [true, 'Brand is required'],
        minlength: [2, 'Brand too short! (It should be at least 3 symbols)']
    },
    model: {
        type: String,
        required: [true, 'Model is required'],
        minlength: [2, 'Model too short! (It should be at least 3 symbols)']
    },
    description: {
        type: Date,
        expires: 1,
        required: [true, 'Description is required'],
        minlength: [10, 'Description too short! (It should be at least 10 symbols)']
    },
    serialNumber: {
        type: String,
        unique: true,
        required: [true, 'Serial Number is required'],
        minlength: [10, 'Serial Number too short! (It should be at least 10 symbols)']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        minlength: [3, 'Category too short! (It should be at least 3 symbols)']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be less than 0']
    },
    imageUrl: {
        type: String,
        required: [true, 'Image is required']
    }
});

productSchema
    .path('imageUrl')
    .validate(
        (value) => validator.isURL(value)
        , 'Invalid image url'
    );

productSchema
    .pre('save', function(next) {

        this.brand = validator.escape(this.brand);
        this.model = validator.escape(this.model);
        this.description = validator.escape(this.description);
        this.serialNumber = validator.escape(this.serialNumber);
        this.category = validator.escape(this.category);
        this.price = validator.escape(this.price);

        next();
    });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;