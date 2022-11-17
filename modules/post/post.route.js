const express = require('express');
const router = express.Router();
const jwtVerify = require('../auth/jwt');
const postValidator = require('./post.validator');
const postController = require('./post.service');

// use jwt verification
router.use(jwtVerify);

// get data
router.get('/', postValidator.queryData, postController.getData);

// get by id
router.get('/id/:id', postValidator.paramId, postController.getById);

// get by user
router.get('/user/:username', postValidator.paramUsername, postValidator.queryData, postController.getByUser);

// create post
router.post('/create', postValidator.createData, postController.createPost);

// update post
router.patch('/edit/:id', postValidator.paramId, postController.editPost);

// delete post
router.delete('/delete/:id', postValidator.paramId, postController.deletePost);

module.exports = router;