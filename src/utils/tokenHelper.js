const jwt = require('jsonwebtoken');
const util = require('util');

const authConfig = require('../config/authConfig.json');

const signJWTPromisified = util.promisify(jwt.sign);
const verifyJWTPromisified = util.promisify(jwt.verify);

exports.signAccessToken = (user) =>
    signJWTPromisified(user, process.env.SECRET, {
        expiresIn: Number(authConfig.ACCESS_TOKEN_EXPIRATION_IN_SECONDS)
    })
        .then(token => token)
        .catch(err => null);

exports.verifyAccessToken = (token) => verifyJWTPromisified(token, process.env.SECRET)
    .then(decoded => decoded);