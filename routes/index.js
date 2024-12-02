// routes/index.js

const express = require('express');
const router = express.Router();

router.get('/example', (req, res) => {
  res.json({ message: req.t('welcome') }); 
});

module.exports = router;
