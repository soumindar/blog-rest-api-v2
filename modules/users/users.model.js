module.exports = (sequelize, Sequelize) => {
  const Users = sequelize.define('users', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    username: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
    token: {
      type: Sequelize.STRING,
    },
    created_at: {
      type: Sequelize.DATE,
    },
    updated_at: {
      type: Date
    },
    is_deleted: {
      type: Sequelize.BOOLEAN,
    },
    deleted_at: {
      type: Sequelize.DATE,
    },
  }, {
    schema: 'public',
    tableName: 'users',
    underscored: true,
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return Users;
}