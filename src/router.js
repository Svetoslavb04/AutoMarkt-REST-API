const router = require('express').Router();

const userController = require('./controllers/userController');
const productController = require('./controllers/vehicleController');

router.use(userController);
router.use('/vehicles', productController);
router.all('*', (req, res) => res.status(404).json('Endpoint not found!'));

module.exports = router;