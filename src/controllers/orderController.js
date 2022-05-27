const router = require('express').Router();

const { Authenticated, AuthInfo } = require('../middlewares/authMiddleware');
const { getAll, getOne, createOrder } = require('../services/orderService');

router.get('/', Authenticated, async (req, res) => {

    let orders = [];

    try {

        orders = await getAll(req.user._id);

    } catch (error) { }

    res.status(200).json({ status: 200, orders });

});

router.get('/:_id', async (req, res) => {

    let order = null;

    try {

        order = await getOne(req.params._id);

    } catch (error) { }

    res.json({ status: 200, order });

});

router.post('/', AuthInfo, async (req, res) => {

    const order = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        country: req.body.country,
        town: req.body.town,
        street: req.body.street,
        zip: req.body.zip,
        phone: req.body.phone,
        notes: req.body.notes,
    };

    if (req.user) { order.owner_id = req.user._id; }

    try {

        const createdOrder = await createOrder(order);

        delete createdOrder._doc.__v;
        
        return res.status(200).json({ status: 200, order: createdOrder })

    } catch (error) {
        
        res.status(400).json({ status: 400, ...error })

    }

});

module.exports = router