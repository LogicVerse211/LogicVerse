
// =====================================
// LOGICVERSE - MISSION CATALOGUE
// SEARCH AND FILTER FUNCTIONALITY
// =====================================

const searchInput = document.getElementById("searchInput");

const difficultyFilter = document.getElementById("difficultyFilter");

const topicFilter = document.getElementById("topicFilter");

const missionCards = document.querySelectorAll(".mission-card");

const noResults = document.getElementById("noResults");


// FILTER FUNCTION

function filterMissions() {

    const searchValue = searchInput.value.toLowerCase().trim();

    const difficultyValue = difficultyFilter.value;

    const topicValue = topicFilter.value;

    let visibleCount = 0;


    missionCards.forEach(function(card) {

        const missionName = card.dataset.name.toLowerCase();

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


    // NO RESULTS MESSAGE

    if (visibleCount === 0) {

        noResults.hidden = false;

    } else {

        noResults.hidden = true;

    }

}


// EVENT LISTENERS

searchInput.addEventListener("input", filterMissions);

difficultyFilter.addEventListener("change", filterMissions);

topicFilter.addEventListener("change", filterMissions);
