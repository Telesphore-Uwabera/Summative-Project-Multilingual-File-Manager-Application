const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');  // Import the authMiddleware
const User = require('../models/User');  // Import the User model for database interaction
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

// @route PUT /profile
// @desc Update the profile of the logged-in user (e.g., name, email, preferred language)
// @access Private (auth required)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    // Extract the fields to be updated from the request body
    const { name, email, language } = req.body;

    // Ensure that the user is passing at least one field to update
    if (!name && !email && !language) {
      return res.status(400).json({ msg: 'Please provide at least one field to update' });
    }

    // Find the user and update their profile
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update the user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (language) user.language = language;

    // Save the updated user object
    await user.save();

    // Send the updated user profile as response
    res.json({ msg: 'Profile updated successfully', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
