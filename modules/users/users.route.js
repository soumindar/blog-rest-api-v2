const express = require('express');
const router = express.Router();
const jwtVerify = require('../auth/jwt');
const usersValidator = require('./users.validator');
const usersController = require('./users.service');

// use jwt verification
router.use(jwtVerify);

// get user data
router.get('/', usersController.getData);

// get user by username
router.get('/username/:username', usersValidator.username, usersController.getByUsername);

// update user data
router.patch('/update', usersValidator.updateData, usersController.updateUser);

// change password
router.patch('/change-password', usersValidator.newPass, usersController.changePass);

// delete user
router.delete('/delete', usersController.deleteUser);

module.exports = router;