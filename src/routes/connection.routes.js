const express = require('express');
const router = express.Router();

const connectionController = require('../controllers/connection.controller');
const { protect } = require('../middleware/auth.middleware');

// POST /api/v1/connections/send
router.post('/send', protect, connectionController.sendRequest);

// GET /api/v1/connections/feed
router.get('/feed', protect, connectionController.getFeed);

// GET /api/v1/connections/requests/incoming
router.get('/requests/incoming', protect, connectionController.getIncomingRequests);

// PATCH /api/v1/connections/requests/:senderId/review
router.patch('/requests/:senderId/review', protect, connectionController.reviewRequest);

// GET /api/v1/connections/my-connections
router.get('/my-connections', protect, connectionController.getMyConnections);

module.exports = router;
