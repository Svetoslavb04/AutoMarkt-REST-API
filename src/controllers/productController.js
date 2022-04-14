const router = require('express').Router();

const { OnlyAuthenticated } = require('../middlewares/authMiddleware');
const s3 = require('../utils/s3Helper');

router.get('/imageUploadUrl', OnlyAuthenticated, async (req, res) => {

    const awsUrl = await s3.generateUploadUrl();

    res.json({awsUrl});
})

module.exports = router;