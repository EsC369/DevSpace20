// Imports:
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");
const passport = require("passport");

// Body Parser Middleware:
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Passport Middleware:
app.use(passport.initialize());

// Passport Config:
require("./config/passport.js")(passport);

// Connect To MongoDB:
mongoose.connect("mongodb://localhost/DevSpace", function(err){
  if(err) {
      console.log("Error: Mongo Wasnt Connected because of: ", err);
  }
  else {
      console.log("MongoDB Connected");
  }
});

// Use Routes:
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

// Listening
const port = 5000
app.listen(port, () => console.log(`Server Running on port ${port}`));