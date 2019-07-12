const nlp = require('wink-nlp-utils');
const { isFunction } = require('./utils');

const PREFIX = '__nGramTextSearch_';

const toNGrams = (str, nGramSizeMin, nGramSizeMax) => {
  const result = [];
  for (let i = nGramSizeMin; i <= nGramSizeMax; i += 1) {
    result.push(...nlp.string.ngrams(str, i));
  }
  return result;
};

module.exports = function (schema, options) {
  const { fields = [], nGramSizeMin = 2, nGramSizeMax = 3, fieldPrefix = PREFIX } = options;
  const getNGramField = name => `${fieldPrefix}_${name}`;
  const textIndex = {};
  fields.forEach((fieldOpt) => {
    const {
      name,
    } = fieldOpt;
    const fieldType = schema.path(name);
    if (!fieldType || fieldType.instance !== 'String') {
      throw new Error('Only accept fields with type String');
    }
    schema.add({
      [getNGramField(name)]: { type: String },
    });
    textIndex[getNGramField(name)] = 'text';
    textIndex[name] = 'text';
  });

  schema.index(textIndex, { default_language: 'none', name: PREFIX });


  schema.pre('save', function (next) {
    fields.forEach((fieldOpt) => {
      const {
        name, extractFn,
      } = fieldOpt;
      const fieldName = getNGramField(name);
      const value = isFunction(extractFn) ? extractFn(this[name]) : this[name];
      if (value) {
        this[fieldName] = toNGrams(value, nGramSizeMin, nGramSizeMax).join(' ');
      } else {
        this[fieldName] = '';
      }
    });
    next();
  });

  const updateHookHandler = function (next) {
    if (!this.getUpdate().$set) {
      this.getUpdate().$set = {}
    }
    fields.forEach((fieldOpt) => {
      const {
        name, extractFn,
      } = fieldOpt;
      const fieldName = getNGramField(name);
      const getter = key => this.getUpdate().$set[key] || this.getUpdate()[key];
      const setter = (key, value) => this.getUpdate().$set[key] = value;
      const updatedValue = getter(name)
      if (updatedValue) {
        const value = isFunction(extractFn) ? extractFn(updatedValue) : updatedValue;
        if (value) {
          setter(fieldName, toNGrams(value, nGramSizeMin, nGramSizeMax).join(' '));
        } else {
          setter(fieldName, '');
        }
      }
    });
    next();
  };

  schema.pre('findOneAndUpdate', updateHookHandler);

  schema.pre('updateOne', updateHookHandler);
};
