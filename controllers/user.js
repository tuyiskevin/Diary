
const User = require("../Models/User");
const Post  = require("../Models/Post");

exports.loggedIn = function (req, res, next){
    if(req.session.user){
        next();
    }else{
      req.flash('errors', "Need to be Logged in");
      req.session.save(function(){
         res.redirect('/');
      });
    }
}; 


exports.login = function(req,res){
  
  let user = new User(req.body);
  user.login().then((result)=>{
    req.session.user = {avatar:user.avatar,username:user.data.username, _id:user.data._id};
    req.session.save(()=>{
       res.redirect('/');
    });
  }).catch((err)=>{
      req.flash('errors', err);
      req.session.save(()=>{
        res.redirect('/');
      });
     
  });

};

exports.logout = function(req,res){
  req.session.destroy(()=>{
     res.redirect('/');
  });
  
};


exports.register = function(req,res){
  let user = new User(req.body);
    user.register().then(()=>{
      req.session.user = {avatar:user.avatar,username: user.data.username};
      req.session.save(()=>{
        res.redirect('/');
      });
      
    }).catch((regErrors)=>{
      regErrors.forEach(err=>{
        req.flash('regErrors',err);
      });
        req.session.save(()=>{
           res.redirect('/');
        });
    });

};

exports.home = function(req,res){ 
    if(req.session.user){
        res.render('home-dashboard');
    }else{
      res.render('home-guest', {errors: req.flash('errors'), regErrors: req.flash('regErrors')});
    }
};

exports.userExists = function(req, res, next){
  User.findByUsername(req.params.username).then((userDocument)=>{
      req.profileUser = userDocument;
      next();
  }).catch(()=>{
      res.render('404');
  });
};

exports.postScreen = function(req, res){
  //get Posts
  Post.fetchPosts(req.profileUser._).then((posts)=>{
    res.render('profile-posts', {
      posts:posts,
      profileUsername: req.profileUser.username,
      profileAvatar:req.profileUser.avatar
    });

  }).catch(()=>{
    res.render('404');
  });
    
};