const router = require('express').Router();

const { Authenticated, Creator } = require('../middlewares/authMiddleware');
const s3 = require('../utils/s3Helper');

const { createProduct, getProduct, editProduct, deleteProduct, getAllProducts, getAllProductsByCategory } = require('../services/productService');

router.post('/create', Authenticated, (req, res) => {

    createProduct({ ...req.body, creator: req.user._id })
        .then(product => res.json(product))
        .catch(error => res.status(400).json({ status: 400, ...error }));

});

router.get('/', (req, res) => {

    if (req.query.category) {

        return getAllProductsByCategory(req.query.category)
            .then(products => res.json(products))
            .catch(err => []);

    }

    getAllProducts()
        .then(products => res.json(products))
        .catch(err => []);

})

router.get('/:_id', (req, res) => {

    getProduct(req.params._id)
        .then(product => res.json(product))
        .catch(err => res.json(null));

});

router.put('/:_id/edit', Authenticated, Creator, (req, res) => {

    editProduct({ _id: req.params._id, ...req.body })
        .then(product => res.json(product))
        .catch(error => res.status(400).json({ status: 400, ...error }));

});

router.delete('/:_id', Authenticated, Creator, (req, res) => {

    deleteProduct(req.params._id)
        .then(product => {
            console.log(product);
            res.json({ message: 'Product has been deleted' })
        })
        .catch(error => res.status(400).json({ status: 400, ...error }));

});

router.get('/imageUploadUrl', Authenticated, (req, res) => {

    s3.generateUploadUrl()
        .then(awsUrl => res.json({ awsUrl }))
        .catch(err => res.status(500).json({ status: 500, message: err.name }));

});

module.exports = router;