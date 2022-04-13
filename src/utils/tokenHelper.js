const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const util = require('util');

const signJWTPromisified = util.promisify(jwt.sign);
const verifyJWTPromisified = util.promisify(jwt.verify);

const RefreshToken = require('../models/RefreshToken');

exports.signAccessToken = (user) =>
    signJWTPromisified(user, process.env.SECRET, {
        expiresIn: Number(process.env.tokenExpirationIn)
    })
        .then(token => token)
        .catch(err => null);

exports.signRefreshToken = (user) => {

    const token = uuid.v4();

    let expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + Number(process.env.refreshtokenExpirationIn));

    RefreshToken.create({ token: token, expiryDate: expiration.getTime(), user: user._id });

    return token;

}

exports.verifyAccessToken = (token) => verifyJWTPromisified(token, process.env.SECRET)
    .then(decoded => decoded);

exports.refresh_xToken = (refreshToken = undefined) => {
    return RefreshToken.findOne({ token: refreshToken }).populate('user')
        .then(refreshTokenDocument => {
            
            if (!refreshTokenDocument) {
                throw {
                    status: 401,
                    message: 'Unauthorized'
                };
            }

            if (refreshTokenDocument.IsExpired) {
                return RefreshToken.findOneAndDelete({ _id: refreshTokenDocument._id })
                    .then(() => {
                        throw {
                            status: 401,
                            message: 'Token expired, please login'
                        };
                    })
                    .catch(err => {
                        throw err;
                    });
            }

            const userMinified = {
                email: refreshTokenDocument.user.email,
                username: refreshTokenDocument.user.username,
                _id: refreshTokenDocument.user._id,
            }

            return this.signAccessToken(userMinified)
                .then(token => token);
        });
}