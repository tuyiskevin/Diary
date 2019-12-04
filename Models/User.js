const bcrypt = require('bcryptjs');
const validator = require('validator');
const userCollection = require('../db').db().collection('users');
const md5 = require('md5');

//bluepting for a user
let User = function(data, getAvatar){
    this.data= data;
    this.err = [];

    if(getAvatar == undefined){getAvatar = false;}
    if (getAvatar){this.setAvatar();}

};

User.prototype.clean = function(){
    //in case the user type something other than string
  if (typeof(this.data.username) != "string") {this.data.username = "";}
  if (typeof(this.data.email) != "string") {this.data.email = "";}
  if (typeof(this.data.password) != "string") {this.data.password = "";}

  // get rid of spaces and unwanted properties
  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password
  };

};

User.prototype.validate = function(){
return new Promise(async (resolve, reject)=>{
    let username = this.data.username;
    let password = this.data.password;
    let email = this.data.email;
    

  if (username == "") {this.err.push("You must provide a username.");}
  if (username != "" && !validator.isAlphanumeric(username)) {this.err.push("Username can only contain letters and numbers.");}
  if (!validator.isEmail(email)) {this.err.push("You must provide a valid email address.");}
  if (password == "") {this.err.push("You must provide a password.");}
  if (password.length > 0 && password.length < 8) {this.err.push("Password must be at least 8 characters.");}
  if (password.length > 30) {this.err.push("Password cannot exceed 30 characters.");}
  if (username.length > 0 && username.length < 3) {this.err.push("Username must be at least 3 characters.");}
  if (username.length > 20) {this.err.push("Username cannot exceed 20 characters.");}

  /* after validation check if it's within the database */
  if(this.data.username.length>2 && this.data.username.length<31 && validator.isAlphanumeric(this.data.username)){
    let exisist = await userCollection.findOne({username:this.data.username});
    if(exisist){this.err.push("This username is already taken.");}
    
  }

  if(validator.isEmail(this.data.email)){
    let exisist = await userCollection.findOne({username:this.data.email});
    if(exisist){this.err.push("This email is in use.");}
  }
  resolve();
});
};

User.prototype.login = function(){
  return new Promise((resolve, reject)=>{

    this.clean();
    userCollection.findOne({username: this.data.username}).then((attempLogin)=>{
      if(attempLogin && bcrypt.compareSync(this.data.password, attempLogin.password)){
        this.data = attempLogin;
        this.setAvatar();
        resolve("You are signed in");
      }else{
        reject("Invalid user/password");
      }
    }).catch(()=>{
      reject("Please try again later"); //unforeseen error
    });

  });

};

User.prototype.register = function(){
  return new Promise(async (resolve, reject)=>{
    //validate user
    this.clean();
    await this.validate();
    //in case of err
  
    //store in database
    if(!this.err.length){
      let salt = bcrypt.genSaltSync(10);
      this.data.password = bcrypt.hashSync(this.data.password, salt);
      await userCollection.insertOne(this.data);
      this.setAvatar();
      resolve();
    }else{
      reject(this.err);
    }
  
  });
};

User.prototype.setAvatar = function(){
  this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`;
};

User.findByUsername = function(username){
return new Promise((resolve, reject)=>{
    if(typeof(username) != "string"){
      reject();
      return;
    }
    userCollection.findOne({username: username}).then((userDoc)=>{
      
        if(userDoc){
          userDoc = new User(userDoc, true);
          userDoc = {
            _id:userDoc.data._id,
            username:userDoc.data.username,
            avatar: userDoc.avatar
          };
          resolve(userDoc);
        }else{
            reject();
        }
    }).catch(()=>{
      reject();
    });
});
};

module.exports = User;