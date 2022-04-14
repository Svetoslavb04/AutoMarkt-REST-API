const router = require('express').Router();

const userController = require('./controllers/userController');
const productController = require('./controllers/productController');

router.use(userController);
router.use('/products', productController);

module.exports = router;