const categoryModel = require('../../modules/category/category.model');
const usersModel = require('../../modules/users/users.model');
const postModel = require('../../modules/post/post.model');

const Schema = (sequelize, Sequelize) => {
  const users_model = usersModel(sequelize, Sequelize);
  const category_model = categoryModel(sequelize, Sequelize);
  const post_model = postModel(sequelize, Sequelize);

  post_model.belongsTo(users_model, {foreignKey: 'user_id'});
  users_model.hasMany(post_model, {foreignKey: 'id'});

  post_model.belongsTo(category_model, {foreignKey: 'category_id'});
  category_model.hasMany(post_model, {foreignKey: 'id'});

  return {
    users_model,
    category_model,
    post_model,
  }
};

module.exports = Schema;