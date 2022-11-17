const { sequelize, model } = require('../../db');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const UsersModel = model.users_model;
const moment = require('moment-timezone');
const userTimezone = require('../../config/timezone.config');

// get user data controller
const getData = async (req, res) => {
  try {
    const userId = req.user.id;    
    
    const getUser = await UsersModel.findOne({
      attributes: ['id', 'name', 'username', 'created_at', 'updated_at'],
      where: { id: userId }
    });
    if (!getUser) {
      return res.status(400).json({
        message: 'user not found',
        statusCode: 404
      });
    }
    const data = {
      ...getUser.dataValues,
      created_at: moment(getUser.dataValues.created_at).tz(userTimezone).format(),
      updated_at: (!getUser.dataValues.updated_at) ? null : moment(getUser.dataValues.updated_at).tz(userTimezone).format(),
    };

    return res.status(200).json({
      message: 'success',
      statusCode: 200,
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      statusCode: 500
    });
  }
}

// get all users controller
const getAll = async (req, res) => {
  try {
    const { pagination, page } = req.query;

    const limit = pagination ?? 10;
    const pages = page ?? 1;
    const offset = (pages - 1) * limit;

    const getUsers = await UsersModel.findAll(
      {
        attributes: ['id', 'name', 'username'],
      },
      {
        limit,
        offset,
      }
    );
    
    const dataAmount = await UsersModel.count();
    const maxPage = dataAmount / limit;

    return res.status(200).json({
      message: 'success',
      statusCode: 200,
      data: getUsers.dataValues,
      meta: {
        pagination: Number(limit),
        page: Number(pages),
        data_amount: Number(dataAmount),
        max_page: Number(maxPage)
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      statusCode: 500
    });
  }
}

// get user by username controller
const getByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    
    const getUser = await UsersModel.findOne({
      attributes: ['id', 'name', 'username', 'created_at', 'updated_at'],
      where: {
        [Op.and]: [{username}, {is_deleted: false}],
      }
    });
    if (!getUser) {
      return res.status(400).json({
        message: 'username not found',
        statusCode: 404
      });
    }
    const data =  {
      ...getUser.dataValues,
      created_at: moment(getUser.dataValues.created_at).tz(userTimezone).format(),
      updated_at: (!getUser.dataValues.updated_at) ? null : moment(getUser.dataValues.updated_at).tz(userTimezone).format(),
    };

    return res.status(200).json({
      message: 'success',
      statusCode: 200,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      statusCode: 500
    });
  }
}

// update user controller
const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    const { name, username } = req.body;

    const usernameExist = await UsersModel.findOne({
      attributes: ['username'],
      where: {
        [Op.and]: [
          { username: username },
          { id: {[Op.ne]: userId} }
        ]
      }
    });

    if (usernameExist) {
      return res.status(409).json({
        message: 'username is already exist',
        statusCode: 409
      });
    }

    await UsersModel.update(
      {
        name,
        username,
        updated_at: Date.now()
      },
      {
        where: {id: userId}
      }
    );

    return res.status(200).json({
      message: 'update success',
      statusCode: 200
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      statusCode: 500
    });
  }
}

// change password controller
const changePass = async (req, res) => {
  try {
    const userId = req.user.id;
    const { new_pass, confirm_pass } = req.body;

    if (new_pass != confirm_pass) {
      return res.status(400).json({
        message: 'confirm_pass must be same with new_pass',
        statusCode: 400
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_pass, salt);

    await UsersModel.update(
      {
        password: hashedPassword,
        updated_at: Date.now(),
      },
      {
        where: {id: userId}
      }
    );

    return res.status(200).json({
      message: 'change password success',
      statusCode: 200
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      statusCode: 500
    });
  }
}

// delete user controller
const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;

    await UsersModel.update(
      {
        is_deleted: true,
        deleted_at: Date.now(),
      },
      {
        where: {id: userId}
      }
    );

    return res.status(200).json({
      message: 'delete success',
      statusCode: 200
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      statusCode: 500
    });
  }
}

module.exports = {
  getData,
  getAll,
  getByUsername,
  updateUser,
  changePass,
  deleteUser,
}