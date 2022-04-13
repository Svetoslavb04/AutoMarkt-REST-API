const jwt = require('jsonwebtoken');
const secret = require('../config/env-variables.json')[process.env.NODE_ENV].SECRET;
const util = require('util');

const signJWTPromisified = util.promisify(jwt.sign);
const verifyJWTPromisified = util.promisify(jwt.verify);

exports.signAccessToken = (user) =>
    signJWTPromisified(user, secret, {
        expiresIn: 1
    })
        .then(token => token)
        .catch(err => null)

exports.signRefreshToken = (user) =>
    signJWTPromisified(user, secret, {
        expiresIn: '1d'
    })
        .then(token => token)
        .catch(err => null)

exports.verifyToken = (token) =>
    verifyJWTPromisified(token)
        .then(decoded => decoded)
        .catch(err => err)