const friendProfiles = {
    "danielman73-dani": {
        name: "Danielman73-dani",
        status: "En línea",
        online: true,
        avatar: "./imagenes/amigos/bucay.jpg"
    },
    "briyitt_005": {
        name: "briyitt_005",
        status: "En línea",
        online: true,
        avatar: "./imagenes/amigos/briyit.jpg"
    },
    "SerGGio_15": {
        name: "SerGGio_15",
        status: "Desconectado",
        online: false,
        avatar: "./imagenes/amigos/Sergio.jpg"
    }
};

const modal = document.querySelector("#friend-modal");
const nameElement = document.querySelector("#friend-profile-name");
const avatarElement = document.querySelector("#friend-profile-avatar");
const statusElement = document.querySelector("#friend-profile-status");
const dotElement = document.querySelector("#friend-profile-dot");
const gallery = document.querySelector("#video-gallery");
const emptyMessage = document.querySelector("#video-gallery-empty");
const uploadInput = document.querySelector("#video-upload-input");
const videosByFriend = new Map();
const featuredVideosByFriend = {
    "danielman73-dani": [{ type: "youtube", id: "hFXy86p9l-Q", name: "Vídeo de Bucay" }],
    "briyitt_005": [{ type: "youtube", id: "F42bOxS6QGU", name: "Vídeo de Briyit" }]
};
let activeFriend = null;
let previouslyFocused = null;

function youtubeEmbedUrl(videoId) {
    const params = new URLSearchParams({
        autoplay: "1",
        mute: "1",
        controls: "0",
        disablekb: "1",
        fs: "0",
        rel: "0",
        playsinline: "1",
        loop: "1",
        playlist: videoId
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

function stopGalleryPlayback() {
    gallery.querySelectorAll(".video-card.is-expanded").forEach((card) => {
        const iframe = card.querySelector("iframe");
        const video = card.querySelector("video");
        if (iframe) iframe.src = "about:blank";
        if (video) video.pause();
        card.classList.remove("is-expanded", "is-playing");
    });
}

gallery.addEventListener("mouseleave", stopGalleryPlayback);

function renderGallery(friendId) {
    gallery.replaceChildren();
    const videos = [...(featuredVideosByFriend[friendId] || []), ...(videosByFriend.get(friendId) || [])];
    emptyMessage.hidden = videos.length > 0;

    for (const item of videos) {
        const card = document.createElement("article");
        card.className = "video-card";
        card.tabIndex = 0;

        let player;
        let poster;
        if (item.type === "youtube") {
            player = document.createElement("iframe");
            player.src = "about:blank";
            player.title = item.name;
            player.loading = "lazy";
            player.allow = "autoplay; encrypted-media";
            player.tabIndex = -1;
            poster = document.createElement("img");
            poster.className = "video-card__poster";
            poster.src = `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;
            poster.alt = `Portada del vídeo: ${item.name}`;
            poster.loading = "lazy";
            player.addEventListener("load", () => {
                if (card.classList.contains("is-expanded")) card.classList.add("is-playing");
            });
            card.addEventListener("mouseenter", () => {
                card.classList.add("is-expanded");
                player.src = youtubeEmbedUrl(item.id);
            });
            card.addEventListener("focusin", () => {
                card.classList.add("is-expanded");
                player.src = youtubeEmbedUrl(item.id);
            });
            card.addEventListener("focusout", (event) => {
                if (!card.contains(event.relatedTarget)) {
                    player.src = "about:blank";
                    card.classList.remove("is-expanded", "is-playing");
                }
            });
        } else {
            player = document.createElement("video");
            player.src = item.url;
            player.muted = true;
            player.loop = true;
            player.playsInline = true;
            player.preload = "metadata";
            player.setAttribute("aria-label", item.file.name);
            card.addEventListener("mouseenter", () => { card.classList.add("is-expanded"); player.play().catch(() => {}); });
            card.addEventListener("focusin", () => { card.classList.add("is-expanded"); player.play().catch(() => {}); });
            card.addEventListener("focusout", (event) => {
                if (!card.contains(event.relatedTarget)) { player.pause(); card.classList.remove("is-expanded"); }
            });
            card.addEventListener("click", (event) => {
                if (event.target.closest(".video-card__remove")) return;
                if (player.paused) player.play().catch(() => {});
                else player.pause();
            });
        }

        const caption = document.createElement("span");
        caption.className = "video-card__name";
        caption.textContent = item.name || item.file.name;

        card.append(player);
        if (poster) card.append(poster);
        card.append(caption);
        if (item.type !== "youtube") {
            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "video-card__remove";
            removeButton.setAttribute("aria-label", `Quitar ${item.file.name}`);
            removeButton.textContent = "×";
            removeButton.addEventListener("click", () => removeVideo(friendId, item));
            card.append(removeButton);
        }
        gallery.append(card);
    }
}

function openProfile(friendId, trigger) {
    const profile = friendProfiles[friendId];
    if (!profile) return;

    activeFriend = friendId;
    previouslyFocused = trigger;
    nameElement.textContent = profile.name;
    avatarElement.src = profile.avatar;
    avatarElement.alt = `Foto de perfil de ${profile.name}`;
    statusElement.textContent = profile.status;
    dotElement.className = `dot ${profile.online ? "online" : "offline"}`;
    renderGallery(friendId);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modal.querySelector(".profile-close").focus();
}

function closeProfile() {
    if (!modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    activeFriend = null;
    previouslyFocused?.focus();
}

function removeVideo(friendId, item) {
    const videos = videosByFriend.get(friendId) || [];
    videosByFriend.set(friendId, videos.filter((video) => video !== item));
    URL.revokeObjectURL(item.url);
    renderGallery(friendId);
}

document.querySelectorAll(".friend-button").forEach((button) => {
    button.addEventListener("click", () => openProfile(button.dataset.friend, button));
});

modal.querySelectorAll("[data-close-modal]").forEach((element) => {
    element.addEventListener("click", closeProfile);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeProfile();
});

uploadInput.addEventListener("change", () => {
    if (!activeFriend) return;
    const newVideos = [...uploadInput.files]
        .filter((file) => file.type.startsWith("video/"))
        .map((file) => ({ file, url: URL.createObjectURL(file) }));
    const existingVideos = videosByFriend.get(activeFriend) || [];
    videosByFriend.set(activeFriend, [...existingVideos, ...newVideos]);
    uploadInput.value = "";
    renderGallery(activeFriend);
});
