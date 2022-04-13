const { refresh_xToken, verifyAccessToken } = require('../services/authService');

const config = require('../config/env-variables.json')[process.env.NODE_ENV];

exports.OnlyAuthenticated = async (req, res, next) => {

    const token = req.cookies['x-token'];

    try {
        
        req.user = await verifyAccessToken(token);
        req.isAuthenticated = true;

        next();

    } catch (error) {
        try {

            const xToken = await refresh_xToken(req.cookies['refreshToken']);

            res.cookie('x-token', xToken, {
                maxAge: config.tokenExpirationIn * 1000
            });
            
            req.user = await verifyAccessToken(xToken);
            req.isAuthenticated = true;

            next();

        } catch (error) {
            
            return res.status(error.status).json(error);

        }
    }
}

exports.isAuthenticated = (req, res, next) => {
    
}