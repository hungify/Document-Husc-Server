const accents = require('remove-accents');
const _ = require('lodash');

function APICore(queryString, query) {
  this.query = query; // Mongoose query
  this.queryString = queryString; // Query string from client

  this.paginating = () => {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    console.log('🚀 :: limit', limit);
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
      this.query = this.query.find({
        $text: { $search: searchTerm },
      });
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
    const filterKeys = ['category', 'agency', 'urgentLevel', 'typeOfDocument'];

    if (_.intersection(queryKeys, filterKeys).length > 0) {
      const keys = Object.keys(queryObject);
      const values = Object.values(queryObject);

      const populates = keys.map((key) => {
        return {
          path: key,
          select: '_id',
          match: { value: values[keys.indexOf(key)] },
        };
      });
      this.query = this.query
        .find()
        .populate(populates.map((populate) => populate));
      return this;
    } else {
      let queryStr = JSON.stringify(queryObject);
      queryStr = queryStr.replace(
        /\b(gte|gt|lt|lte|regex)\b/g,
        (match) => '$' + match
      );
      this.query = this.query.find(JSON.parse(queryStr));
      return this;
    }
  };
}

module.exports = APICore;
