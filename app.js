const express = require('express');
const router = require('./router');
const session = require('express-session');
const mongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');

let sessionOptions = session({
    secret:"New way to think",
    store:new mongoStore({client: require('./db')}),
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:36000*24,
        httpOnly: true
    }
});

const app = express();
app.use(sessionOptions);
app.use(flash());

app.use(function(req,res,next){
    res.locals.user = req.session.user;
    next();
});

app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(express.static('public'));

app.set('views', 'views');
app.set('view engine', 'ejs');

app.use('/', router);

module.exports = app;