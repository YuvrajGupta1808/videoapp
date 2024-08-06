const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../helpers/auth");
const upload = require("../config/multer"); // Import multer configuration
const pool = require("../config/database"); // Import database configuration

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Home" });
});

/* GET login page. */
router.get("/login", function (req, res, next) {
  res.render("login", { title: "Login" });
});

/* GET registration page. */
router.get("/register", function (req, res, next) {
  res.render("registration", { title: "Register" });
});

// GET the post video form
router.get("/postvideo", ensureAuthenticated, (req, res) => {
  res.render("postvideo", { title: "Post Video" });
});

// POST a new video post
router.post("/postvideo", ensureAuthenticated, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      res.render("postvideo", { title: "Post Video", error_msg: err });
    } else {
      if (req.file == undefined) {
        res.render("postvideo", {
          title: "Post Video",
          error_msg: "No file selected",
        });
      } else {
        const { title, description } = req.body;
        const video = `/uploads/videos/${req.file.filename}`;

        // Log req.user to debug
        console.log("User:", req.user);

        if (!req.user) {
          res.render("postvideo", {
            title: "Post Video",
            error_msg: "User not authenticated",
          });
          return;
        }

        try {
          await pool.query(
            "INSERT INTO posts (title, description, video, fk_user_id) VALUES (?, ?, ?, ?)",
            [title, description, video, req.user.id]
          );
          req.flash("success_msg", "Video posted successfully");
          res.redirect("/");
        } catch (error) {
          console.error(error);
          res.render("postvideo", {
            title: "Post Video",
            error_msg: "Database error",
          });
        }
      }
    }
  });
});

/* GET view post page. */
router.get("/viewpost", function (req, res, next) {
  res.render("viewpost", { title: "View Post" });
});

// Dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  console.log("GET /dashboard");
  res.render("dashboard", {
    title: "Dashboard",
    user: req.user,
  });
});

module.exports = router;
