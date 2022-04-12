const User = require('../models/User');

exports.register = async(email, username, password) => {
    User.create({email, username, password})
        .then(user => {

        })
        .catch(err => {
            const errors = err.errors;

            const response = {};
        })
}

exports.login = (email, password) => {
    
}