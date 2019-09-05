const express = require("express");
const user = require("./controllers/user");

const router = express.Router();

router.get('/', user.home);
router.post('/register', user.register);
router.post('/login', user.login);
router.post('/logout', user.logout);

module.exports = router;
