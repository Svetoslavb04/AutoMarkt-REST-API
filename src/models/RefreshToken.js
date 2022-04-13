const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        unique: true,
        required: [true, 'Token is required']
    },
    expireAt: {
        type: Date,
        expires: 1,
        required: [true, 'Expiration date is required']
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
    }
});

refreshTokenSchema.virtual('IsExpired').get(function () {
    return this.expireAt.getTime() < new Date().getTime();
});

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;