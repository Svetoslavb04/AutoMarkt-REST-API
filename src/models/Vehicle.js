const mongoose = require('mongoose');

const validator = require('validator');

const vehicleSchema = new mongoose.Schema({
    make: {
        type: String,
        required: [true, 'Make is required'],
        minlength: [2, 'Make too short! (It should be at least 2 symbols)'],
        maxlength: [99, 'Make too long! (It should be max 99 symbols)'],
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Model is required'],
        minlength: [2, 'Model too short! (It should be at least 2 symbols)'],
        maxlength: [99, 'Model too long! (It should be max 99 symbols)'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        minlength: [10, 'Description too short! (It should be at least 10 symbols)'],
        maxlength: [3000, 'Description too long! (It should be max 3000 symbols)'],
        trim: true
    },
    mileage: {
        type: Number,
        required: [true, 'Mileage is required'],
        min: [0, 'Mileage cannot be less than 0'],
        max: [9999999, 'Mileage cannot be more than 9999999'],
    },
    year: {
        type: Number,
        required: [true, 'Year is required'],
        min: [1900, 'Year cannot be less than 1900'],
        max: [new Date().getFullYear(), `Date cannot be greater than ${new Date().getFullYear()}`]
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
        min: [0, 'Price cannot be less than 0'],
        max: [999999999, 'Price cannot be greater than 999999999']
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
    },
    postedOn: {
        type: Number
    }
});

vehicleSchema.index({ "$**": "text" });

vehicleSchema
    .path('VIN')
    .validate(
        (value) => /^[A-HJ-NPR-Z0-9]{16,17}$/.test(value)
        , 'Invalid VIN Number'
    );

vehicleSchema
    .path('imageUrl')
    .validate(
        (value) => validator.isURL(value)
        , 'Invalid image url'
    );

vehicleSchema
    .pre('save', function (next) {

        this.postedOn = Number(new Date().getTime());

        next();
    });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = Vehicle;