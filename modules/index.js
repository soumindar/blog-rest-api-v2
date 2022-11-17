const express = require('express');
const router = express.Router();
const authRouter = require('../modules/auth/auth.route');
const categoryRouter = require('../modules/category/category.route');
const postRouter = require('../modules/post/post.route');
const usersRouter = require('../modules/users/users.route');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/auth', authRouter);
router.use('/category', categoryRouter);
router.use('/post', postRouter);
router.use('/users', usersRouter);


module.exports = router;