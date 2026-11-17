
// =====================================
// LOGICVERSE - MISSION CATALOGUE
// BACKEND API + SEARCH + FILTER
// =====================================

const API_URL = "/api/missions/";

const searchInput = document.getElementById("searchInput");
const difficultyFilter = document.getElementById("difficultyFilter");
const topicFilter = document.getElementById("topicFilter");
const missionGrid = document.getElementById("missionGrid");
const noResults = document.getElementById("noResults");

let missions = [];


// =====================================
// LOAD MISSIONS FROM DJANGO BACKEND
// =====================================

async function loadMissions() {

    try {

        missionGrid.innerHTML = "<p>Loading missions...</p>";

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load missions.");
        }

        missions = await response.json();

        displayMissions(missions);
        filterMissions();

    } catch (error) {

        console.error("Mission loading error:", error);

        missionGrid.innerHTML =
            "<p>Unable to load missions. Please try again later.</p>";

    }

}


// =====================================
// DISPLAY MISSION CARDS
// =====================================

function displayMissions(missionList) {

    missionGrid.innerHTML = "";

    missionList.forEach(function(mission, index) {

        const algorithm = (mission.algorithm || "").toLowerCase();

        let topic = "searching";
        let imageClass = "binary-image";
        let missionIcon = "🔎";

        if (algorithm.includes("bfs")) {

            topic = "graph";
            imageClass = "bfs-image";
            missionIcon = "🗺️";

        } else if (algorithm.includes("dijkstra")) {

            topic = "graph";
            imageClass = "dijkstra-image";
            missionIcon = "🚀";

        }

        const difficulty = (mission.difficulty || "beginner").toLowerCase();

        const card = document.createElement("div");

        card.className = "mission-card";

        card.dataset.name = (
            (mission.title || "") + " " +
            (mission.algorithm || "")
        ).toLowerCase();

        card.dataset.difficulty = difficulty;
        card.dataset.topic = topic;

        const number = String(index + 1).padStart(2, "0");

        card.innerHTML = `
            <div class="mission-image ${imageClass}">

                <span class="mission-number">${number}</span>

                <span class="mission-icon">${missionIcon}</span>

            </div>

            <div class="mission-content">

                <span class="mission-level ${difficulty}">
                    ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </span>

                <h3>${escapeHTML(mission.title)}</h3>

                <p>${escapeHTML(mission.description)}</p>

                <div class="mission-meta">
                    <span>${escapeHTML(mission.algorithm)}</span>
                    <span>Interactive Mission</span>
                </div>

                <a href="/mission/?id=${encodeURIComponent(mission.id)}" class="card-btn">
                    Explore Mission →
                </a>

            </div>
        `;

        missionGrid.appendChild(card);

    });

}


// =====================================
// ESCAPE HTML
// =====================================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, function(char) {

        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char];

    });

}


// =====================================
// SEARCH AND FILTER
// =====================================

function filterMissions() {

    const searchValue = searchInput.value.toLowerCase().trim();

    const difficultyValue = difficultyFilter.value;

    const topicValue = topicFilter.value;

    const missionCards = document.querySelectorAll(".mission-card");

    let visibleCount = 0;

    missionCards.forEach(function(card) {

        const missionName = card.dataset.name;

        const difficulty = card.dataset.difficulty;

        const topic = card.dataset.topic;

        const matchesSearch = missionName.includes(searchValue);

        const matchesDifficulty =
            difficultyValue === "all" ||
            difficulty === difficultyValue;

        const matchesTopic =
            topicValue === "all" ||
            topic === topicValue;

        if (
            matchesSearch &&
            matchesDifficulty &&
            matchesTopic
        ) {

            card.style.display = "block";

            visibleCount++;

        } else {

            card.style.display = "none";

        }

    });

    noResults.hidden = visibleCount !== 0;

}


// =====================================
// EVENT LISTENERS
// =====================================

searchInput.addEventListener("input", filterMissions);

difficultyFilter.addEventListener("change", filterMissions);

topicFilter.addEventListener("change", filterMissions);


// =====================================
// INITIALIZE
// =====================================

loadMissions();
