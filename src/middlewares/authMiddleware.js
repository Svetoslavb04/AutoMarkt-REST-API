const { refresh_xToken, verifyAccessToken } = require('../services/authService');

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
                maxAge: Number(process.env.tokenExpirationIn) * 1000
            });
            
            req.user = await verifyAccessToken(xToken);
            req.isAuthenticated = true;

            next();

        } catch (error) {
            return res.status(error.status).json(error);

        }
    }
}