
(function() {
    'use strict'

    /* monkey patch Object */
    const assign = Symbol('assign');
    Object.prototype[assign] = function (dict) {
        return Object.assign(this,dict);
    };
    /** returns { <<name>> : <<value>>, ... } **/
    const keys = Symbol('keys');
    Object.prototype[keys] = function () {
        return Object.keys(this);
    };

    /* monkey patch HTMLElement */
    const setAttributes = Symbol('setAttributes');
    HTMLElement.prototype[setAttributes] = function (dict) {
	if (dict instanceof Object) {
            for (const attr of dict[keys]()) {
		this.setAttribute(attr,dict[attr]);
            }
	}
        return this;
    };
    const appendChildren = Symbol('appendChildren');
    HTMLElement.prototype[appendChildren] = function (htmlElements) {
        if (htmlElements instanceof Array) {
            htmlElements.forEach(elem => this.appendChild(elem));
        }
        return this;
    };

    /* DOM helpers */
    const getElem = function (query) {
	return document.querySelector(query);
    };

    /* dict: {
       type: 'string',
       props: { ... },
       attrs: { ... }
       } */
    const elem = function (dict) {
        return document.createElement(dict.type)[assign](dict.props)[setAttributes](dict.attrs);
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

    /* dict : {
       props: { ... },
       attrs: { ... },
       options: [ { ... }, ... ]
       } */
    const optionGroup = function (dict) {
        return elem({ type: 'optGroup' }[assign]({ props: dict.props, attrs: dict.attrs }))[
            appendChildren](dict.options instanceof Array ?
                            dict.options.map(option) :
                            undefined );
    };
    /* dict: {
       props: { name: value, ... },
       attrs: { name: value, ... },
       options: [ { option }, ... }
       } */
    const select = function(dict) {
        return elem({ type: 'select'}[assign]({ props: dict.props, attrs: dict.attrs }))[
            appendChildren](dict.options instanceof Array ?
                            dict.options.map(opt => opt.options instanceof Array ?
                                                  optionGroup(opt) : option(opt)) :
                            undefined);
    };

    const DOGURL = 'https://dog.ceo/api/breeds/image/random';

    const addDogButton = getElem('button#add-dog');
    addDogButton.addEventListener('click',() => {
        fetch(DOGURL).
         then(response => response.json()).
            then(json => {
                getElem('#doggo-gallery').
                                    appendChild(img({
                                        props: {
                                            src : json.message,
                                            alt : 'Cute doggo!'
                                        }
                                    }));

            }).
	    then(() => addDogButton.scrollIntoView());
    });

    addDogButton.focus();

    /* build breed select list */
    (function () {

        function selectOptions(dict) {
            return dict[keys]().map(breed => {
                const breeds = dict[breed];
                return breeds instanceof Array ?
                       (breeds.length === 0 ?
                        breedOption(breed) :
                        breedOptionGroup(breed,breeds)):
                       undefined
            });
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
    })();

})();
