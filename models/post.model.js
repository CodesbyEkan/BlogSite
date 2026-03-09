import { sequelize } from "../config/db";
import { DataTypes } from "sequelize";

export const Post = sequelize.define("Post", {
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.STRING, allowNull: false },
  author: { type: DataTypes.STRING, allowNull: false },
  tags: { type: DataTypes.JSON, allowNull: false },
});
