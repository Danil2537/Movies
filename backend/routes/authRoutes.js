const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/users', register);
router.post('/sessions', login);

module.exports = router;
