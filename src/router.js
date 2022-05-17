const router = require('express').Router();

const userController = require('./controllers/userController');
const vehicleController = require('./controllers/vehicleController');
const shoppingCartController = require('./controllers/shoppingCartController');
const wishListController = require('./controllers/wishListController');

router.use(userController);
router.use('/vehicles', vehicleController);
router.use('/shoppingCart', shoppingCartController);
router.use('/wishList', wishListController);
router.all('*', (req, res) => res.status(404).json('Endpoint not found!'));

module.exports = router;