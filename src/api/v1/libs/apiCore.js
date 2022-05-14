const accents = require('remove-accents');
const _ = require('lodash');

function filterByReferenceFields(queryObject) {
  const queryShouldBe = { ...queryObject };
  const excludedFields = ['title', 'documentNumber', 'orderBy', 'start', 'end'];
  excludedFields.forEach((el) => delete queryShouldBe[el]);

  const fieldsNeedPop = Object.keys(queryShouldBe);
  const valuesInFieldsNeedPop = Object.values(queryShouldBe);

  const populatesNeedFields = fieldsNeedPop.map((f) => {
    return {
      path: f,
      select: 'value title label colorTag -_id',
      match: {
        value: { $in: valuesInFieldsNeedPop[fieldsNeedPop.indexOf(f)] },
      },
    };
  });

  const allFields = ['category', 'agency', 'urgentLevel', 'typesOfDocument'];

  const fieldsMissPop = _.difference(allFields, fieldsNeedPop);

  const populates = fieldsMissPop.map((key) => {
    return {
      path: key,
      select: 'value title label colorTag -_id',
    };
  });

  const populatesAll = populates.concat(populatesNeedFields);

  return populatesAll;
}

function filterByDateRange(queryObject) {
  const start = {
    compare: '$gte',
    value: new Date(queryObject.start).toISOString(),
  };
  const end = {
    compare: '$lt',
    value: new Date(queryObject.end).toISOString(),
  };

  const range = [start, end];
  const orderField = queryObject.orderBy || 'createdAt';

  const query = {
    [orderField]: Object.fromEntries(
      range.map((item) => [item.compare, item.value])
    ),
  };

  return query;
}

function APICore(queryString, model, userId, type) {
  this.Model = model; // Model to query
  this.queryString = queryString; // Query string from client
  this.query = this.Model.find({
    isArchived: {
      $eq: type === 'archive' ? true : false,
    },
    isPublic: userId
      ? {
          $in: [true, false],
        }
      : true,
  }); // Query object

  this.paginating = () => {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.limit(limit).skip(skip);
    return this;
  };

  this.sorting = () => {
    const sort = this.queryString.sort || '-createdAt'; // -1: descending, 1: ascending
    this.query = this.query.sort(sort);
    return this;
  };

  this.searching = () => {
    if (this.queryString.q) {
      const textNormalize = accents.remove(this.queryString.q);
      const searchTerm = '"' + textNormalize + '"';
      this.query = this.Model.searchFull(searchTerm);
    } else {
      this.query = this.query.find();
    }
    return this;
  };

  this.filtering = () => {
    const queryObject = { ...this.queryString };

    const excludedFields = ['page', 'sort', 'limit', 'q'];
    excludedFields.forEach((el) => delete queryObject[el]);

    const queryKeys = Object.keys(queryObject);

    const filterReferenceKeys = [
      'category',
      'agency',
      'urgentLevel',
      'typesOfDocument',
    ];

    const filterRangeKeys = [
      'createdAt',
      'updatedAt',
      'start',
      'end',
      'orderBy',
    ];

    const filterIdsKeys = ['ids'];

    if (_.intersection(queryKeys, filterReferenceKeys).length > 0) {
      const populates = filterByReferenceFields(queryObject);

      this.query = this.query.populate(populates);

      return this;
    } else if (
      _.intersection(queryKeys, filterRangeKeys).length > 0 &&
      queryObject.start &&
      queryObject.end
    ) {
      const query = filterByDateRange(queryObject);

      const keys = ['category', 'agency', 'urgentLevel', 'typesOfDocument'];
      const populates = keys.map((key) => {
        return {
          path: key,
          select: 'value title label colorTag -_id',
        };
      });

      this.query = this.query.find(query).populate(populates);
      return this;
    } else if (_.intersection(queryKeys, filterIdsKeys).length > 0) {
      const ids = queryObject.ids.split(',');

      const keys = ['category', 'agency', 'urgentLevel', 'typesOfDocument'];
      const populates = keys.map((key) => {
        return {
          path: key,
          select: 'value title label colorTag -_id',
        };
      });
      this.query = this.query.find({ _id: { $in: ids } }).populate(populates);
      this.query = this.query.find({ _id: { $in: ids } });

      return this;
    } else if (!_.isEmpty(queryObject)) {
      let queryStr = JSON.stringify(queryObject);
      queryStr = queryStr.replace(
        /\b(gte|gt|lt|lte|regex)\b/g,
        (match) => '$' + match
      );
      this.query = this.query.find(JSON.parse(queryStr));
      return this;
    } else {
      const keys = ['category', 'agency', 'urgentLevel', 'typesOfDocument'];
      const populates = keys.map((key) => {
        return {
          path: key,
          select: 'value title label colorTag -_id',
        };
      });

      this.query = this.query.populate(populates);
      return this;
    }
  };
}

module.exports = APICore;
