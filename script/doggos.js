
(function() {
    /* monkey patch Object */
    Object.prototype.assign = function (obj) {
        return Object.assign(this,obj);
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
                                    alt : 'Cute dog!'
                                }));
                setTimeout(addDogButton.scrollIntoView(),3000);
            });
        
    });
    addDogButton.focus();
    
    console.log(fetch);

})();
