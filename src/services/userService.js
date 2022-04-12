const User = require('../models/User');

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

exports.login = (email, password) => {

}