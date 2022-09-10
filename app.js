//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const multer = require("multer");
const methodOverride = require("method-override");

const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

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
