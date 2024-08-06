const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");

const Post = sequelize.define(
  "Post",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    video: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

Post.belongsTo(User, { foreignKey: "fk_user_id" });

module.exports = Post;
