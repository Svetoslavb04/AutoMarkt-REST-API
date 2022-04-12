const router = require('express').Router();

const { register, login } = require('../services/userService');

router.post('/register', async (req, res) => {
    const { email, username, password} = req.body;

    const user = await register(email, username, password);
});

router.post('/login', async (req, res) => {
    const { email, password} = req.body;

    const token = await login(email, password);
});

module.exports = router;
