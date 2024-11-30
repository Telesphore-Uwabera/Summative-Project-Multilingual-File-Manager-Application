// routes/index.js

const express = require('express');
const router = express.Router();

// Example route for multilingual support
router.get('/example', (req, res) => {
  res.json({ message: req.t('welcome') }); // The 'welcome' key will be translated based on the user's language
});

module.exports = router;
