const Product = require('../models/Product');

exports.createProduct = (product) => Product.create(product)
    .then(product => {
        return {
            _id: product._id,
            brand: product.brand,
            model: product.model,
            description: product.description,
            serialNumber: product.serialNumber,
            category: product.category,
            price: product.price,
            imageUrl: product.imageUrl,
            creator: product.creator
        };
    })
    .catch(err => {

        const error = {};

        if (err.name == 'ValidationError') {

            error.message = 'Product Validation Error';
            error.errors = {};

            const keys = Object.keys(err.errors);

            keys.forEach(key => {

                if (err.errors[key].properties) {

                    error.errors[key] = err.errors[key].properties.message;

                } else {

                    error.errors[key] = 'Invalid data type';

                }

            });

        } else if (err.name == 'MongoServerError') {

            error.message = 'Existing product';

        }
        else {

            error.message = err.name;

        }

        throw error;
    });

exports.getAllProducts = () => Product.find().select('-__v').lean()
    .then(products => products)
    .catch(err => []);

exports.getAllProductsByCategory = (category) => Product.find({ category : { '$regex': new RegExp(category, 'i')}}).select('-__v').lean()
    .then(products => products)
    .catch(err => []);

exports.getProduct = (_id) => Product.findById(_id).select('-__v').lean()
    .then(product => product)
    .catch(err => null);

exports.editProduct = (product) => Product.findByIdAndUpdate(
    product._id, product,
    {
        runValidators: true,
        new: true
    })
    .then(product => product)
    .catch(err => {

        const error = {};

        if (err.name == 'ValidationError') {

            error.message = 'Product Validation Error';
            error.errors = {};

            const keys = Object.keys(err.errors);

            keys.forEach(key => {

                if (err.errors[key].properties) {

                    error.errors[key] = err.errors[key].properties.message;

                } else {

                    error.errors[key] = 'Invalid data type';

                }

            });

        } else if (err.name == 'MongoServerError') {

            error.message = 'Existing product';

        }
        else {

            error.message = err.name;

        }

        throw error;
    });

exports.deleteProduct = (_id) => Product.findByIdAndDelete(_id)
    .then(product => {
        if (product == null) {
            throw Error;
        }
    })
    .catch(err => {
        throw {
            message: 'Invalid Product'
        }
    })