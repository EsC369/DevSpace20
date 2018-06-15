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

module.exports = router;
