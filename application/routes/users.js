const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const { ensureAuthenticated } = require("../helpers/auth");
const passport = require("passport");

require("../config/passport")(passport);

// Register Handle
router.post("/register", async (req, res) => {
  const { username, email, password, confirmpassword, age, tos } = req.body;

  let errors = [];

  if (!username || !email || !password || !confirmpassword || !age || !tos) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password !== confirmpassword) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (errors.length > 0) {
    res.render("registration", {
      errors,
      username,
      email,
      password,
      confirmpassword,
    });
  } else {
    try {
      const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      if (rows.length > 0) {
        errors.push({ msg: "Email already exists" });
        res.render("registration", {
          errors,
          username,
          email,
          password,
          confirmpassword,
        });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
          "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
          [username, email, hashedPassword]
        );
        req.flash("success_msg", "You are now registered and can log in");
        res.redirect("/users/login");
      }
    } catch (err) {
      console.error(err);
      res.render("registration", {
        errors: [{ msg: "An error occurred during registration" }],
        username,
        email,
        password,
        confirmpassword,
      });
    }
  }
});

// Login Page
router.get("/login", (req, res) => {
  res.render("login", { title: "Login" });
});

// Login Handle
router.post("/login", (req, res, next) => {
  console.log("POST /login with body:", req.body);
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Error during authentication:", err);
      return next(err);
    }
    if (!user) {
      console.log("Authentication failed:", info.message);
      req.flash("error_msg", info.message);
      return res.redirect("/users/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error("Error during login:", err);
        return next(err);
      }
      console.log("Authentication successful, redirecting to /dashboard");
      return res.redirect("/dashboard");
    });
  })(req, res, next);
});

// Logout Handle
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "You are logged out");
    res.redirect("/users/login");
  });
});

module.exports = router;
