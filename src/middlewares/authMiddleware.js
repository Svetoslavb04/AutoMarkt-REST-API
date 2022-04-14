const { refresh_xToken, verifyAccessToken } = require('../services/authService');
const { getProduct } = require('../services/productService');

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

            return res.status(401).json(error);

        }
    }
}

exports.OnlyIfCreator = async (req, res, next) => {

    const product = await getProduct(req.params._id);

    if (!product) {

        return res.status(400).json({ status:400, message: 'Invalid product' });

    }

    if (req.user._id == product.creator) {

        req.product = product;

        next();

    } else {

        res.status(403).json({
            status: 403,
            message: 'Unauthorized'
        });
    }
}