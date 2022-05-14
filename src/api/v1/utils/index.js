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
  toMap: (arr, childKey, nestedKey) => {
    const result = arr.reduce((prev, current) => {
      const key = nestedKey
        ? current[childKey][nestedKey].toString()
        : current[childKey];
      prev[key] = current;
      return prev;
    }, {});
    return result;
  },
  listToTree: (
    arr,
    childKey = 'childId',
    parentKey = 'parentId',
    wrapKey = 'children',
    nestedKey = ''
  ) => {
    const map = module.exports.toMap(arr, childKey, nestedKey);
    return arr.reduce((acc, current) => {
      const key = nestedKey
        ? current[parentKey][nestedKey]?.toString()
        : current[parentKey];

      delete current[parentKey];
      current.key = current.receiver._id;

      if (map[key]) {
        map[key][wrapKey] = map[key][wrapKey] || [];
        map[key][wrapKey].push(current);
      } else {
        acc.push(current);
      }

      return acc;
    }, []);
  },
  listToTreeSimple(arr, childKey, wrapKey, parentKey) {
    const map = module.exports.toMap(arr, childKey);

    return arr.reduce((acc, current) => {
      const key = current[parentKey];
      current.key = current._id;
      if (map[key]) {
        map[key][wrapKey] = map[key][wrapKey] || [];
        map[key][wrapKey].push(current);
      } else {
        acc.push(current);
      }

      return acc;
    }, []);
  },
};
