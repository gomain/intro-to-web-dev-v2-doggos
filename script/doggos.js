
import { entries, applied } from "./object-extension.mjs";
import * as dx from "./dom-extension.mjs";


(function () {
  'use-strict';
  
  buildBreedSelectList();
  buildAddDogButton();

  /* build breed select list */
  function buildBreedSelectList() {

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
        dx.getElem('#breed-list').appendChild(dx.select({
          options: [pickADoggo,anyDoggo]
            .concat(breedOptions(json.message))
        }));
      });

    function breedOptions(breeds) {
      return breeds[entries]().map( ([breed,subBreeds]) =>
                                    (subBreeds.length === 0 ?
                                     breedOption(breed) :
                                     breedOptionGroup(breed,subBreeds)));
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
    };
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

    const addDogButton = dx.getElem('button#add-dog');
    addDogButton.addEventListener('click',addDog);
    addDogButton.focus();

    function addDog() {
      const self = this;

      const {
        optiontype: optionType,
        breed,
        subbreed: subBreed
      } = dx.getElem('select').selectedOptions[0][dx.attributes];

      switchEx({
        testEx: optionType,
        cases: [['random','https://dog.ceo/api/breeds/image/random'],
                ['breed',`https://dog.ceo/api/breed/${breed}/images/random`],
                ['sub-breed',`https://dog.ceo/api/breed/${breed}/${subBreed}/images/random`]]
          .map( ([caseEx,url]) => ({ caseEx, returnEx: new URL(url) }) ),
        defaultEx: {}
      })[applied](Promise.resolve.bind(Promise))
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

  };

  function addImageToGallery(url) {
    dx.getElem('#doggo-gallery')
      .appendChild(dx.img({
        props: {
          src : url,
          alt : 'Cute doggo!'
        }
      }));
  };
})();
