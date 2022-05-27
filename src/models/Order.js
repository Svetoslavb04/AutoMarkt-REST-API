const mongoose = require('mongoose');

const { isName, isPhoneNumber, isZIP } = require('../utils/validator');

const validator = require('validator');

const orderSchema = new mongoose.Schema({
    owner_id: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    firstName: {
        type: String,
        required: [true, 'First Name is required'],
        minlength: [2, 'First Name too short! (It should be at least 2 symbols)'],
        maxlength: [747, 'First Name too long! (It should be max 747 symbols)'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last Name is required'],
        minlength: [2, 'Last Name too short! (It should be at least 2 symbols)'],
        maxlength: [747, 'Last Name too long! (It should be max 747 symbols)'],
        trim: true
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        minlength: [2, 'Country too short! (It should be at least 2 symbols)'],
        maxlength: [56, 'Country too long! (It should be max 56 symbols)'],
    },
    town: {
        type: String,
        required: [true, 'Town is required'],
        minlength: [2, 'Town too short! (It should be at least 2 symbols)'],
        maxlength: [85, 'Town too long! (It should be max 85 symbols)'],
    },
    street: {
        type: String,
        required: [true, 'Street is required'],
        minlength: [2, 'Street too short! (It should be at least 2 symbols)'],
        maxlength: [150, 'Street too long! (It should be max 150 symbols)'],
    },
    zip: {
        type: String,
        required: [true, 'Postal Code / ZIP is required'],
        minlength: [4, 'Postal Code / ZIP too short! (It should be at least 4 symbols)'],
        maxlength: [10, 'Postal Code / ZIP too long! (It should be max 10 symbols)'],
    },
    phone: {
        type: String,
        required: [true, 'Phone Number is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required']
    },
    notes: {
        type: String,
        maxlength: [200, 'Notes too long! (It should be max 200 symbols)'],
    },
    postedOn: {
        type: Number
    }
});

orderSchema
    .path('firstName')
    .validate(
        (value) => isName(value)
        , 'Invalid First Name'
    );

orderSchema
    .path('lastName')
    .validate(
        (value) => isName(value)
        , 'Invalid Last Name'
    );

orderSchema
    .path('zip')
    .validate(
        (value) => isZIP(value)
        , 'Invalid Postal Code / ZIP'
    );

orderSchema
    .path('phone')
    .validate(
        (value) => isPhoneNumber(value)
        , 'Invalid Phone Number'
    );

orderSchema
    .path('email')
    .validate(
        (value) => validator.isEmail(value)
        , 'Invalid email'
    );

orderSchema
    .pre('validate', function (next) {

        if (this.zip) {
            this.zip = this.zip.toUpperCase();
        }

        next();
    });

orderSchema
    .pre('save', function (next) {

        this.postedOn = Number(new Date().getTime());

        const trimmedEmail = validator.trim(this.email);
        const escapedEmail = validator.escape(trimmedEmail);
        const normalizedEmail = validator.normalizeEmail(escapedEmail);
        this.email = normalizedEmail;

        next();
    });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;