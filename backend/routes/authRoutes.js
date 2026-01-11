const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/user/update', authController.updateUser);
router.get('/user/:username', authController.getUser);

module.exports = router;
