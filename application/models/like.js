const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");
const Post = require("./post");

const Like = sequelize.define(
  "Like",
  {},
  {
    timestamps: true,
  }
);

Like.belongsTo(Post, { foreignKey: "fk_post_id" });
Like.belongsTo(User, { foreignKey: "fk_user_id" });

module.exports = Like;
