// Imports:
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser")
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

// Body Parser Middleware:
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Connect To MongoDB:
mongoose.connect("mongodb://localhost/Dev-Face", function(err){
  if(err) {
      console.log("Error: Mongo Wasnt Connected because of: ", err);
  }
  else {
      console.log("MongoDB Connected");
  }
});

//Route:
app.get("/", (req, res) => res.send("hello"));

// Use Routes:
app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);

// Listening
const port = 8000;
app.listen(port, () => console.log(`Server Running on port ${port}`));