const jwt = require('jsonwebtoken');
const { sequelize } = require('../../db');

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
    const getUser = await sequelize.query(
      'SELECT id, token, is_deleted FROM users WHERE token = :token',
      {
        replacements: {
          token,
        }
      }
    );

    if (!getUser[0][0]) {
      return res.status(401).json({
        message: 'token invalid',
        statusCode: 401
      });
    }

    if (getUser[0][0].is_deleted) {
      return res.status(404).json({
        message: 'user not exist',
        statusCode: 404
      });
    }

    jwt.verify(token, process.env.SECRET);
    req['user'] = { id: getUser[0][0].id };
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