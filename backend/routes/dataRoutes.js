const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// Deep fetch
router.get('/data/:userId', dataController.getAllData);

// Groups
router.post('/groups', dataController.addGroup);
router.put('/groups/:id', dataController.updateGroup);
router.delete('/groups/:id', dataController.deleteGroup);

// Categories
router.post('/categories', dataController.addCategory);
router.put('/categories/:id', dataController.updateCategory);
router.delete('/categories/:id', dataController.deleteCategory);

// Products
router.post('/products', dataController.addProduct);
router.put('/products/:id', dataController.updateProduct);
router.delete('/products/:id', dataController.deleteProduct);

module.exports = router;
