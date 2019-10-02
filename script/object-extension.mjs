
console.log('object-extension.mjs imported!');

/* monkey patch Object */
export const assign = Symbol('assign');
Object.prototype[assign] = function (dict) {
  return Object.assign(this,dict);
};

/** return: { <<name>> : <<value>>, ... } **/
export const keys = Symbol('keys');
Object.prototype[keys] = function () {
  return Object.keys(this);
};

export const entries = Symbol('entries');
Object.prototype[entries] = function () {
  return Object.entries(this);
};

export const applied = Symbol('beAppliedTo');
Object.prototype[applied] = function (f) {
  console.log(this);
  return f(this);
};




