const router = require('express').Router();

const userController = require('./controllers/userController');

router.use('/user', userController);

module.exports = router;