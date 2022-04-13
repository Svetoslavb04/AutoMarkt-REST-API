const User = require('../models/User');

const bcrypt = require('bcrypt');
const authService = require('../utils/jsonwebtokenHelper');

exports.register = async (email, username, password) => {
    return User.create({ email, username, password })
        .then(user => { return { email: user.email, username: user.username, _id: user._id } })
        .catch(err => {
            const error = {};

            if (err.name == 'ValidationError') {
                error.message = 'User Validation Error';
                error.errors = {};

                const keys = Object.keys(err.errors);

                keys.forEach(key => {
                    error.errors[key] = err.errors[key].properties.message;
                });

            } else if (err.name == 'MongoServerError') {
                error.message = 'Existing email or username';
            }
            else {
                error.message = err.name;
            }

            throw error;
        })
}

exports.login = async (email, password) => {

    const user = await User.findOne({ email });
    console.log(user);
    const userMinified = {
        email: user.email,
        username: user.username,
        _id: user._id,
    };

    if (user) {
        const areEqual = await bcrypt.compare(password, user.password);

        if (areEqual) {
            const accessToken = await authService.signAccessToken(userMinified);

            const refreshToken = await authService.signRefreshToken(userMinified);

            return {
                ...userMinified,
                accessToken,
                refreshToken
            };

        } else {

            throw {
                message: "Email or password does not match"
            }
        }
    } else {
        throw {
            message: "Email or password does not match"
        }
    }
}