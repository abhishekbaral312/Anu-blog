//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const multer = require("multer");
const methodOverride = require("method-override");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.static("public/images"));
app.use(methodOverride('_method'));

mongoose.connect("mongodb+srv://admin-abhishek:abhishek@cluster0.eqx3v.mongodb.net/blogDB", {useNewUrlParser: true});

// ---------------------------------------------------SCHEMA----------------------------------------------------//
const storage = multer.diskStorage({
  destination: function(req,file,cb){
    cb(null,'./public/images');
  },
  filename: function(req, file, cb){
    cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname);
  }
});

const upload = multer({
  storage:storage
}).single("postImage");


const postSchema = {
  title: String,
  content: String,
  date:{type: Date, default: Date.now},
  image: String
};
const headSchema = {
  content: String
};

const Post = mongoose.model("Post", postSchema);
const Heading = mongoose.model("Heading",headSchema);


//----------------------------------------------GET-------------------------------------------//
app.get("/",function (req,res)  {
     Post.find({}, function(err, posts){
       Heading.find({},function(err,headings){
         res.render("home", {
           posts: posts,
           headings: headings
         });
       });
     }).sort({$natural: -1}).limit(6);
});
app.get("/about",function(req,res){

});
app.get("/admin",function(req,res){
  Post.find({}, function(err, posts){
  res.render("admin",{
    posts: posts
  });
 });
});

app.get("/compose",function(req,res){
  res.render("compose");
});

app.get("/composehead",function(req,res){
  Heading.find({},function(err,headings){
    res.render("composehead", {
      headings: headings
    });
  }).limit(1);
});

app.get("/posts/:postId",function(req,res){
  // const requestedTitle = _.lowerCase(req.params.postName);
  const requestedPostId = req.params.postId;
  Post.findOne({_id: requestedPostId}, function(err, post){

   res.render("post", {
     title: post.title,
     content: post.content,
     image:post.image
   });

 });
 // posts.forEach(function(post){
 //   const storedTitle = _.lowerCase(post.title);
 //
 //   if (storedTitle === requestedTitle){
 //     res.render("post", {
 //       title: _.capitalize(post.title),
 //       content:post.content
 //     })
 //   }
 // })
});

app.get("/topic",function(req,res){
  Post.find({}, function(err, posts){
    res.render("topic",{
      posts: posts
    });
});
});

//------------------------------------------------POST-----------------------------------//

app.post("/compose",upload, function(req, res){
  const post = new Post ({
    title: _.capitalize(req.body.postTitle),
    content: req.body.postBody,
    image: req.file.filename
  });

  post.save();
  res.redirect("/");
});

app.post("/update",function(req,res){
  Heading.findByIdAndUpdate(req.body.checkbox,{content: req.body['headBody']},function(err){
    if(!err){
      console.log("updated successfully");
    }
  });
  res.redirect("/");
});

app.post("/delete",function(req,res){
  Post.findByIdAndRemove(req.body.checkbox,function(err){
    if(!err){
      console.log("successfully deleted");
    }
  });
  res.redirect("/admin");
});
//----------------------------------------------------------------------------------------//



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
