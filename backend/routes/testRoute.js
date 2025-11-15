const express = require('express');
const router = express.Router();

// Sample route: GET /api/users
router.get('/', (req, res) => {
  res.json({ message: 'List of users' });
});

// Sample route: POST /api/users
router.post('/', (req, res) => {
  const newUser = req.body; // Assume the user data is in the request body
  res.json({ message: 'User created', user: newUser });
});

// Export the router
module.exports = router;
