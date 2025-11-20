const express = require('express');
const router = express.Router();
const verifyUser = require('../middlewares/verifyUser')

// Sample route: GET /api/users
router.get('/', (req, res) => {
  res.json({ message: 'List of users' });
});

// Sample route: POST /api/users


// Export the router
module.exports = router;
