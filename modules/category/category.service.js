const { sequelize, model } = require('../../db');
const { Op } = require('sequelize');
const CategoryModel = model.category_model;

const getData = async (req, res) => {
  try {
    const { pagination, page, order_by, order } = req.query;

    const limit = pagination ?? 10;
    const pages = page ?? 1;
    const offset = (pages - 1) * limit;
    const orderBy = order_by ?? 'category';
    const orderKey = order ?? 'ASC';

    const getCategory = await CategoryModel.findAll(
      {
        limit,
        offset,
        order: [
          [orderBy, orderKey]
        ]
      }
    );
    const categoryData = getCategory.map(x => x.dataValues);
    
    const dataAmount = await CategoryModel.count();
    const maxPage = Math.ceil(dataAmount / limit);
    
    return res.status(200).json({
      message: 'success',
      statusCode: 200,
      data: categoryData,
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

module.exports = {
  getData,
};