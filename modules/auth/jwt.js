const jwt = require('jsonwebtoken');
const { sequelize, model, Op } = require('../../db');
const UsersModel = model.users_model;

const jwtVerify = async (req, res, next) => {
  try {
    const getToken = req.headers['authorization'];

    if (!getToken) {
      return res.status(401).json({
        message: 'no token',
        statusCode: 401
      });
    }

    const token = getToken.replace('Bearer ', '');
    const getUser = await UsersModel.findOne(
      {
        attributes: ['id', 'token'],
        where: {
            token,
            is_deleted: false
        }
      }
    );

    if (!getUser) {
      return res.status(401).json({
        message: 'token invalid',
        statusCode: 401
      });
    }

    jwt.verify(token, process.env.SECRET);
    req['user'] = { id: getUser.dataValues.id };
    req['token'] = token;

    return next();
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      statusCode: 500
    });
  }
}

module.exports = jwtVerify;