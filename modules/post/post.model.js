module.exports = (sequelize, Sequelize) => {
  const Post = sequelize.define('post', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    user_id: {
      type: Sequelize.INTEGER,
    },
    category_id: {
      type: Sequelize.INTEGER,
    },
    title: {
      type: Sequelize.STRING,
    },
    contents: {
      type: Sequelize.TEXT,
    },
    created_at: {
      type: Sequelize.DATE,
    },
    updated_at: {
      type: Sequelize.DATE,
    },
    is_deleted: {
      type: Sequelize.BOOLEAN,
    },
    deleted_at: {
      type: Sequelize.DATE,
    },
    images: {
      type: Sequelize.STRING,
    },
  }, {
    schema: 'public',
    tableName: 'post',
    underscored: true,
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Post;
}