const bcrypt = require('bcrypt');
const tokenHelper = require('../utils/tokenHelper');

const User = require('../models/User');

exports.register = async (email, username, password) => User.create({ email, username, password })
    .then(user => { return { email: user.email, username: user.username, _id: user._id } })
    .catch(err => {

        const error = {};

        if (err.name == 'ValidationError') {

            error.message = 'User Validation Error';
            error.errors = {};

            const keys = Object.keys(err.errors);

            keys.forEach(key => {

                if (err.errors[key].properties) {

                    error.errors[key] = err.errors[key].properties.message;

                } else {

                    error.errors[key] = 'Invalid data type';

                }

            });

        } else if (err.name == 'MongoServerError') {

            error.message = 'Existing email or username';

        }
        else {

            error.message = err.name;
        }

        throw error;
    });

exports.login = async (email, password) => {

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user == null) {

        throw {
            message: "Email or password does not match"
        };

    }
    
    const userMinified = {
        email: user.email,
        username: user.username,
        _id: user._id,
    };

    if (user) {

        const isValid = await bcrypt.compare(password, user.password);

        if (isValid) {

            const xToken = await tokenHelper.signAccessToken(userMinified);

            return {
                ...userMinified,
                xToken,
            };

        } else {

            throw {
                message: "Email or password does not match"
            };

        }
    } else {

        throw {
            message: "Email or password does not match"
        };

    }
}

exports.verifyAccessToken = (token) => tokenHelper.verifyAccessToken(token);