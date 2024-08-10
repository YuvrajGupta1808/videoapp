const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../helpers/auth");
const upload = require("../config/multer"); // Import multer configuration
const pool = require("../config/database"); // Import database configuration
const { makeThumbnail } = require("../models/thumbnail");

// GET home page
router.get("/", async (req, res) => {
  const isloggedin = req.isAuthenticated();

  try {
    const [posts] = await pool.query("SELECT * FROM posts");

    res.render("index", {
      title: "Home",
      posts: posts,
      isloggedin: isloggedin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
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

router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  try {
    const [posts] = await pool.query(
      "SELECT * FROM posts WHERE fk_user_id = ?",
      [req.user.id]
    );
    res.render("dashboard", {
      title: "Your Profile",
      user: req.user,
      posts: posts
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});


// POST route for handling video upload
router.post("/postvideo", ensureAuthenticated, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.render("postvideo", { title: "Post Video", error_msg: err });
    }

    if (!req.file) {
      return res.render("postvideo", {
        title: "Post Video",
        error_msg: "No file selected",
      });
    }

    try {
      await makeThumbnail(req, res, async () => {
        const { title, description } = req.body;
        const video = `/uploads/videos/${req.file.filename}`;
        const thumbnail = `/uploads/thumbnails/thumbnail-${
          req.file.filename.split(".")[0]
        }.png`;

        if (!req.user) {
          return res.render("postvideo", {
            title: "Post Video",
            error_msg: "User not authenticated",
          });
        }

        try {
          await pool.query(
            "INSERT INTO posts (title, description, video, thumbnail, fk_user_id) VALUES (?, ?, ?, ?, ?)",
            [title, description, video, thumbnail, req.user.id]
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
      });
    } catch (thumbnailError) {
      console.error(thumbnailError);
      res.render("postvideo", {
        title: "Post Video",
        error_msg: "Thumbnail creation error",
      });
    }
  });
});

// GET view post page
router.get("/viewpost/:id", async (req, res, next) => {
  const postId = req.params.id;
  const isloggedin = req.isAuthenticated();
  let userHasLiked = false;

  try {
    const [post] = await pool.query("SELECT * FROM posts WHERE id = ?", [
      postId,
    ]);
    const [comments] = await pool.query(
      "SELECT comments.*, users.username FROM comments JOIN users ON comments.fk_user_id = users.id WHERE fk_post_id = ?",
      [postId]
    );
    const [likes] = await pool.query(
      "SELECT COUNT(*) as likeCount FROM likes WHERE fk_post_id = ?",
      [postId]
    );

    if (isloggedin) {
      const userId = req.user.id;
      const [userLike] = await pool.query(
        "SELECT * FROM likes WHERE fk_post_id = ? AND fk_user_id = ?",
        [postId, userId]
      );
      userHasLiked = userLike.length > 0;
    }

    if (post.length === 0) {
      return res.status(404).send("Post not found");
    }

    res.render("viewpost", {
      title: post[0].title,
      post: post[0],
      comments: comments,
      likes: likes[0].likeCount,
      isloggedin: isloggedin,
      userHasLiked: userHasLiked,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.post("/posts/:id/delete", ensureAuthenticated, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    // Ensure the post belongs to the logged-in user before deleting
    const [post] = await pool.query(
      "SELECT * FROM posts WHERE id = ? AND fk_user_id = ?",
      [postId, userId]
    );

    if (post.length > 0) {
      await pool.query("DELETE FROM posts WHERE id = ?", [postId]);
      req.flash("success_msg", "Post deleted successfully");
    } else {
      req.flash("error_msg", "You are not authorized to delete this post");
    }

    res.redirect("/dashboard");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

router.post("/posts/:id/delete", ensureAuthenticated, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction(); // Start transaction

    // Ensure the post belongs to the logged-in user before deleting
    const [post] = await connection.query(
      "SELECT * FROM posts WHERE id = ? AND fk_user_id = ?",
      [postId, userId]
    );

    if (post.length > 0) {
      console.log(`Deleting likes for post ID: ${postId}`);
      const [likesDeletion] = await connection.query("DELETE FROM likes WHERE fk_post_id = ?", [postId]);
      console.log(`Deleted ${likesDeletion.affectedRows} likes`);

      console.log(`Deleting comments for post ID: ${postId}`);
      const [commentsDeletion] = await connection.query("DELETE FROM comments WHERE fk_post_id = ?", [postId]);
      console.log(`Deleted ${commentsDeletion.affectedRows} comments`);

      console.log(`Deleting post ID: ${postId}`);
      const [postDeletion] = await connection.query("DELETE FROM posts WHERE id = ?", [postId]);
      console.log(`Deleted ${postDeletion.affectedRows} post`);

      await connection.commit(); // Commit the transaction
      req.flash("success_msg", "Post deleted successfully");
      res.redirect("/dashboard");
    } else {
      req.flash("error_msg", "You are not authorized to delete this post");
      res.redirect("/dashboard");
    }
  } catch (error) {
    await connection.rollback(); // Rollback the transaction on error
    console.error("Error during post deletion:", error); // Log the detailed error
    res.status(500).send("Server error");
  } finally {
    connection.release(); // Release the connection back to the pool
  }
});




// GET search results
router.get("/search", async (req, res) => {
  const query = req.query.query;
  const isloggedin = req.isAuthenticated();

  try {
    const [posts] = await pool.query(
      "SELECT * FROM posts WHERE title LIKE ? OR description LIKE ?",
      [`%${query}%`, `%${query}%`]
    );
    res.render("searchresults", {
      title: "Search Results",
      posts: posts,
      query: query,
      isloggedin: isloggedin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// POST comment
router.post("/posts/:id/comment", ensureAuthenticated, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const { text } = req.body;

  try {
    await pool.query(
      "INSERT INTO comments (text, fk_post_id, fk_user_id) VALUES (?, ?, ?)",
      [text, postId, userId]
    );
    res.redirect(`/viewpost/${postId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// POST like/unlike
router.post("/posts/:id/like", ensureAuthenticated, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    // Check if the user has already liked the post
    const [existingLike] = await pool.query(
      "SELECT * FROM likes WHERE fk_post_id = ? AND fk_user_id = ?",
      [postId, userId]
    );

    if (existingLike.length > 0) {
      // If the like exists, unlike the post (remove the like)
      await pool.query(
        "DELETE FROM likes WHERE fk_post_id = ? AND fk_user_id = ?",
        [postId, userId]
      );
      req.flash("success_msg", "You have unliked the post");
    } else {
      // If the like does not exist, add a new like
      await pool.query(
        "INSERT INTO likes (fk_post_id, fk_user_id) VALUES (?, ?)",
        [postId, userId]
      );
      req.flash("success_msg", "You have liked the post");
    }

    res.redirect(`/viewpost/${postId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

module.exports = router;
