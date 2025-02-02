console.log("Koden är länkad!");

let latestQuery = "";

// DOM-referenser
const formEl = document.getElementById("search-form");
const inputEl = document.getElementById("searchInput");
const universitiesContainerEl = document.getElementById("universities-container");
const imageCountEl = document.getElementById("results-count");
const totalUniversitiesEl = document.getElementById("total-universities"); // Footer
const nextPageBtn = document.getElementById("next-page-button");
const prevPageBtn = document.getElementById("prev-page-button");

// Funktion för att hämta universitet och flagga baserat på land
async function fetchUniversities(query, count) {
    const endpoint = `http://universities.hipolabs.com/search?country=${query}`;
    const flagEndpoint = `https://restcountries.com/v3.1/name/${query}`;

    try {
        // Hämta flagga
        const flagResponse = await fetch(flagEndpoint);
        if (!flagResponse.ok) throw new Error(`Error fetching flag: ${flagResponse.status}`);
        
        const flagData = await flagResponse.json();
        const flagUrl = flagData[0]?.flags?.svg || '';  // Hämta flagg-URL
         
        //Lösa Problem 1 : Behöver vissa flagg image(.svg) och byta flagg efter söka annan länd(country) ??

        // Sätt bakgrundsbilden för landet
        setCountryBackground(flagUrl);    // ??  Det finns lite problem när jag söka annan länd funkar bra att byta flagg men gammla lokal storage finns forfatarande i web browser

        // Hämta universitet
        const response = await fetch(endpoint);
        event.preventDefault();
        if (!response.ok) throw new Error(`Error fetching universities: ${response.status}`);
        
        const data = await response.json();
        console.log("Hämtade universitet:", data);
        console.log(flagUrl);
        console.log(data.length);
        //Complete 1 : behöver vissa Hämtade universitet i web browser  ?? hur


        // Begränsa antalet resultat enligt användarens val
        const limitedResults = data.slice(0, count);     // Där jag spara direkt i LokalStorage med samma nummber med (Variabel limitResults) jag vilja vissa (3/6/9 ....)

        // Spara i localStorage
        localStorage.setItem("all_universities", JSON.stringify(limitedResults));

        // Uppdatera footern med totalantalet universitet  finns i console the totalantalet för universitet i samma länd 

        // Tex. sweden(36) spain(97) somalia(17) Chile(65) Philippines(118) Russian Federation(309) Thailand(67)
        //  japan(571) India(462) China(397) France(297) United Kingdom(191) Turkey(184) canada(184) Brazil(181)

        updateTotalUniversities(data.length);

        // Rendera på sidan ,,,, Här jag göra nya data i lockal Storage med välja country och count(limitResults)
        renderUniversitiesToUI(limitedResults);

    } catch (error) {
        console.error("Fel vid hämtning av data:", error);
    }
}

// Funktion för att uppdatera totalantalet universitet i footern
function updateTotalUniversities(total) {
    totalUniversitiesEl.textContent = `Totalt antal universitet i landet: ${total}`;
}

// Funktion för att sätta bakgrundsbild för landet
function setCountryBackground(flagUrl) {
    const body = document.body;
    if (flagUrl) {
        body.style.backgroundImage = `url(${flagUrl})`;
        body.style.backgroundSize = 'cover';
        body.style.backgroundPosition = 'center';
        body.style.backgroundAttachment = 'fixed';
     //   body.style.transition = 'background-image 0.5s ease-in-out';
    }
}

// Funktion för att rendera universitet på sidan
function renderUniversitiesToUI(universities) {
    universitiesContainerEl.innerHTML = "";

    if (!universities || universities.length === 0) {
        universitiesContainerEl.innerHTML = "<p>Inga universitet hittades.</p>";
        return;
    }

    const universityCardsAsString = universities.map((u) => createUniversityCard(u)).join("");
    universitiesContainerEl.innerHTML = universityCardsAsString;

    // Lägg till eventlyssnare på de nya checkboxarna
    addCheckboxListeners();
}

// Funktion för att skapa ett universitet-kort
function createUniversityCard(university) {
    return `
    <article id="${university.name}" class="university-card">
        <figure>
            <div class="status-indicator red" style="color: blue;"></div> <!-- Indikator för gillning -->
            <div>
            <label for="${university.name}">${university.country}</label>
            <span>Spara:</span>
            <input class="like-checkbox" id="${university.name}" type="checkbox" data-university-name="${university.name} style=" display: inline-block;">
            </div>
            </figure>
        <h2>${university.name}</h2>
        <a href="${university.web_pages ? university.web_pages[0] : '#'}" target="_blank">
            Besök universitetets webbplats
        </a>
    </article>
    `;
}

// Funktion för att lägga till eventlyssnare på gilla-checkboxar
function addCheckboxListeners() {
    document.querySelectorAll(".like-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", (event) => {
            const universityCard = event.target.closest(".university-card");
            const statusIndicator = universityCard.querySelector(".status-indicator");
            const universityName = event.target.dataset.universityName;

            if (event.target.checked) {
                statusIndicator.classList.remove("red");
                statusIndicator.classList.add("green");
                saveToFavorites(universityName);
            } else {
                statusIndicator.classList.remove("green");
                statusIndicator.classList.add("red");
                removeFromFavorites(universityName);
            }
        });
    });
}

// Spara favoriter i localStorage
function saveToFavorites(universityName) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!favorites.includes(universityName)) {
        favorites.push(universityName);
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }
}

// Ta bort från favoriter
function removeFromFavorites(universityName) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites = favorites.filter(name => name !== universityName);
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

// Eventlyssnare på sökformuläret
formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    console.log("Sökning startad!");

    const query = inputEl.value.trim();
    const count = parseInt(imageCountEl.value, 10) || 10;

    if (query) {
        fetchUniversities(query, count);
        latestQuery = query;
        inputEl.value = "";
        setCountryBackground(flagUrl);
    }
});

// Funktion för att ladda sparade universitet från localStorage vid sidladdning
function checkUniversities() {
    const allUniversities = JSON.parse(localStorage.getItem("all_universities")) || [];
   
    if (allUniversities.length > 0) {
        renderUniversitiesToUI(allUniversities);
        updateTotalUniversities(allUniversities.length);
    } else {
        console.log("Inga universitet sparade i LocalStorage ännu.");
    }
}

// Kör vid sidladdning
checkUniversities();