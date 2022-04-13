const bcrypt = require('bcrypt');
const tokenHelper = require('../utils/tokenHelper');

const User = require('../models/User');

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
        });
}

exports.login = async (email, password) => {

    const user = await User.findOne({ email });

    const userMinified = {
        email: user.email,
        username: user.username,
        _id: user._id,
    };

    if (user) {

        const isValid = await bcrypt.compare(password, user.password);

        if (isValid) {

            const accessToken = await tokenHelper.signAccessToken(userMinified);

            const refreshToken = await tokenHelper.signRefreshToken(userMinified);

            return {
                ...userMinified,
                accessToken,
                refreshToken
            };

        } else {

            throw {
                status: 401,
                message: "Email or password does not match"
            };
        }
    } else {

        throw {
            status: 401,
            message: "Email or password does not match"
        };
    }
}

exports.verifyAccessToken = (token) => tokenHelper.verifyAccessToken(token);

exports.refresh_xToken = (token) => tokenHelper.refresh_xToken(token);

exports.user = (token) =>
    jwt.verifyToken(token)
        .then(decoded => decoded);