const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");
const Post = require("./post");

const Comment = sequelize.define(
  "Comment",
  {
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

Comment.belongsTo(Post, { foreignKey: "fk_post_id" });
Comment.belongsTo(User, { foreignKey: "fk_user_id" });

module.exports = Comment;
