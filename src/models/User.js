const mongoose = require('mongoose');

const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required']
    },
    username: {
        type: String,
        unique: true,
        required: [true, 'Username is required'],
        minlength: [3, 'Username too short! (It should be at least 3 symbols)']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password too weak! (It should be at least 8 symbols)']
    }
});

userSchema
    .path('email')
    .validate(
        (value) => validator.isEmail(value)
        , 'Invalid email'
    );

userSchema
    .pre('save', function(next) {

        const trimmedEmail = validator.trim(this.email);
        const escapedEmail = validator.escape(trimmedEmail);
        const normalizedEmail = validator.normalizeEmail(escapedEmail);
        this.email = normalizedEmail;

        this.username = validator.escape(this.username);

        this.password = validator.escape(this.password);
        this.password = validator.trim(this.password);
        bcrypt.hash(this.password, 10)
            .then(hash => {
                this.password = hash;
                next();
            });
    });

const User = mongoose.model('User', userSchema);

module.exports = User;