
import { entries, assign } from "./object-extension.mjs";

/* monkey patch DOM objects */

export const getAttributes = Symbol('getAttributes');
Element.prototype[getAttributes] = function () {
  const attrs = {};
  for (const attr of this.getAttributeNames()) {
    attrs[assign]({ [attr]: this.getAttribute(attr) });
  };
  return attrs;
};

export const attributes = Symbol('attributes');
Object.defineProperty(Element.prototype,attributes,{get: function () {
  return this[getAttributes]();
}});

export const setAttributes = Symbol('setAttributes');
Element.prototype[setAttributes] = function (attrs) {
  if (attrs instanceof Object) {
    for (const [attr,value] of attrs[entries]()) {
      this.setAttribute(attr,value);
    };
  };
  return this;

};

export const appendChildren = Symbol('appendChildren');
Node.prototype[appendChildren] = function (htmlElements) {
  if (htmlElements instanceof Array) {
    htmlElements.forEach(elem => this.appendChild(elem));
  }
  return this;
};

/* DOM helpers */
export const getElem = function (query) {
  return document.querySelector(query);
};

/* arg: {
   type: 'string',
   props: { ... },
   attrs: { ... }
   } */
export const elem = function ({type,props,attrs}) {
  return document.createElement(type)[assign](props)[setAttributes](attrs);
};

/* dict: {
   props: { ... },
   attrs: { ... }
   } */
export const img = function (dict) {
  return elem({ type: 'img' }[assign](dict));
};

export const option = function (dict) {
  return elem({ type: 'option' }[assign](dict));
};

/* arg : {
   props: { ... },
   attrs: { ... },
   options: [ { ... }, ... ]
   } */
export const optionGroup = function ({props,attrs,options}) {
  return elem({ type: 'optGroup' }[assign]({props,attrs}))[
    appendChildren](options instanceof Array
                    ? options.map(option)
                    : null );
};

/* arg: {
   props: { name: value, ... },
   attrs: { name: value, ... },
   options: [ { option }, ... }
   } */
export const select = function({props,attrs,options}) {
  return elem({ type: 'select'}[assign]({props, attrs}))[
    appendChildren](options instanceof Array ?
                    options.map(opt => opt.options instanceof Array ?
                                optionGroup(opt) :
                                option(opt)) :
                    null);
};
