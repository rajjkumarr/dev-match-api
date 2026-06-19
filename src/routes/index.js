const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const connectionRoutes = require('./connection.routes');
const chatRoutes = require('./chat.routes');
const userRoutes = require('./user.routes');

router.use('/auth', authRoutes);
router.use('/connections', connectionRoutes);
router.use('/chat', chatRoutes);
router.use('/users', userRoutes);

module.exports = router;
