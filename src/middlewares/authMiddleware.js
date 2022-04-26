const authConfig = require('../config/authConfig.json');

const { refresh_xToken, verifyAccessToken } = require('../services/authService');
const { getVehicle } = require('../services/vehicleService');

exports.Authenticated = async (req, res, next) => {

    const token = req.cookies['x-token'];

    try {

        req.user = await verifyAccessToken(token);
        req.isAuthenticated = true;

        next();

    } catch (error) {
        try {

            const xToken = await refresh_xToken(req.cookies['refreshToken']);

            res.cookie('x-token', xToken, {
                maxAge: Number(authConfig.ACCESS_TOKEN_EXPIRATION_IN_SECONDS) * 1000
            });

            req.user = await verifyAccessToken(xToken);
            req.isAuthenticated = true;

            next();

        } catch (error) {

            return res.status(401).json({ status: 401, ...error});

        }
    }
}

exports.Publisher = async (req, res, next) => {

    const vehicle = await getVehicle(req.params._id);

    if (!vehicle) {

        return res.status(400).json({ status:400, message: 'Invalid product' });

    }
    
    if (req.user._id == vehicle.publisherId) {

        req.vehicle = vehicle;

        next();

    } else {

        res.status(403).json({
            status: 403,
            message: 'Unauthorized'
        });
    }
}