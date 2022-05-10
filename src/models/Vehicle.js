const mongoose = require('mongoose');

const validator = require('validator');

const vehicleSchema = new mongoose.Schema({
    make: {
        type: String,
        required: [true, 'Make is required'],
        minlength: [2, 'Make too short! (It should be at least 2 symbols)'],
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Model is required'],
        minlength: [2, 'Model too short! (It should be at least 2 symbols)'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        minlength: [10, 'Description too short! (It should be at least 10 symbols)'],
        trim: true
    },
    mileage: {
        type: Number,
        required: [true, 'Mileage is required'],
        min: [0, 'Mileage cannot be less than 0'],
    },
    year: {
        type: Number,
        required: [true, 'Year is required'],
        min: [1900, 'Year cannot be less than 1900'],
        max: [Date.now.year, `Date cannot be greater than ${Date.now.year}`]
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['Motorcycle', 'ATV', 'Snowbike', 'Car', 'Truck'],
            message: 'Invalid value: {VALUE}. Available values are: Motorcycle, ATV, Snowbike, Car, Truck'
        }
    },
    VIN: {
        type: String,
        required: [true, 'VIN is required'],
        unique: [true, 'Existing VIN'],
        minlength: [16, 'Invalid VIN'],
        maxLength: [17, 'Invalid VIN']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be less than 0']
    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required'],
        trim: true
    },
    publisherId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Publisher id is required'],
        trim: true
    }
});

vehicleSchema
    .path('imageUrl')
    .validate(
        (value) => validator.isURL(value)
        , 'Invalid image url'
    );

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;