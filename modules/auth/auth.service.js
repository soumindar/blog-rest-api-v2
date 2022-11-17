const { sequelize, model } = require('../../db');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsersModel = model.users_model;

// register controller
const register = async (req, res) => {
  try {
    const { name, username, password } = req.body;

    const usernameExist = await UsersModel.findOne(
      {
        attributes: ['username'],
        where: {
          username,
          is_deleted: false,
        }
      }
    );

    if (usernameExist) {
      return res.status(409).json({
        message: 'username is already exist',
        statusCode: 409
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await UsersModel.create(
      {
        name,
        username,
        password: hashedPassword,
      }
    )

    return res.status(200).json({
      message: 'register success',
      statusCode: 200
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      statusCode: 500
    });
  }
}

// login controller
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const getUser = await UsersModel.findOne(
      {
        attributes: ['id', 'password'],
        where: {
          username,
          is_deleted: false,
        }
      }
    );

    if (!getUser) {
      return res.status(404).json({
        message: 'username not found',
        statusCode: 404
      });
    }

    const user = getUser.dataValues;
    const passwordMatch = await bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({
        message: 'wrong password',
        statusCode: 400
      });
    }

    const token = jwt.sign(
      { _id: user.id },
      process.env.SECRET,
      { expiresIn: "2h" }
    );
    
    await UsersModel.update(
      {
        token
      },
      {
        where: { id: user.id }
      }
    );

    return res.status(200).json({
      message: 'login success',
      statusCode: 200,
      data: {
        user_id: user.id,
        token
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      statusCode: 500
    });
  }
}

// logout controller
const logout = async (req, res) => {
  try {
    const id = req.user.id;

    await sequelize.query(
      'UPDATE users SET token = NULL WHERE id = :id',
      {
        replacements: {
          id
        }
      }
    );

    return res.status(200).json({
      message: 'logout success',
      statusCode: 200
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      statusCode: 500
    });
  }
}

module.exports = {
  register,
  login,
  logout,
};