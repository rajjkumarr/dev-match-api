const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const connectionRoutes = require('./connection.routes');

router.use('/auth', authRoutes);
router.use('/connections', connectionRoutes);

module.exports = router;
