router.get("/search", async (req, res) => {
  const { query } = req.query;
  try {
    const [rows] = await pool.query("SELECT * FROM posts WHERE title LIKE ?", [
      `%${query}%`,
    ]);
    res.render("searchresults", {
      title: "Search Results",
      posts: rows,
    });
  } catch (err) {
    console.error(err);
    res.render("searchresults", {
      title: "Search Results",
      error_msg: "An error occurred while searching for posts",
    });
  }
});

router.get("/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    const [[post]] = await pool.query("SELECT * FROM posts WHERE id = ?", [
      postId,
    ]);
    const [comments] = await pool.query(
      "SELECT * FROM comments WHERE fk_post_id = ?",
      [postId]
    );
    res.render("viewpost", {
      title: post.title,
      post,
      comments,
    });
  } catch (err) {
    console.error(err);
    res.render("viewpost", {
      title: "View Post",
      error_msg: "An error occurred while fetching the post",
    });
  }
});

router.post("/:id/comment", ensureAuthenticated, async (req, res) => {
  const postId = req.params.id;
  const { text } = req.body;
  const userId = req.user.id;

  try {
    await pool.query(
      "INSERT INTO comments (text, fk_post_id, fk_user_id) VALUES (?, ?, ?)",
      [text, postId, userId]
    );
    res.redirect(`/posts/${postId}`);
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "An error occurred while posting the comment");
    res.redirect(`/posts/${postId}`);
  }
});
