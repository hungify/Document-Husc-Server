const _ = require('lodash');

module.exports = {
  isJSON: (str) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  },
  removeEmptyObjInArrByKeys: (data, keys) => {
    const arr = [];
    return _.filter(data, (item) => {
      const removedObj = Object.fromEntries(
        Object.entries(item).filter(([_, v]) => v != null)
      );
      const sameKeys = _.intersection(Object.keys(removedObj), keys);

      if (sameKeys.length === keys.length) {
        return [...arr, removedObj];
      }
    });
  },

  toMap: (data, key) => {
    return data.reduce((prev, current) => {
      prev[current[key]] = current;
      return prev;
    }, {});
  },
  listToTree: (arr, childKey, parentKey, wrapKey) => {
    const map = module.exports.toMap(arr, childKey);
    return arr.reduce((acc, current) => {
      const key = current[parentKey];
      if (key) {
        map[key][wrapKey] = map[key][wrapKey] || [];
        map[key][wrapKey].push(current);
      } else {
        acc.push(current);
      }

      return acc;
    }, []);
  },
};
