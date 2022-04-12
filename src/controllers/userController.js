const router = require('express').Router();

const { register, login } = require('../services/userService');

router.post('/register', async (req, res) => {
    const { email, username, password} = req.body;

    try {
        const user = await register(email, username, password);
        res.json(user);
    } catch (error) {
        res.json(error);
    }

});

router.post('/login', async (req, res) => {
    const { email, password} = req.body;

    const token = await login(email, password);
});

module.exports = router;
