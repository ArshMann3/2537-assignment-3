const PAGE_SIZE = 5;
let currentPage = 1;
let pokemons = []


const updatePaginationDiv = (currentPage, numPages) => {
    $('#pagination').empty();

    const maxButtons = 5;
    const halfMaxButtons = Math.floor(maxButtons / 2);

    let startPage = Math.max(currentPage - halfMaxButtons, 1);
    let endPage = Math.min(startPage + maxButtons - 1, numPages);

    if (endPage - startPage + 1 < maxButtons) {
        startPage = Math.max(endPage - maxButtons + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        $('#pagination').append(`
        <button class="btn btn-primary page ml-1 numberedButtons" value="${i}">${i}</button>
      `);
    }
};


const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
    const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
    currentPage = Math.max(1, Math.min(currentPage, numPages));
    selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

    $('#pokeCards').empty()
    selected_pokemons.forEach(async (pokemon) => {
        const res = await axios.get(pokemon.url)
        $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
        $('#currentCount').text(selected_pokemons.length);
        $('.numberedButtons').removeClass('active-page-button');

        $(`.numberedButtons[value="${currentPage}"]`).addClass('active-page-button');
    })
}


const setup = async () => {
    $('#pokeCards').empty();
    let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
    console.log(response);
    pokemons = response.data.results;

    paginate(currentPage, PAGE_SIZE, pokemons);
    const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
    updatePaginationDiv(currentPage, numPages);

    let pokeTypes = [];
    pokemons.forEach(async (pokemon) => {
        let pokeData = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`)
        for (let i = 0; i < pokeData.data.types.length; i++) {
            if (!(pokeTypes.includes(pokeData.data.types[i].type.name))) {
                console.log(pokeData.data.types[i].type.name);
                pokeTypes.push(pokeData.data.types[i].type.name);
            }
        }
        const pokemonCheckboxesDiv = document.getElementById("pokemonCheckboxes");
        htmlChecks = ``;
        for (let i = 0; i < pokeTypes.length; i++) {
            htmlChecks += `
            <label for="${pokeTypes[i]}">${pokeTypes[i]}</label>
            <input type="checkbox" id="${pokeTypes[i]}" name="${pokeTypes[i]}">
            `;
        }
        pokemonCheckboxesDiv.innerHTML = htmlChecks;
    });

    $('#nextButton').on('click', () => {
        currentPage = Math.min(currentPage + 1, numPages);
        paginate(currentPage, PAGE_SIZE, pokemons);
        updatePaginationDiv(currentPage, numPages)
        updateButtonVisibility()
    });

    $('#prevButton').on('click', () => {
        currentPage = Math.max(currentPage - 1, 1);
        paginate(currentPage, PAGE_SIZE, pokemons);
        updatePaginationDiv(currentPage, numPages)
        updateButtonVisibility()
    });

    $('#prevButton').hide();

    $(`.numberedButtons[value="${currentPage}"]`).addClass('active-page-button');

    $('#currentCount').text(PAGE_SIZE);
    $('#totalCount').text(pokemons.length);

    $('body').on('click', '.pokeCard', async function (e) {
        const pokemonName = $(this).attr('pokeName')
        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
        console.log("res.data: ", res.data);
        console.log(res.data.types);
        for (let i = 0; i < res.data.types.length; i++) {
            console.log(res.data.types[i].type.name);
        }
        const types = res.data.types.map((type) => type.type.name)
        console.log(types);
        $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
        $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
    })

    $('body').on('click', ".numberedButtons", async function (e) {
        currentPage = Number(e.target.value)
        paginate(currentPage, PAGE_SIZE, pokemons)

        updatePaginationDiv(currentPage, numPages)
        updateButtonVisibility()
    })

}

const updateButtonVisibility = () => {
    const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
    if (currentPage === 1) {
        $('#prevButton').hide();
    } else {
        $('#prevButton').show();
    }
    if (currentPage === numPages) {
        $('#nextButton').hide();
    } else {
        $('#nextButton').show();
    }
};

$(document).ready(setup)