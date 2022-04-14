const router = require('express').Router();

const { OnlyAuthenticated, OnlyIfCreator } = require('../middlewares/authMiddleware');
const s3 = require('../utils/s3Helper');

const { createProduct, getProduct, editProduct, deleteProduct, getAllProducts } = require('../services/productService');

router.post('/create', OnlyAuthenticated, (req, res) => {

    createProduct({ ...req.body, creator: req.user._id })
        .then(product => res.json(product))
        .catch(error => res.status(400).json({ status: 400, ...error }));

});

router.get('/:_id', (req, res) => {

    getProduct(req.params._id)
        .then(product => res.json(product))
        .catch(err => res.json(null));

});

router.put('/:_id/edit', OnlyAuthenticated, OnlyIfCreator, (req, res) => {

    editProduct({ _id: req.params._id, ...req.body })
        .then(product => res.json(product))
        .catch(error => res.status(400).json({ status: 400, ...error }));

});

router.delete('/:_id', OnlyAuthenticated, OnlyIfCreator, (req, res) => {

    deleteProduct(req.params._id)
        .then(product => {
            console.log(product);
            res.json({ message: 'Product has been deleted' })
        })
        .catch(error => res.status(400).json({ status: 400, ...error }));

});

router.get('/imageUploadUrl', async (req, res) => {

    s3.generateUploadUrl()
        .then(awsUrl => res.json({ awsUrl }))
        .catch(err => res.status(500).json({ status: 500, message: err.name }));

});

router.get('/', (req, res) => {

    getAllProducts()
        .then(products => res.json(products))
        .catch(err => []);
        
})

module.exports = router;