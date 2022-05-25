const { verifyAccessToken } = require('../services/authService');
const { getVehicle } = require('../services/vehicleService');

exports.Authenticated = async (req, res, next) => {

    const token = req.cookies['x-token'] || req.cookies['x-token-legacy'];
    
    try {

        req.user = await verifyAccessToken(token);
        req.isAuthenticated = true;

        next();

    } catch (error) {

        return res.status(401).json({ status: 401, message: 'Unauthorized' });

    }
}

exports.Publisher = async (req, res, next) => {

    const vehicle = await getVehicle(req.params._id);

    if (!vehicle) {

        return res.status(400).json({ status: 400, message: 'Invalid vehicle' });

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