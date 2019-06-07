function isObject(value) {
  const type = typeof value;
  return value != null && (type === 'object' || type === 'function');
}


const toString = Object.prototype.toString; // eslint-disable-line

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function getTag(value) {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]';
  }
  return toString.call(value);
}


function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  const tag = getTag(value);
  return tag === '[object Function]' || tag === '[object AsyncFunction]'
    || tag === '[object GeneratorFunction]' || tag === '[object Proxy]';
}

module.exports = {
  isFunction,
};
