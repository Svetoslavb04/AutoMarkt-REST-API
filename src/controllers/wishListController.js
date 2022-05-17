const router = require('express').Router();

const { create, remove, get } = require('../services/wishListService');
const { Authenticated } = require('../middlewares/authMiddleware');

router.get('/', Authenticated, async (req, res) => {

    try {

        const wishList = await get(req.user._id);

        res.json({ status: 200, wishList: wishList?.items ? wishList.items : [] });

    } catch (error) {

        res.status(400).json({ status: 400, ...error });

    }

});

router.post('/create', Authenticated, async (req, res) => {

    const { items } = req.body;
    
    try {

        const wishList = await create({ owner_id: req.user._id, items: items });

        res.json({ status: 200, wishList: wishList.items });

    } catch (error) {

        res.status(400).json({ status: 400, ...error });

    }

});

router.delete('/remove', Authenticated, async (req, res) => {

    try {

        await remove(req.user._id);

        res.json({ status: 200, message: 'Wish list succesfully removed!' });

    } catch (error) {

        res.status(400).json({ status: 400, ...error });

    }

});

module.exports = router;
