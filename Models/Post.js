const PostCollection = require('../db').db().collection('posts');
const ObjectID = require('mongodb').ObjectID;
const User = require('./User');

let Post= function(data, userId){
    this.data = data;
    this.errors = [];
    this.userId = userId;
};


Post.prototype.cleanUp = function() {

    if(typeof(this.data.title)!= "string"){
        this.data.title = "";}

    if(typeof(this.data.body)!= "string"){
            this.data.body = "";}
    //removing unsafe properties.

    this.data = {
        title: this.data.title.trim(),
        body: this.data.body.trim(),
        author: ObjectID(this.userId),
        createDate: new Date()

    };
};

Post.prototype.validatePost = function() {
    if(this.data.title== ""){
        this.errors.push("You must provide a title");
    }
    if(this.data.body== ""){
        this.errors.push("You must provide content for the post");
    }
};

Post.prototype.create = function() {
    return new Promise((resolve, reject)=>{
        this.cleanUp();
        this.validatePost();
        if(!this.errors.length){
            //save post
            PostCollection.insertOne(this.data).then(()=>{
                resolve();
            }).catch(()=>{
                this.errors.push("Please Try again later");
                reject(this.errors);
            });
            
        }else{
            reject(this.errors);
        }
    });
};

Post.getPost = function(operation){
    return new Promise(async function(resolve, reject){
       let aggOperations = operation.concat(
        [
            {$lookup:{from:"users", localField:"author", foreignField:"_id", as:"authorInfo"}},
            {$project:{
                title:1,
                body:1,
                createdDate:1,
                author: {$arrayElemAt:["$authorInfo", 0]}
            }} 
        ]
       );
        let posts = await PostCollection.aggregate(aggOperations).toArray(); //cleanup author property
        
        posts = posts.map(function(post){
            post.author ={
                username: post.author.username,
                avatar: new User (post.author, true).avatar
            };
            return post;
        });
        resolve(posts);
    });
};


Post.singlePostId = function(id){
    return new Promise(async function(resolve, reject){
        if(typeof(id)!='string' || !ObjectID.isValid(id)){
            reject();
            return;
        }
        let posts = await Post.getPost([
            {
                $match:{_id:new ObjectID(id)}
            }
        ]);

        if(posts.length){
            console.log(posts[0]);
            resolve(posts[0]);
        }else{
            reject();
        }
    });
};

Post.fetchPosts = function(authorId){
    return Post.getPost(
        [
            {$match:{author:authorId}},
            {$sort:{createdDate:-1}}
        ]
    );
};

module.exports =Post;