const User = require('../models/User');

const jwt = require('jsonwebtoken');
const secret = require('../config/env-variables.json')[process.env.NODE_ENV].SECRET;
const bcrypt = require('bcrypt');
const util = require('util');

const signJWTPromisified = util.promisify(jwt.sign);
const verifyJWTPromisified = util.promisify(jwt.verify);



exports.register = async (email, username, password) => {
    return User.create({ email, username, password })
        .then(user => { return { email: user.email, username: user.username, _id: user._id } })
        .catch(err => {
            const error = {};

            if (err.name == 'ValidationError') {
                error.type = 'User Validation Error';
                error.errors = {};

                const keys = Object.keys(err.errors);

                keys.forEach(key => {
                    error.errors[key] = err.errors[key].properties.message;
                });

            } else if (err.name == 'MongoServerError') {
                error.type = 'Existing email or username';
            }
            else {
                error.type = err.name;
            }

            throw error;
        })
}

exports.login = async (email, password) => {

    user = await User.findOne({ email });
    
    if (user) {

        const areEqual = await bcrypt.compare(password, user.password);

        if (areEqual) {

            const token = await signJWTPromisified(
                {
                    email: user.email,
                    username: user.username,
                    _id: user._id
                }
                , secret,
                {
                  expiresIn: '1d'  
                });

            return {
                email: user.email,
                username: user.username,
                _id: user._id,
                xToken: token
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