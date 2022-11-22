const { sequelize, model } = require('../../db');
const { Op } = require('sequelize');
const PostModel = model.post_model;
const CategoryModel = model.category_model;
const UsersModel = model.users_model;
const moment = require('moment-timezone');
const userTimezone = require('../../config/timezone.config');
const extention = require('../../utils/get.extention');
const getBaseUrl = require('../../utils/get.base.url');

// get data controller
const getData = async (req, res) => {
  try {
    const { pagination, page, search, category, start_date, end_date, order_by, order } = req.query;

    const limit = pagination ?? 10;
    const pages = page ?? 1;
    const offset = (pages - 1) * limit;
    const searchKey = (!search) ? '%' : `%${search}%`;
    const categoryKey = category ?? null;
    const startDate = start_date ?? null;
    const endDate = end_date ?? null;
    const orderBy = order_by ?? 'created_at';
    const orderKey = order ?? 'DESC';

    let orderQuery = '';
    if (orderBy === 'title') {
      orderQuery = 'ORDER BY p.title';
    } else {
      orderQuery = 'ORDER BY p.created_at';
    }
    if (orderKey === 'asc') {
      orderQuery += ' ASC';
    } else {
      orderQuery += ' DESC';
    }

    if (categoryKey) {
      const categoryExist = await CategoryModel.findOne(
        {
          where: {category: categoryKey},
        }
      );
      
      if (!categoryExist) {
        return res.status(404).json({
          message: 'category not found',
          statusCode: 404,
          data: []
        });
      }
    }

    const getPost = await sequelize.query(
      `SELECT
          p.id as post_id,
          p.user_id,
          u.name,
          u.username,
          p.category_id,
          c.category as category_name,
          p.title,
          p.contents,
          p.images,
          p.created_at,
          p.updated_at
        FROM post as p
        LEFT JOIN category as c
          ON p.category_id = c.id
        LEFT JOIN users as u
          ON p.user_id = u.id
        WHERE
          p.is_deleted = false
          AND (
            (p.title ILIKE :searchKey)
            OR (p.contents ILIKE :searchKey)
          )
          AND (
            (c.category = :categoryKey)
            OR (:categoryKey IS NULL)
          )
          AND (
            (:startDate IS NULL AND :endDate IS NULL)
            OR (DATE(p.created_at) = :startDate)
            OR (DATE(p.created_at) BETWEEN :startDate AND :endDate)
          )
        ${orderQuery}
        LIMIT :limit
        OFFSET :offset`,
      {
        replacements: {
          searchKey,
          categoryKey,
          startDate,
          endDate,
          limit,
          offset,
        }
      }
    );
    
    const baseUrl = getBaseUrl(req);
    const postData = getPost[0].map(post => ({
      ...post,
      created_at: moment(post.created_at).tz(userTimezone).format(),
      updated_at: (!post.updated_at) ? null : moment(post.updated_at).tz(userTimezone).format(),
      images: (!post.images) ? baseUrl + '/images/no-image.jpeg' : baseUrl + '/images/' + post.images
    }));

    const getDataAmount = await sequelize.query(
      `SELECT
          COUNT(p.id) as data_amount
        FROM post as p
        LEFT JOIN category as c
          ON p.category_id = c.id
        LEFT JOIN users as u
          ON p.user_id = u.id
        WHERE
          p.is_deleted = false
          AND (
            (p.title ILIKE :searchKey)
            OR (p.contents ILIKE :searchKey)
          )
          AND (
            (c.category = :categoryKey)
            OR (:categoryKey IS NULL)
          )
          AND (
            (:startDate IS NULL AND :endDate IS NULL)
            OR (DATE(p.created_at) = :startDate)
            OR (DATE(p.created_at) BETWEEN :startDate AND :endDate)
          )`,
      {
        replacements: {
          searchKey,
          categoryKey,
          startDate,
          endDate
        }
      }
    );
    const dataAmount = getDataAmount[0][0].data_amount;
    const maxPage = Math.ceil(dataAmount / limit);
    
    return res.status(200).json({
      message: 'success',
      statusCode: 200,
      data: postData,
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

// get by id controller
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const getPost = await sequelize.query(
      `SELECT
          p.id as post_id,
          p.user_id,
          u.name,
          u.username,
          p.category_id,
          c.category as category_name,
          p.title,
          p.contents,
          p.images,
          p.created_at,
          p.updated_at
        FROM post as p
        LEFT JOIN category as c
          ON p.category_id = c.id
        LEFT JOIN users as u
          ON p.user_id = u.id
        WHERE p.id = :id AND p.is_deleted = false`,
      {
        replacements: {
          id,
        }
      }
    );
    
    if (!getPost[0][0]) {
      return res.status(404).json({
        message: 'post not found',
        statusCode: 404,
        data: {}
      });
    }

    const baseUrl = getBaseUrl(req);
    const postData = getPost[0].map(post => ({
      ...post,
      created_at: moment(post.created_at).tz(userTimezone).format(),
      updated_at: (!post.updated_at) ? null : moment(post.updated_at).tz(userTimezone).format(),
      images: (!post.images) ? baseUrl + '/images/no-image.jpeg' : baseUrl + '/images/' + post.images
    }));

    return res.status(200).json({
      message: 'success',
      statusCode: 200,
      data: postData
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      statusCode: 500
    });
  }
}

// get by user controller
const getByUser = async (req, res) => {
  try {
    const { username } = req.params;
    const { pagination, page, search, category, start_date, end_date, order_by, order } = req.query;
    
    const limit = pagination ?? 10;
    const pages = page ?? 1;
    const offset = (pages - 1) * limit;
    const searchKey = (!search) ? '%' : `%${search}%`;
    const categoryKey = category ?? null;
    const startDate = start_date ?? null;
    const endDate = end_date ?? null;
    const orderBy = order_by ?? 'created_at';
    const orderKey = order ?? 'DESC';

    let orderQuery = '';
    if (orderBy === 'title') {
      orderQuery = 'ORDER BY p.title';
    } else {
      orderQuery = 'ORDER BY p.created_at';
    }
    if (orderKey === 'asc') {
      orderQuery += ' ASC';
    } else {
      orderQuery += ' DESC';
    }

    const usernameExist = await UsersModel.findOne(
      {
        attributes: ['username'],
        where: {username},
      }
    );
    
    if (!usernameExist) {
      return res.status(404).json({
        message: 'username not found',
        statusCode: 404
      });
    }

    if (categoryKey) {
      const categoryExist = await CategoryModel.findOne(
        {
          attributes: ['category'],
          where: {category: categoryKey},
        }
      );
      
      if (!categoryExist) {
        return res.status(404).json({
          message: 'category not found',
          statusCode: 404,
          data: []
        });
      }
    }

    const getPost = await sequelize.query(
      `SELECT
          p.id as post_id,
          p.user_id,
          u.name,
          u.username,
          p.category_id,
          c.category as category_name,
          p.title,
          p.contents,
          p.images,
          p.created_at,
          p.updated_at
        FROM post as p
        LEFT JOIN category as c
          ON p.category_id = c.id
        LEFT JOIN users as u
          ON p.user_id = u.id
        WHERE
          p.is_deleted = false
          AND (
            (p.title ILIKE :searchKey)
            OR (p.contents ILIKE :searchKey)
          )
          AND (
            (c.category = :categoryKey)
            OR (:categoryKey IS NULL)
          )
          AND (
            (:startDate IS NULL AND :endDate IS NULL)
            OR (DATE(p.created_at) = :startDate)
            OR (DATE(p.created_at) BETWEEN :startDate AND :endDate)
          )
          AND (u.username = :username)
        ${orderQuery}
        LIMIT :limit
        OFFSET :offset`,
      {
        replacements: {
          searchKey,
          categoryKey,
          startDate,
          endDate,
          username,
          limit,
          offset,
        }
      }
    );
    
    const baseUrl = getBaseUrl(req);
    const postData = getPost[0].map(post => ({
      ...post,
      created_at: moment(post.created_at).tz(userTimezone).format(),
      updated_at: (!post.updated_at) ? null : moment(post.updated_at).tz(userTimezone).format(),
      images: (!post.images) ? baseUrl + '/images/no-image.jpeg' : baseUrl + '/images/' + post.images
    }));

    const getDataAmount = await sequelize.query(
      `SELECT
          COUNT(p.id) as data_amount
        FROM post as p
        LEFT JOIN category as c
          ON p.category_id = c.id
        LEFT JOIN users as u
          ON p.user_id = u.id
        WHERE
          p.is_deleted = false
          AND (
            (p.title ILIKE :searchKey)
            OR (p.contents ILIKE :searchKey)
          )
          AND (
            (c.category = :categoryKey)
            OR (:categoryKey IS NULL)
          )
          AND (
            (:startDate IS NULL AND :endDate IS NULL)
            OR (DATE(p.created_at) = :startDate)
            OR (DATE(p.created_at) BETWEEN :startDate AND :endDate)
          )
          AND (u.username = :username)`,
      {
        replacements: {
          searchKey,
          categoryKey,
          startDate,
          endDate,
          username,
        }
      }
    );
    const dataAmount = getDataAmount[0][0].data_amount;
    const maxPage = Math.ceil(dataAmount / limit);

    return res.status(200).json({
      message: 'success',
      statusCode: 200,
      data: postData,
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

// create post controller
const createPost = async (req, res) => {
  try {
    const { category_id, title, content } = req.body;
    const user_id = req.user.id;

    const categoryExist =  await CategoryModel.findOne(
      {
        attribute: ['id'],
        where: {id: category_id},
      }
    );
    if (!categoryExist) {
      return res.status(404).json({
        message: 'category_id not found',
        statusCode: 404
      });
    }

    let fileName = null;
    if (req.files) {
      const imageFile = req.files.image;
      fileName =  Date.now() + extention.getExt(imageFile.name);
      const uploadPath = __basedir + '/public/images/' + fileName;
      imageFile.mv(uploadPath, function(err) {
        if (err) {
          return res.status(500).send(err);
        }
      });
    };
    

    await PostModel.create(
      {
        user_id,
        category_id,
        title,
        contents: content,
        images: fileName,
      }
    );

    return res.status(200).json({
      message: 'create success',
      statusCode: 200,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      statusCode: 500
    });
  }
}

// edit post controller
const editPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const postId = id;
    const { category_id, title, content } = req.body;

    const checkPost = await PostModel.findOne(
      {
        attributes: ['id', 'user_id'],
        where: {
          [Op.and]: [
            {id: postId},
            {is_deleted: false}
          ],
        }
      }
    );
    if (!checkPost) {
      return res.status(404).json({
        message: 'post id not found',
        statusCode: 404
      });
    }
    if (checkPost.dataValues.user_id != userId) {
      return res.status(400).json({
        message: 'post not owned by this user',
        statusCode: 400
      });
    }

    const categoryExist = await CategoryModel.findOne(
      {
        attributes: ['id'],
        where: { id: category_id },
      }
    );
    if (!categoryExist) {
      return res.status(404).json({
        message: 'category_id not found',
        statusCode: 404
      });
    }

    if (req.files) {
      const imageFile = req.files.image;
      const fileName =  Date.now() + extention.getExt(imageFile.name);
      const uploadPath = __basedir + '/public/images/' + fileName;
      imageFile.mv(uploadPath, function(err) {
        if (err) {
          return res.status(500).send(err);
        }
      });

      await PostModel.update(
        {
          category_id,
          title,
          contents: content,
          images: fileName,
        },
        {
          where: { id: postId },
        }
      );  
    } else {
      await PostModel.update(
        {
          category_id,
          title,
          contents: content
        },
        {
          where: { id: postId },
        }
      );
    }

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

// delete post controller
const deletePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const postId = id;

    const checkPost = await PostModel.findOne(
      {
        attributes: ['id', 'user_id'],
        where: {
          [Op.and]: [
            { id: postId },
            { is_deleted: false },
          ]
        }
      }
    );
    if (!checkPost.dataValues) {
      return res.status(404).json({
        message: 'post id not found',
        statusCode: 404
      });
    }
    if (checkPost.dataValues.user_id != userId) {
      return res.status(400).json({
        message: 'post not owned by this user',
        statusCode: 400
      });
    }


    await PostModel.update(
      {
        is_deleted: true,
        deleted_at: Date.now(),
      },
      {
        where: { id: postId }
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
  createPost,
  getData,
  getById,
  getByUser,
  editPost,
  deletePost,
}