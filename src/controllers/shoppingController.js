const router = require('express').Router();

const { create, remove, get } = require('../services/shoppingCartService');
const { Authenticated } = require('../middlewares/authMiddleware');

router.get('/', Authenticated, async (req, res) => {

    try {

        const shoppingCart = await get(req.user._id);

        res.json({ status: 200, shoppingCart: shoppingCart?.items ? shoppingCart.items : [] });

    } catch (error) {

        res.status(400).json({ status: 400, ...error });

    }

});

router.post('/create', Authenticated, async (req, res) => {

    const { items } = req.body;
    
    try {
        
        const shoppingCart = await create({ owner_id: req.user._id, items: items });

        res.json({ status: 200, shoppingCart: shoppingCart.items });

    } catch (error) {

        res.status(400).json({ status: 400, ...error });

    }

});

router.delete('/remove', Authenticated, async (req, res) => {

    try {

        await remove(req.user._id);

        res.json({ status: 200, message: 'Shopping cart succesfully removed!' });

    } catch (error) {

        res.status(400).json({ status: 400, ...error });

    }

});

module.exports = router;
