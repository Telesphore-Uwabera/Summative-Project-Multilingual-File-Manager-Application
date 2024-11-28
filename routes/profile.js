const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');  // Import the authMiddleware

const router = express.Router();

// @route GET /profile
// @desc Get the profile of the logged-in user
// @access Private (auth required)
router.get('/profile', authMiddleware, (req, res) => {
  try {
    // Return the user's profile (excluding sensitive data like password)
    const { password, ...userProfile } = req.user.toObject();
    res.json(userProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
