
(function () {
  'use strict';

  /* monkey patch Object */
  const assign = Symbol('assign');
  Object.prototype[assign] = function (dict) {
    return Object.assign(this,dict);
  };
  /** return: { <<name>> : <<value>>, ... } **/
  const keys = Symbol('keys');
  Object.prototype[keys] = function () {
    return Object.keys(this);
  };

  const entries = Symbol('entries');
  Object.prototype[entries] = function () {
    return Object.entries(this);
  };

  const beAppliedTo = Symbol('beAppliedTo');
  Object.prototype[beAppliedTo] = function (f) {
    console.log(this);
    return f(this);
  };

  /* monkey patch DOM objects */
  const getAttributes = Symbol('getAttributes');
  Element.prototype[getAttributes] = function () {
    const attrs = {};
    for (const attr of this.getAttributeNames()) {
      attrs[assign]({ [attr]: this.getAttribute(attr) });
    };
    return attrs;
  };

  const attributes = Symbol('attributes');
  Object.defineProperty(Element.prototype,attributes,{get: function () {
    return this[getAttributes]();
  }});

  const setAttributes = Symbol('setAttributes');
  Element.prototype[setAttributes] = function (attrs) {
    if (attrs instanceof Object) {
      for (const [attr,value] of attrs[entries]()) {
        this.setAttribute(attr,value);
      }
    }
    return this;

  };
  const appendChildren = Symbol('appendChildren');
  Node.prototype[appendChildren] = function (htmlElements) {
    if (htmlElements instanceof Array) {
      htmlElements.forEach(elem => this.appendChild(elem));
    }
    return this;
  };

  /* DOM helpers */
  const getElem = function (query) {
    return document.querySelector(query);
  };

  /* arg: {
     type: 'string',
     props: { ... },
     attrs: { ... }
     } */
  const elem = function ({type,props,attrs}) {
    return document.createElement(type)[assign](props)[setAttributes](attrs);
  };

  /* dict: {
     props: { ... },
     attrs: { ... }
     } */
  const img = function (dict) {
    return elem({ type: 'img' }[assign](dict));
  };
  const option = function (dict) {
    return elem({ type: 'option' }[assign](dict));
  };

  /* arg : {
     props: { ... },
     attrs: { ... },
     options: [ { ... }, ... ]
     } */
  const optionGroup = function ({props,attrs,options}) {
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
  const select = function({props,attrs,options}) {
    return elem({ type: 'select'}[assign]({props, attrs}))[
      appendChildren](options instanceof Array ?
                      options.map(opt => opt.options instanceof Array ?
                                       optionGroup(opt) :
                                       option(opt)) :
                      null);
  };


  /* build breed select list */
  function buildBreedSelectList() {

    function selectOptions(dict) {
      return dict[entries]().map( ([breed,breeds]) =>
        (breeds.length === 0 ?
         breedOption(breed) :
         breedOptionGroup(breed,breeds)));
    };

    function breedOption(breed) {
      return {
        props: {
          label: breed,
          value: breed,
          innerText: breed
        },
        attrs: {
          optionType: 'breed',
          breed: breed
        }
      };
    };

    function breedOptionGroup(breed,breeds) {
      return {
        props: {
          label: breed
        },
        options: [{
          props: {
            label: breed,
            value: breed,
            innerText: 'any '+breed
          },
          attrs: {
            optionType: 'breed',
            breed: breed
          }
        }].concat(breeds.map(subBreedOption.bind(null,breed)))
      };
    };

    function subBreedOption (breed,subBreed) {
      return {
        props: {
          label: subBreed,
          value: subBreed,
          innerText: subBreed
        },
        attrs: {
          optionType: 'sub-breed',
          breed: breed,
          subBreed: subBreed
        }
      };
    };

    const breedListUrl = 'https://dog.ceo/api/breeds/list/all';
    const pickADoggo = {
      props: {
        disabled: true,
        selected: true,
        innerText: 'Pick a doggo...'
      }
    };
    const anyDoggo = {
      props: {
        label: 'any',
        value: 'any',
        innerText: 'any doggo'
      },
      attrs: {
        optionType: 'random'
      }
    };

    fetch(breedListUrl)
      .then(response => response.json())
      .then(json => {
        console.log(json);
        getElem('#breed-list').appendChild(select({
          options: [pickADoggo,anyDoggo]
            .concat(selectOptions(json.message))
        }));
      });
  };


  function switchEx({testEx, cases, defaultEx = undefined} = {}) {
    for (const {caseEx,returnEx} of cases) {
      if (caseEx === testEx) {
        return returnEx;
      };
    };
    return defaultEx;
  };

  function buildAddDogButton() {

    function addDog() {
      const self = this;

      const {
        optiontype: optionType,
        breed,
        subbreed: subBreed
      } = getElem('select').selectedOptions[0][attributes];

      switchEx({
        testEx: optionType,
        cases: [['random','https://dog.ceo/api/breeds/image/random'],
                ['breed',`https://dog.ceo/api/breed/${breed}/images/random`],
                ['sub-breed',`https://dog.ceo/api/breed/${breed}/${subBreed}/images/random`]]
          .map( ([caseEx,url]) => ({ caseEx, returnEx: new URL(url) }) ),
        defaultEx: {}
      })[beAppliedTo](Promise.resolve.bind(Promise))
        .then(url => {
          if (url instanceof URL){
            return fetch(url);
          } else {
            throw `Url is of type: ${typeof url}`;
          }
        })
        .then(getImageUrl)
        .then(addImageToGallery)
        .then(scrollIntoView)
        .catch(e => { console.error(e); alert('Pick a Doggo...!'); });

      function getImageUrl(response) {
        return response.json().then(json => Promise.resolve(json.message));
      };

      function scrollIntoView() {
        self.scrollIntoView();
      };
    };

    const addDogButton = getElem('button#add-dog');
    addDogButton.addEventListener('click',addDog);
    addDogButton.focus();
  };

  function addImageToGallery(url) {
    getElem('#doggo-gallery')
      .appendChild(img({
        props: {
          src : url,
          alt : 'Cute doggo!'
        }
      }));
  };

  buildBreedSelectList();
  buildAddDogButton();

})();
