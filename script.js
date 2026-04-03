
let error=document.getElementById('error');
let loader=document.getElementById('loading');
let searchInput=document.getElementById('country-input');
let searchBtn=document.getElementById('search-btn');
let countryDetails=document.getElementById('country-data')

let map;
let country;

function drawMap(latlng, name) {
    const [lat, lng] = latlng;

    if (!map) {
        map = L.map("map", {
            minZoom: 1
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            noWrap: true
        }).addTo(map);
    }

    const bounds = [
        [lat - 5, lng - 5],
        [lat + 5, lng + 5]
    ];

    map.fitBounds(bounds);

    L.marker([lat, lng])
        .addTo(map)
        .bindPopup(name)
        .openPopup();
}


async function fetchCountry(name){
    loader.classList.remove('loading');
    error.classList.add('error');
    try{
        let response=await fetch(`https://restcountries.com/v3.1/name/${name}?fullText=true`);
        let data=await response.json();
        console.log('data:',data[0]);
        country=data[0];

        if(!country){
            throw new Error('invalid country name->have check on spelling');
        } 

        let languages=country.languages?Object.values(country.languages).join(','):NA
        let currencies = country.currencies?Object.values(country.currencies).map(c => c.name).join(", "):"N/A";
        let timezones = country.timezones?.join(", ") || "N/A";

        countryDetails.innerHTML = `
            <div class="card">
                <div class="top">
                    <img class="flag" src="${country.flags.svg}" alt="flag"/>
                    <div>
                        <h2>${country.name.common}</h2>
                        <p>${country.name.official}</p>
                    </div>
                </div>

                <div class="info">
                    <p><strong>Capital:</strong> ${country.capital}</p>
                    <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
                    <p><strong>Region:</strong> ${country.region} (${country.subregion})</p>
                    <p><strong>Languages:</strong> ${languages}</p>
                    <p><strong>Currency:</strong> ${currencies}</p>
                    <p><strong>Timezones:</strong> ${timezones}</p>
                </div>

                <div class="extra">
                    <img class="coat" src="${country.coatOfArms.svg}" alt="coat"/>
                    <a href="${country.maps.googleMaps}" target="_blank">View on Google Maps</a>
                </div>
            </div>
        `;
        drawMap(country.latlng,country.name.common);

    }
    catch(err){
        error.classList.remove('error');
        error.innerText=err.message || `failed to load data`;
    }
    finally{
        loader.classList.add('loading');
    }
}

// fetchCountry('India');


searchBtn.addEventListener('click',()=>{
    let countryName=searchInput.value.trim();
    if(!countryName) return ;
    fetchCountry(countryName);
})


let favBtn=document.getElementById('fav-btn');
let p_fav=document.getElementById('store-fav');

function addFavourite(country){
    console.log('fav:',country);
    let fav=JSON.parse(localStorage.getItem('favorites')) || [];
    if(fav.some((any)=>any.name==country.name.common)) return;
    fav.push({
        name:country.name.common,
        flag:country.flags.svg,
    })
    console.log('fav-after-check',fav);
    
    localStorage.setItem('favorites',JSON.stringify(fav));
    console.log('fav-data-after set',JSON.parse(localStorage.getItem('favorites')));
}

function loadFavorites(){
    let favs=JSON.parse(localStorage.getItem('favorites')) || [];
    if(!favs){
        return 'no fav elements exist'
    }
    p_fav.innerHTML=``;
    favs.forEach((fav)=>{
        let div=document.createElement('div');
        div.classList.add('fav-data');
        div.id='fav-data'
        div.innerHTML=`
            <img src="${fav.flag}" width="30"/>
            <span>${fav.name}</span>
        `;
        p_fav.appendChild(div);
    })

    let favCountry=document.getElementsByClassName('fav-data');
    let favCountryArr=[...favCountry];
    console.log(favCountryArr);
    
    favCountryArr.forEach((data,index)=>{
        data.addEventListener('click',()=>{
            console.log(data.innerText);
            fetchCountry(data.innerText);
        })
    })
}



favBtn.addEventListener('click',()=>{
    console.log('country',country);
    addFavourite(country);
});

window.addEventListener('DOMContentLoaded',loadFavorites)



// console.log([...favCountry]);

