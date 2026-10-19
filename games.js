/*
 * EDITA LOS JUEGOS AQUÍ:
 * title: nombre que aparece en la tarjeta y en la ficha.
 * image: URL de la portada o ruta local, por ejemplo ./imagenes/juegos/mi-juego.jpg.
 * hours: horas jugadas (solo el número; no añadas "h").
 * lastPlayed: texto opcional, por ejemplo "Ayer" o "En septiembre de 2026". Déjalo vacío para ocultarlo.
 * note: texto personal opcional que aparece en la ficha. Déjalo vacío si no quieres mostrarlo.
 * steamUrl: enlace a la ficha del juego en Steam; al pulsarlo abre su página de compra.
 * recentOrder: orden manual en "Recientes"; número mayor = aparece antes.
 * favorite: pon true en tus favoritos y aparecerán al pulsar la pestaña Favoritos.
 *
 * Para añadir otro juego, copia uno de los objetos completos dentro de la lista games.
 */
const games = [
    {
        title: "Helldivers 2",
        image: "https://i.pinimg.com/1200x/b4/ae/f6/b4aef6c671709f3768c30935b8b61b69.jpg",
        hours: 500,
        lastPlayed: "",
        note: "",
        steamUrl: "https://store.steampowered.com/app/553850/HELLDIVERS_2/",
        recentOrder: 2,
        favorite: false
    },
    {
        title: "Risk of Rain 2",
        image: "https://i.pinimg.com/1200x/6f/d3/51/6fd3518bc0d7a0c24725ce2ffec95f23.jpg",
        hours: 900,
        lastPlayed: "",
        note: "",
        steamUrl: "https://store.steampowered.com/app/632360/Risk_of_Rain_2/",
        recentOrder: 1,
        favorite: false
    }
];

const gamesGrid = document.querySelector("#games-grid");
const gamesEmpty = document.querySelector("#games-empty");
const gamesHeading = document.querySelector("#games-heading");
const gamesTabs = document.querySelector(".game-tabs");
const gamesTabsIndicator = document.querySelector(".game-tabs__indicator");
const gameModal = document.querySelector("#game-modal");
const gameTitle = document.querySelector("#game-detail-title");
const gameCover = document.querySelector("#game-detail-cover");
const gameHours = document.querySelector("#game-detail-hours");
const gameLastPlayed = document.querySelector("#game-detail-last-played");
const gameNote = document.querySelector("#game-detail-note");
const gameSteamLink = document.querySelector("#game-detail-link");
let lastGameTrigger = null;

function formatHours(hours) {
    const number = Number(hours) || 0;
    return `${number.toLocaleString("es-ES")} ${number === 1 ? "hora" : "horas"} registradas`;
}

function openGameDetails(game, trigger) {
    lastGameTrigger = trigger;
    gameTitle.textContent = game.title;
    gameCover.src = game.image;
    gameCover.alt = `Portada de ${game.title}`;
    gameHours.textContent = formatHours(game.hours);

    gameLastPlayed.hidden = !game.lastPlayed;
    gameLastPlayed.textContent = game.lastPlayed ? `Última vez: ${game.lastPlayed}` : "";
    gameNote.hidden = !game.note;
    gameNote.textContent = game.note || "";

    gameSteamLink.hidden = !game.steamUrl;
    if (game.steamUrl) gameSteamLink.href = game.steamUrl;

    gameModal.classList.add("is-open");
    gameModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    gameModal.querySelector(".game-detail__close").focus();
}

function closeGameDetails() {
    if (!gameModal.classList.contains("is-open")) return;
    gameModal.classList.remove("is-open");
    gameModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    lastGameTrigger?.focus();
}

function createGameCard(game) {
    const card = document.createElement("button");
    card.className = "game-card";
    card.type = "button";
    card.setAttribute("aria-haspopup", "dialog");
    card.setAttribute("aria-label", `Ver detalles de ${game.title}`);

    const image = document.createElement("img");
    image.className = "game-card__image";
    image.src = game.image;
    image.alt = `Portada de ${game.title}`;
    image.loading = "lazy";

    const overlay = document.createElement("span");
    overlay.className = "game-card__overlay";

    const overlayHours = document.createElement("span");
    overlayHours.className = "game-card__hours";
    overlayHours.textContent = formatHours(game.hours);
    overlay.append(overlayHours);

    if (game.lastPlayed) {
        const lastPlayed = document.createElement("span");
        lastPlayed.className = "game-card__last-played";
        lastPlayed.textContent = `Última vez: ${game.lastPlayed}`;
        overlay.append(lastPlayed);
    }

    const action = document.createElement("span");
    action.className = "game-card__action";
    action.textContent = "Ver ficha";
    overlay.append(action);

    const details = document.createElement("span");
    details.className = "game-card__details";
    const title = document.createElement("strong");
    title.className = "game-card__title";
    title.textContent = game.title;
    const hours = document.createElement("span");
    hours.className = "game-card__hours-summary";
    hours.textContent = `${Number(game.hours) || 0} h`;
    details.append(title, hours);

    const artwork = document.createElement("span");
    artwork.className = "game-card__artwork";
    artwork.append(image, overlay);
    card.append(artwork, details);
    card.addEventListener("click", () => openGameDetails(game, card));
    return card;
}

function renderGames(filter = "recent") {
    let visibleGames = [...games];

    if (filter === "favorites") {
        visibleGames = visibleGames.filter((game) => game.favorite);
    } else if (filter === "most-played") {
        visibleGames.sort((a, b) => Number(b.hours) - Number(a.hours));
    } else {
        visibleGames.sort((a, b) => Number(b.recentOrder || 0) - Number(a.recentOrder || 0));
    }

    gamesGrid.replaceChildren(...visibleGames.map(createGameCard));
    gamesEmpty.hidden = visibleGames.length > 0;
}

function moveGamesTabsIndicator(tab = gamesTabs.querySelector(".game-tab.is-active")) {
    if (!tab || !gamesTabsIndicator) return;
    const tabsRect = gamesTabs.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    const left = tabRect.left - tabsRect.left - gamesTabs.clientLeft;
    gamesTabsIndicator.style.width = `${tabRect.width}px`;
    gamesTabsIndicator.style.left = `${left}px`;
}

document.querySelectorAll(".game-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        const filter = tab.dataset.gameFilter;
        const headingByFilter = {
            recent: "Juegos recientes",
            "most-played": "Juegos más jugados",
            favorites: "Juegos favoritos"
        };
        document.querySelectorAll(".game-tab").forEach((item) => {
            const active = item === tab;
            item.classList.toggle("is-active", active);
            item.setAttribute("aria-pressed", String(active));
        });
        moveGamesTabsIndicator(tab);
        gamesHeading.textContent = headingByFilter[filter] || "Mis videojuegos";
        gamesGrid.setAttribute("aria-label", headingByFilter[filter] || "Mis videojuegos");
        renderGames(filter);
    });
});

moveGamesTabsIndicator();
window.addEventListener("resize", () => moveGamesTabsIndicator());
if (document.fonts?.ready) document.fonts.ready.then(() => moveGamesTabsIndicator());

renderGames("recent");

gameModal.querySelectorAll("[data-close-game]").forEach((element) => {
    element.addEventListener("click", closeGameDetails);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeGameDetails();
});





