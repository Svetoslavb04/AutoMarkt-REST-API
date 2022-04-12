const router = require('express').Router();

const { register, login } = require('../services/userService');

router.post('/register', async (req, res) => {

    const { email, username, password } = req.body;

    try {

        const user = await register(email, username, password);
        res.json(user);

    } catch (error) {
        res.status(500).json(error);
    }
});

router.post('/login', async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(500).json({ message: 'Email and password are required' })
    }

    try {
        const user = await login(email, password);
        res.json(user);

    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;
