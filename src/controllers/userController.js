const router = require('express').Router();

const { register, login, refreshToken } = require('../services/authService');

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

        res.cookie('x-token', user.accessToken, {
            maxAge: Number(process.env.ACCESS_TOKEN_EXPIRATION_IN_SECONDS) * 1000
        });
        res.cookie('refreshToken', user.refreshToken, {
            maxAge: Number(process.env.REFRESH_TOKEN_EXPIRATION_IN_SECONDS) * 1000,
            httpOnly: true
        });

        const userMinified = {
            email: user.email,
            username: user.username,
            _id: user._id,
        };

        res.json(userMinified);

    } catch (error) { res.status(401).json({ status: 401, ...error }); }
});

router.get('/refreshToken', async (req, res) => {

    const token = req.cookies['refreshToken'];

    try {
        const xToken = await refreshToken(token);

        return res.cookie('x-token', xToken, {
            maxAge: Number(process.env.ACCESS_TOKEN_EXPIRATION_IN_SECONDS) * 1000
        }).end();

    } catch (error) { return res.status(401).json({ status: 401, ...error }); }

});

module.exports = router;
