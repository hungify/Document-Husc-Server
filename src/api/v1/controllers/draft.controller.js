const Document = require('../models/document.model');
const APICore = require('../libs/apiCore');
const { getPayload } = require('../middlewares/jwt');

const getListDraft = async (req, res, next) => {
  try {
    const payload = await getPayload(req);

    const keys = ['category', 'agency', 'urgentLevel', 'typesOfDocument'];
    const populates = keys.map((key) => {
      return {
        path: key,
        select: 'value title label colorTag -_id',
      };
    });
    const api = new APICore(
      req.query,
      Document,
      payload?.userId,
      'draft'
    ).paginating();

    const result = await Promise.allSettled([
      api.query
        .populate(populates)
        .select('updatedAt title summary content status')
        .lean({ autopopulate: true }),
      Document.countDocuments({}),
    ]);

    const documents = result[0].status === 'fulfilled' ? result[0].value : [];
    const total = result[1].status === 'fulfilled' ? result[1].value : 0;

    return res.status(200).json({
      total,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

const getDetailsDraft = async (req, res, next) => {};

module.exports = {
  getListDraft,
  getDetailsDraft,
};
