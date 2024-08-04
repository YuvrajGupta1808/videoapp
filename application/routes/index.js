const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../helpers/auth");

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

/* GET post video page. */
router.get("/postvideo", function (req, res, next) {
  res.render("postvideo", { title: "Post Video" });
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
