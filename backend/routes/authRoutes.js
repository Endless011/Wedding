const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/user/update', authController.updateUser);
router.get('/user/:username', authController.getUser);
router.get('/users', authController.getAllUsers);
router.delete('/user/:username', authController.deleteUser);
router.get('/user/code/:friendCode', authController.getUserByFriendCode);

module.exports = router;
