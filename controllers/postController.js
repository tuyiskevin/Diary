const Post = require('../Models/Post');


exports.view = function(req, res){
        res.render('create-post');
};

exports.createPost = function(req, res){
        let post = new Post(req.body, req.session.user._id);

        post.create().then(function(){
                res.send("New Post created");
        }).catch(errors => res.send(errors));
};

exports.viewPost = async function(req, res){
       try {
        let post = await Post.singlePostId(req.params.id);
        res.render('postTemplate',{post:post});
       } catch(err) {
        res.render('404'); 
       }

};

