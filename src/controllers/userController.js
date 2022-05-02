const router = require('express').Router();

const authConfig = require('../config/authConfig.json');
const { register, login, refresh_xToken } = require('../services/authService');
const { Authenticated } = require('../middlewares/authMiddleware');

router.post('/register', async (req, res) => {

    const { email, username, password } = req.body;

    try {

        const user = await register(email, username, password);
        res.json(user);

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
        
        res.cookie('refreshToken', user.refreshToken, {
            maxAge: Number(authConfig.REFRESH_TOKEN_EXPIRATION_IN_SECONDS) * 1000,
            httpOnly: true
        });

        const userMinified = {
            email: user.email,
            username: user.username,
            _id: user._id,
            xToken: user.accessToken
        };

        res.json(userMinified);

    } catch (error) { res.status(401).json({ status: 401, ...error }); }
});

router.get('/logout', Authenticated, (req, res) => {
    res.clearCookie('refreshToken');
    res.clearCookie('x-token');
    res.status(200).json({ message: 'Logged out' })
})

router.get('/refreshToken', async (req, res) => {

    const token = req.cookies['refreshToken'];

    try {
        const xToken = await refresh_xToken(token);

        return res.json({ status: 200, xToken });

    } catch (error) { return res.status(401).json({ status: 401, ...error }); }

});

module.exports = router;
