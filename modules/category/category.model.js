module.exports = (sequelize, Sequelize) => {
  const Category = sequelize.define('category', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    category: {
      type: Sequelize.STRING,
    }
  }, {
    schema: 'public',
    tableName: 'category',
    underscored: true,
    freezeTableName: true,
    timestamps: false,
  });

  return Category;
};