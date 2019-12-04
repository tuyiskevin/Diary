const express = require("express");
const user = require("./controllers/user");
const posting = require('./controllers/postController');

const router = express.Router();

router.get('/', user.home);
router.post('/register', user.register);
router.post('/login', user.login);
router.post('/logout', user.logout);

//post related
router.get('/create-post',user.loggedIn, posting.view);
router.post('/create-post', user.loggedIn, posting.createPost);
router.get('/post/:id', posting.viewPost);

//profile
router.get('/profile/:username', user.userExists, user.postScreen);


module.exports = router;
