const router = require('express').Router();

const authConfig = require('../config/authConfig.json');

const { register, login, verifyAccessToken } = require('../services/authService');
const { Authenticated } = require('../middlewares/authMiddleware');

router.post('/register', async (req, res) => {

    const { email, username, password } = req.body;

    try {

        const user = await register(email, username, password);
        res.json({ status: 200, user });

    } catch (error) {

        res.status(400).json({ status: 400, ...error });

    }
});

router.post('/login', async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {

        return res.status(400).json({ status: 400, message: 'Email and password are required' })

    }

    try {

        const user = await login(email, password);

        res.cookie('x-token', user.xToken, {
            maxAge: Number(authConfig.ACCESS_TOKEN_EXPIRATION_IN_SECONDS) * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV != "development",
            sameSite: 'lax',
            domain: 'automarkt-react-client.firebaseapp.com',
            path: '/'
        });

        const userMinified = {
            email: user.email,
            username: user.username,
            _id: user._id
        };

        res.json({ status: 200, user: userMinified});

    } catch (error) { res.status(401).json({ status: 401, ...error }); }
});

router.get('/logout', Authenticated, (req, res) => {

    res.clearCookie('x-token');

    res.status(200).json({ message: 'Logged out' })
})

router.get('/me', async (req, res) => {

    const xToken = req.cookies['x-token'];

    try {
        const decodedXToken = await verifyAccessToken(xToken);

        return res.json({
            status: 200,
            user: {
                email: decodedXToken.email,
                username: decodedXToken.username,
                _id: decodedXToken._id,
            }
        })

    } catch (error) { return res.status(401).json({ status: 401, message: 'You are not logged in! Please login.' }); }

});

module.exports = router;
