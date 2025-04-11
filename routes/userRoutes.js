const express = require('express');
const router = express.Router();
const usersController = require('../controllers/userControllers')

router.route('/')
.get(usersController.getAllUsers)
.post(usersController.createUsers)
.patch(usersController.updateUsers)
.delete(usersController.deleteUsers)

module.exports = router;