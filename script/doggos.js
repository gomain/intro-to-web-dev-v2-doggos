
(function() {
    'use strict'
    
    /* monkey patch Object */
    const assign = Symbol('assign');
    Object.prototype[assign] = function (dict) {
        return Object.assign(this,dict);
    };
    /** returns [ { name: ... , value: ... }, ... ] **/
    const getOwnProperties = Symbol('getOwnProperties');
    Object.prototype[getOwnProperties] = function () {
        return Object.getOwnPropertyNames(this).
            map(name => ({
                name: name,
                value: this[name]
            }));
    };

    /* monkey patch HTMLElement */
    const setAttributes = Symbol('setAttributes');
    HTMLElement.prototype[setAttributes] = function (dict) {
	if (dict instanceof Object) {
            for (const prop of dict[getOwnProperties]()) {
		this.setAttribute(prop.name,prop.value);
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
    
    /* test DOM helpers 
    getElem('#test-select').appendChild(select({
        options: [
            {
                props: {
                    value: 'option-1-value',
                    label: 'option-1-label',
                    innerText: 'option-1'
                },
                attrs: {
                    optionType: 'level-1'
                }
            },{
                props: {
                    value: 'option-2-value',
                    label: 'option-2-label',
                    innerText: 'option-2'
                },
                attrs: {
                    optionType: 'level-1'
                }
            },{
                props: {
                    label: 'option-3'
                },
                options: [{
                    props: {
                        value: 'option-3.1-value',
                        label: 'option-3.1-label',
                        innerText: 'option-3.1'
                    },
                    attrs: {
                        optionType: 'level-2'
                    }
                },{
                    props: {
                        value: 'option-3.2-value',
                        label: 'option-3.2-label',
                        innerText: 'option-3.2'
                    },
                    attrs: {
                        optionType: 'level-2'
                    }
                }]
            },{
                props: {
                    value: 'option-4-value',
                    label: 'option-4-label',
                    innerText: 'option-4'
                },
                attrs: {
                    optionType: 'level-1'
                }
            }]
    }));
    */
    
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
        const breedListUrl = 'https://dog.ceo/api/breeds/list/all';
        fetch(breedListUrl).
            then(response => response.json()).
            then(json => {
                console.log(json);
                getElem('#breed-list').appendChild(select({
                    options: [{
                        props: {
                            disabled: true,
                            selected: true,
                            innerText: 'Pick a doggo...'
                        }
                    },{
                        props: {
                            label: 'any',
                            value: 'any',
                            innerText: 'any doggo'
                        },
                        attrs: {
                            optionType: 'random'
                        }
                    }].concat(json.message[getOwnProperties]().map( breed => (
                        breed.value.length ? {
                            props: {
                                label: breed.name
                            },
                            options: [{
                                props: {
                                    label: breed.name,
                                    value: breed.name,
                                    innerText: 'any '+breed.name
                                },
                                attrs: {
                                    optionType: 'breed',
                                    breed: breed.name
                                }
                            }].concat(breed.value.map(subBreed => ({
                                props: {
                                    label: subBreed,
                                    value: subBreed,
                                    innerText: subBreed
                                },
                                attrs: {
                                    optionType: 'sub-breed',
                                    breed: breed.name,
                                    subBreed: subBreed
                                }
                            })))
                        } : {
                            props: {
                                label: breed.name,
                                value: breed.name,
                                innerText: breed.name
                            },
                            attrs: {
                                optionType: 'breed',
                                breed: breed.name
                            }
                        })))
                }));
            });
    })();

})();
