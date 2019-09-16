
(function() {
    /* monkey patch Object */
    Object.prototype.assign = function (obj) {
        return Object.assign(this,obj);
    };
    Object.prototype.getOwnProperties = function () {
        return Object.getOwnPropertyNames(this).
            map(name => ({
                name: name,
                value: this[name]
            }));
    };

    /* monkey patch HTMLElement */
    HTMLElement.prototype.setAttr = function (obj) {
        for (const prop of obj.getOwnProperties()) {
            this.setAttribute(prop.name,prop.value);
        }
        return this;
    };

    const DOGURL = 'https://dog.ceo/api/breeds/image/random';

    const addDogButton = document.querySelector('button#add-dog');
    addDogButton.addEventListener('click',() => {
        fetch(DOGURL).
            then(response => response.json()).
            then(json => {
                document.querySelector('.doggos').
                    appendChild(document.createElement('img').
                                assign({
                                    src : json.message,
                                    alt : 'Cute doggo!'
                                }));
                addDogButton.scrollIntoView();
            });
        
    });
    addDogButton.focus();
    
    /* build breed select list */
    (function () {
        breedListUrl = 'https://dog.ceo/api/breeds/list/all';
        fetch(breedListUrl).
            then(response => response.json()).
            then(json => {
                console.log(json);
                const breedList = json.message;
                const select = document.querySelector('select#breed-list');
                select.appendChild(document.createElement('option').
                                   assign({
                                       value: 'anyBreed',
                                       selected: true,
                                       innerText: 'any doggo'
                                   }).setAttr({
                                       optionType: 'any'
                                   }));
                for(const breed in breedList) {
                    if (breedList.hasOwnProperty(breed)){
                        const subBreeds = json.message[breed];
                        select.appendChild((() => {
                            switch (subBreeds.length) {
                            case 0:
                                return document.createElement('option').
                                    assign({
                                        value: breed,
                                        innerText: breed
                                    }).setAttr({
                                        optionType: 'breed'
                                    });
                            case 1:
                                return document.createElement('option').
                                    assign({
                                        value: breed,
                                        innerText: breed + ' ' + subBreeds[0]
                                    }).setAttr({
                                        optionType: 'subBreed'
                                    });
                            default:
                                const group = document.createElement('optgroup').
                                      assign({
                                          label: breed
                                      });
                                group.appendChild(document.createElement('option').
                                                  assign({
                                                      value: breed,
                                                      innerText: 'any '+breed
                                                  }).setAttr({
                                                      optionType: 'breed'
                                                  }));
                                for (const subBreed of subBreeds) {
                                    group.appendChild(document.createElement('option').
                                                      assign({
                                                          value: subBreed,
                                                          innerText: subBreed
                                                      }).setAttr({
                                                          optionType: 'subBreed'
                                                      }));
                                }
                                return group;
                            }
                        })());
                    };
                } 
            });
    })();

})();
