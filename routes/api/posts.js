const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load Post Model:
const Post = require("../../models/Post");
// Load Profile Model:
const Profile = require("../../models/Profile");
// Load Post Validation:
const validatePostInput = require("../../validation/post");

// @route   GET api/posts
// @desc    GET Posts
// @access  Public
router.get("/", (req, res) => {
  Post.find().sort({ date: -1 }).then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: "No Posts Found With That ID" }));
});

// @route   GET api/posts/:id
// @desc    GET Posts by ID
// @access  Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id).then(post => res.json(post))
    .catch(err => res.status(404).json({ nopostfound: "No Post Found With That ID" }));
});

// @route   GET api/posts
// @desc    Create Post
// @access  Private
router.post("/", passport.authenticate("jwt", { session: false }), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);
  // Check Validation:
  if (!isValid) {
    // If Any Errors, send 400 with error object
    return res.status(400).json(errors);
  }

  const newPost = new Post({
    text: req.body.text,
    name: req.body.name,
    avatar: req.body.avatar,
    user: req.user.id
  });
  newPost.save().then(post => res.json(post));
});

// @route   DELETE api/posts/:id
// @desc    DELETE post
// @access  Private
router.delete("/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id).then(post => {
      // Check For Post Owner:
      if(post.user.toString() !== req.user.id) { // check if post belongs to user that is logged in
        return res.status(401).json({ notauthorized: "User Is Not Authorized!"})  // Not Authorized status
      }
      // Delete:
      post.remove().then(() => res.json({ success: true }));
    })
    .catch(err => res.status(404).json({ postnotfound: "No Post Found" }));
  })
});

// @route   POST api/posts/like/:id
// @desc    Like post
// @access  Private
router.post("/like/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id).then(post => {
      // Check if user's ID has already liked said post, If greater than 0, then user has already liked it
      if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
        return res.status(400).json({ alreadyliked: "User Has Already Liked This Post" });
      }
      // Add User ID To Liked Array:
      post.likes.unshift({ user: req.user.id });
      //Save:
      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ postnotfound: "No Post Found" }));
  })
});

// @route   POST api/posts/unlike/:id
// @desc    Unlike post
// @access  Private
router.post("/unlike/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id).then(post => {
      // Check if user's ID has already liked said post, If greater than 0, then user has already liked it
      if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
        return res.status(400).json({ notliked: "You Have Not Yet Liked This Post" });
      }
      // Get The Remove Index:
      const removeIndex = post.likes
      .map(item => item.user.toString())
      .indexOf(req.user.id);

      //Splice It Out Of The Array:
      post.likes.splice(removeIndex, 1) // Removes 1 from the index
      // Save:
      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ postnotfound: "No Post Found" }));
  })
});

// @route   POST api/posts/comment/:id
// @desc    Add comment to post
// @access  Private
router.post("/comment/:id", passport.authenticate("jwt", { session: false }), (req, res) => {
  const { errors, isValid } = validatePostInput(req.body);
  // Check Validation:
  if (!isValid) {
    // If Any Errors, send 400 with error object
    return res.status(400).json(errors);
  }
  Post.findById(req.params.id)
  .then(post => {
    const newComment = {
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    };
    // Add To Comments Array:
    post.comments.unshift(newComment);
    // Save:
    post.save().then(post => res.json(post))
  })
  .catch(err => res.status(404).json({ postnotfound: "No Post Found" }));
});

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete comment from post
// @access  Private
router.delete("/comment/:id/comment_id", passport.authenticate("jwt", { session: false }), (req, res) => {
  Post.findById(req.params.id)
  .then(post => {
    // Check To See If The Comment Exists:
    // IF comment is equl to 0, then it doesnt exist:
    if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
      return res.status(404).json({ commentdoesntexist: "Comment Does Not Exist!" });
    }
    // If It Does Exist Then Remove Index:
    const removeIndex = post.comments
    .map(item => item._id.toString())
    .indexOf(req.params.comment_id);

    // Splice It Out OF Array:
    post.comment.splice(removeIndex, 1); // Removes 1 from index
    // Save:
    post.save().then(post => res.json(post));
  })
  .catch(err => res.status(404).json({ postnotfound: "No Post Found" }));
});

module.exports = router;
