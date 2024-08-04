const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const pool = require("./database");

// Load User Model
module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "username" },
      async (username, password, done) => {
        try {
          console.log("Attempting to find user with username:", username);
          const [rows] = await pool.query(
            "SELECT * FROM users WHERE username = ?",
            [username]
          );

          if (rows.length === 0) {
            console.log("No user found with username:", username);
            return done(null, false, {
              message: "No user found with that username",
            });
          }

          const user = rows[0];
          console.log("User found:", user);

          const isMatch = await bcrypt.compare(password, user.password);
          if (isMatch) {
            console.log("Password match for user:", username);
            return done(null, user);
          } else {
            console.log("Password incorrect for user:", username);
            return done(null, false, { message: "Password incorrect" });
          }
        } catch (err) {
          console.error("Error during authentication:", err);
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
      done(null, rows[0]);
    } catch (err) {
      done(err);
    }
  });
};
