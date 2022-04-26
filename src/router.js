const router = require('express').Router();

const userController = require('./controllers/userController');
const productController = require('./controllers/vehicleController');

router.use(userController);
router.use('/vehicles', productController);

module.exports = router;