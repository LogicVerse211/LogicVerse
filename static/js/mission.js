// =====================================
// LOGICVERSE - UNIVERSAL MISSION SYSTEM
// BINARY SEARCH + BFS + DIJKSTRA
// BACKEND DRIVEN VISUALIZATION
// AUTO NEXT STEP & COMPLETION
// =====================================

const API_URL = "/api/missions/";

const urlParams = new URLSearchParams(window.location.search);
const missionId = urlParams.get("id");

// =====================================
// HTML ELEMENTS
// =====================================

const missionTitle = document.getElementById("missionTitle");
const missionLabel = document.getElementById("missionLabel");
const missionDescription = document.getElementById("missionDescription");
const missionAlgorithm = document.getElementById("missionAlgorithm");
const missionDifficulty = document.getElementById("missionDifficulty");

const storyTitle = document.getElementById("storyTitle");
const missionStory = document.getElementById("missionStory");
const missionInstructions = document.getElementById("missionInstructions");
const missionGoal = document.getElementById("missionGoal");
const algorithmExplanation = document.getElementById("algorithmExplanation");

const visualizationSection = document.getElementById("visualizationSection");
const visualDescription = document.getElementById("visualDescription");
const visualStepTitle = document.getElementById("visualStepTitle");
const visualStepExplanation = document.getElementById("visualStepExplanation");

const visualTargetBox = document.getElementById("visualTargetBox");
const visualTarget = document.getElementById("visualTarget");

const arrayContainer = document.getElementById("arrayContainer");
const graphContainer = document.getElementById("graphContainer");

const pointerInfo = document.getElementById("pointerInfo");
const visualStatus = document.getElementById("visualStatus");

const previousStepButton = document.getElementById("previousStepButton");
const nextStepButton = document.getElementById("nextStepButton");

const currentStepNumber = document.getElementById("currentStepNumber");
const totalStepNumber = document.getElementById("totalStepNumber");

const quizSection = document.getElementById("quizSection");

const decisionSection = document.getElementById("decisionSection");
const decisionContainer = document.getElementById("decisionContainer");
const decisionFeedback = document.getElementById("decisionFeedback");

// =====================================
// GLOBAL VARIABLES
// =====================================

let missionSteps = [];
let currentStepIndex = 0;
let currentAlgorithm = "";

let completedStepIds = new Set();

let answering = false;
let missionCompletionRequested = false;
let missionCompleted = false;

// =====================================
// AUTH TOKEN
// =====================================

function getToken() {
    return localStorage.getItem("access_token");
}

// =====================================
// LOAD MISSION
// =====================================

async function loadMission() {

    if (!missionId) {
        showError("No mission selected. Please go back to the catalogue.");
        return;
    }

    try {

        const response = await fetch(`${API_URL}${missionId}/`);

        if (!response.ok) {
            throw new Error("Mission not found.");
        }

        const mission = await response.json();

        displayMission(mission);

        await loadMissionSteps();

    } catch (error) {

        console.error("Mission loading error:", error);

        showError("Unable to load this mission. Please try again.");

    }
}

// =====================================
// DISPLAY MISSION INFORMATION
// =====================================

function displayMission(mission) {

    document.title = `${mission.title} | LogicVerse`;

    missionTitle.textContent = mission.title;

    missionLabel.textContent =
        `MISSION ${String(mission.id).padStart(2, "0")} • ${mission.difficulty}`;

    missionDescription.textContent = mission.description;

    missionAlgorithm.textContent = `📘 ${mission.algorithm}`;

    missionDifficulty.textContent =
        `⭐ ${mission.difficulty.charAt(0).toUpperCase() + mission.difficulty.slice(1)} Level`;

    storyTitle.textContent = mission.title;
    missionStory.textContent = mission.story;
    missionInstructions.textContent = mission.instructions;
    missionGoal.textContent = mission.learning_goal;

    algorithmExplanation.textContent =
        mission.learning_goal || mission.description;

    currentAlgorithm = (mission.algorithm || "").toLowerCase();

    if (quizSection) {
        quizSection.hidden = true;
    }
}

// =====================================
// LOAD MISSION STEPS
// =====================================

async function loadMissionSteps() {

    const token = getToken();

    if (!token) {

        showVisualizationMessage(
            "Please login with your Learner account to view the steps."
        );

        return;
    }

    try {

        // START MISSION AND SAVE PROGRESS
        const startResponse = await fetch(
            `${API_URL}${missionId}/start/`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!startResponse.ok) {
            throw new Error("Unable to start mission.");
        }

        // LOAD MISSION STEPS
        const response = await fetch(
            `${API_URL}${missionId}/steps/`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (response.status === 401 || response.status === 403) {

            showVisualizationMessage(
                "You are not authorized. Please login again with your Learner account."
            );

            return;
        }

        if (!response.ok) {
            throw new Error("Unable to load mission steps.");
        }

        const payload = await response.json();

        missionSteps = Array.isArray(payload)
            ? payload
            : (payload.results || []);

        if (missionSteps.length === 0) {

            showVisualizationMessage(
                "No steps have been added to this mission yet."
            );

            return;
        }

        currentStepIndex = 0;

        visualizationSection.hidden = false;

        visualDescription.textContent =
            "Follow the algorithm visualization and make the correct decision at each step.";

        renderCurrentStep();

    } catch (error) {

        console.error("Step loading error:", error);

        showVisualizationMessage(
            "Unable to load mission steps. Please try again."
        );

    }
}

// =====================================
// SHOW VISUALIZATION MESSAGE
// =====================================

function showVisualizationMessage(message) {

    visualizationSection.hidden = false;

    visualStepTitle.textContent = "Mission Visualization";
    visualStepExplanation.textContent = message;

    arrayContainer.innerHTML = "";
    graphContainer.innerHTML = "";

    arrayContainer.hidden = false;
    graphContainer.hidden = true;
    visualTargetBox.hidden = true;

    pointerInfo.textContent = "";
    visualStatus.textContent = message;

    previousStepButton.disabled = true;
    nextStepButton.disabled = true;

    if (decisionSection) {
        decisionSection.hidden = true;
    }
}

// =====================================
// UNIVERSAL VISUALIZATION RENDERER
// =====================================

function renderCurrentStep() {

    const step = missionSteps[currentStepIndex];

    if (!step) return;

    const data = step.visual_data || {};

    visualStepTitle.textContent =
        step.title || `Step ${currentStepIndex + 1}`;

    visualStepExplanation.textContent =
        step.explanation || step.description || "Follow this step carefully.";

    currentStepNumber.textContent = currentStepIndex + 1;
    totalStepNumber.textContent = missionSteps.length;

    previousStepButton.disabled =
        currentStepIndex === 0 || missionCompleted;

    nextStepButton.disabled =
        !completedStepIds.has(step.id) ||
        currentStepIndex === missionSteps.length - 1 ||
        missionCompleted;

    // Reset visualization
    arrayContainer.innerHTML = "";
    graphContainer.innerHTML = "";
    pointerInfo.textContent = "";

    // Visualization type selection
    const visualizationRenderers = {
        binary_search: renderBinarySearch,
        graph: renderGraphVisualization,
        weighted_graph: renderWeightedGraph
    };

    const renderer = visualizationRenderers[data.type];

    if (renderer) {

        renderer(data);

    } else {

        arrayContainer.hidden = false;
        graphContainer.hidden = true;
        visualTargetBox.hidden = true;

        visualStatus.textContent =
            `Visualization type "${data.type || "unknown"}" is not supported yet.`;

    }

    renderDecisionOptions(step);
}

// =====================================
// BINARY SEARCH VISUALIZATION
// =====================================

function renderBinarySearch(data) {

    arrayContainer.innerHTML = "";

    graphContainer.hidden = true;
    arrayContainer.hidden = false;

    const numbers = data.array || [];

    if (numbers.length === 0) {

        visualStatus.textContent =
            "No array data found for this step.";

        return;
    }

    if (data.target !== undefined) {

        visualTargetBox.hidden = false;
        visualTarget.textContent = data.target;

    } else {

        visualTargetBox.hidden = true;

    }

    const low = data.low;
    const high = data.high;
    const mid = data.mid;
    const foundIndex = data.found_index;

    numbers.forEach((number, index) => {

        const item = document.createElement("div");
        item.className = "array-item";

        const value = document.createElement("span");
        value.textContent = number;

        item.appendChild(value);

        if (
            data.discarded_range &&
            index >= data.discarded_range[0] &&
            index <= data.discarded_range[1]
        ) {

            item.classList.add("eliminated");

        } else if (
            low !== undefined &&
            high !== undefined &&
            (index < low || index > high) &&
            !data.completed
        ) {

            item.classList.add("eliminated");

        }

        if (mid !== undefined && index === mid) {
            item.classList.add("active");
        }

        if (
            data.completed &&
            foundIndex !== undefined &&
            index === foundIndex
        ) {

            item.classList.add("found");

        }

        const labels = [];

        if (low !== undefined && index === low) {
            labels.push("LOW");
        }

        if (mid !== undefined && index === mid) {
            labels.push("MID");
        }

        if (high !== undefined && index === high) {
            labels.push("HIGH");
        }

        if (labels.length > 0) {

            const pointer = document.createElement("small");
            pointer.className = "array-pointer";
            pointer.textContent = labels.join(" / ");

            item.appendChild(pointer);

        }

        arrayContainer.appendChild(item);

    });

    const pointerMessages = [];

    if (low !== undefined) {
        pointerMessages.push(`Low: ${low}`);
    }

    if (mid !== undefined) {
        pointerMessages.push(`Mid: ${mid}`);
    }

    if (high !== undefined) {
        pointerMessages.push(`High: ${high}`);
    }

    pointerInfo.textContent = pointerMessages.join("     |     ");

    if (data.completed && data.found) {

        visualStatus.textContent =
            `Target ${data.found_value} found at index ${data.found_index}.`;

    } else if (data.comparison === "less_than") {

        visualStatus.textContent =
            `${data.middle_value} is smaller than ${data.target}. Search the right half.`;

    } else if (data.comparison === "greater_than") {

        visualStatus.textContent =
            `${data.middle_value} is greater than ${data.target}. Search the left half.`;

    } else if (data.search_half === "right") {

        visualStatus.textContent =
            "The left half is discarded. Continue searching in the right half.";

    } else {

        visualStatus.textContent =
            "Follow the highlighted elements to understand this step.";

    }
}

// =====================================
// GRAPH / BFS VISUALIZATION
// =====================================

function renderGraphVisualization(data) {

    arrayContainer.hidden = true;
    graphContainer.hidden = false;
    visualTargetBox.hidden = true;

    graphContainer.innerHTML = "";
    pointerInfo.textContent = "";

    const nodes = data.nodes || [];
    const edges = data.edges || [];

    if (nodes.length === 0) {

        visualStatus.textContent =
            "No graph nodes found for this step.";

        return;
    }

    const width = 650;
    const height = 340;

    const svgNS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(svgNS, "svg");

    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("role", "img");

    svg.setAttribute("aria-label", "Graph visualization");

    svg.style.maxWidth = "650px";
    svg.style.display = "block";
    svg.style.margin = "auto";

    const positions = {};

    const centerX = width / 2;
    const centerY = 145;

    nodes.forEach((node, index) => {

        const angle =
            (2 * Math.PI * index / nodes.length) - Math.PI / 2;

        const radius = nodes.length <= 2 ? 0 : 105;

        positions[node] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };

    });

    // Draw edges
    edges.forEach(edge => {

        const [from, to] = edge;

        if (!positions[from] || !positions[to]) return;

        const line = document.createElementNS(svgNS, "line");

        line.setAttribute("x1", positions[from].x);
        line.setAttribute("y1", positions[from].y);
        line.setAttribute("x2", positions[to].x);
        line.setAttribute("y2", positions[to].y);
        line.setAttribute("stroke", "#94a3b8");
        line.setAttribute("stroke-width", "3");

        svg.appendChild(line);

    });

    const visited = data.visited || [];
    const queue = data.queue || [];
    const neighbors = data.highlight_neighbors || [];
    const shortestPath = data.shortest_path || [];

    // Draw nodes
    nodes.forEach(node => {

        const position = positions[node];

        const group = document.createElementNS(svgNS, "g");
        const circle = document.createElementNS(svgNS, "circle");

        let fill = "#e2e8f0";
        let stroke = "#64748b";

        if (visited.includes(node)) {
            fill = "#bbf7d0";
            stroke = "#16a34a";
        }

        if (queue.includes(node)) {
            fill = "#bfdbfe";
            stroke = "#2563eb";
        }

        if (neighbors.includes(node)) {
            fill = "#fef08a";
            stroke = "#ca8a04";
        }

        if (node === data.current_node) {
            fill = "#fed7aa";
            stroke = "#ea5800";
        }

        if (node === data.target_node) {
            stroke = "#7c3aed";
        }

        if (shortestPath.includes(node)) {
            fill = "#ddd6fe";
            stroke = "#7c3aed";
        }

        circle.setAttribute("cx", position.x);
        circle.setAttribute("cy", position.y);
        circle.setAttribute("r", "25");
        circle.setAttribute("fill", fill);
        circle.setAttribute("stroke", stroke);
        circle.setAttribute("stroke-width", "4");

        const label = document.createElementNS(svgNS, "text");

        label.setAttribute("x", position.x);
        label.setAttribute("y", position.y + 6);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("font-size", "18");
        label.setAttribute("font-weight", "bold");
        label.setAttribute("fill", "#1e293b");
        label.textContent = node;

        group.appendChild(circle);
        group.appendChild(label);

        svg.appendChild(group);

    });

    graphContainer.appendChild(svg);

    // Queue panel
    const queuePanel = document.createElement("div");
    queuePanel.className = "graph-queue-panel";

    const queueTitle = document.createElement("h4");
    queueTitle.textContent = "Queue (FIFO)";

    queuePanel.appendChild(queueTitle);

    const queueItems = document.createElement("div");
    queueItems.className = "graph-queue-items";

    if (queue.length > 0) {

        queue.forEach(node => {

            const item = document.createElement("span");

            item.className = "graph-queue-item";
            item.textContent = node;

            queueItems.appendChild(item);

        });

    } else {

        queueItems.textContent = "Queue is empty";

    }

    queuePanel.appendChild(queueItems);
    graphContainer.appendChild(queuePanel);

    // Legend
    const legend = document.createElement("div");
    legend.className = "graph-legend";

    const legendItems = [
        ["#e2e8f0", "Unvisited"],
        ["#bbf7d0", "Visited"],
        ["#bfdbfe", "In Queue"],
        ["#fef08a", "Neighbor"],
        ["#fed7aa", "Current"],
        ["#ddd6fe", "Shortest Path"]
    ];

    legendItems.forEach(([color, label]) => {

        const item = document.createElement("span");
        item.className = "graph-legend-item";

        const colorBox = document.createElement("span");
        colorBox.className = "graph-legend-color";
        colorBox.style.backgroundColor = color;

        item.appendChild(colorBox);
        item.appendChild(document.createTextNode(label));

        legend.appendChild(item);

    });

    graphContainer.appendChild(legend);

    if (data.completed) {

        visualStatus.textContent =
            `Mission completed! Shortest path: ${(data.shortest_path || []).join(" → ")}`;

    } else if (data.found) {

        visualStatus.textContent =
            `Destination ${data.target_node || ""} found!`;

    } else if (data.current_node) {

        visualStatus.textContent =
            `Currently exploring node ${data.current_node}.`;

    } else {

        visualStatus.textContent =
            "Follow the graph to understand the BFS traversal.";

    }

    if (data.queue_rule) {
        pointerInfo.textContent = `Queue Rule: ${data.queue_rule}`;
    }

    if (data.path_length !== undefined) {
        pointerInfo.textContent +=
            `     |     Path Length: ${data.path_length}`;
    }

}
// =====================================
// DIJKSTRA WEIGHTED GRAPH VISUALIZATION
// =====================================

function renderWeightedGraph(data) {

    arrayContainer.hidden = true;
    graphContainer.hidden = false;
    visualTargetBox.hidden = true;

    graphContainer.innerHTML = "";
    pointerInfo.textContent = "";

    // Get edges from first Dijkstra step
    const firstGraphStep = missionSteps.find(step =>
        step.visual_data &&
        step.visual_data.type === "weighted_graph" &&
        Array.isArray(step.visual_data.edges)
    );

    const graphData = firstGraphStep
        ? firstGraphStep.visual_data
        : data;

    const nodes = data.nodes || graphData.nodes || [];
    const edges = data.edges || graphData.edges || [];

    if (nodes.length === 0) {

        visualStatus.textContent = "No graph nodes found.";
        return;

    }

    const width = 650;
    const height = 390;
    const svgNS = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(svgNS, "svg");

    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Dijkstra weighted graph");

    svg.style.maxWidth = "650px";
    svg.style.display = "block";
    svg.style.margin = "auto";

    // Node positions
    const positions = {
        A: { x: 325, y: 65 },
        B: { x: 150, y: 175 },
        C: { x: 500, y: 175 },
        D: { x: 150, y: 310 },
        E: { x: 500, y: 310 }
    };

    nodes.forEach((node, index) => {

        if (!positions[node]) {

            const angle =
                (2 * Math.PI * index / nodes.length) - Math.PI / 2;

            positions[node] = {
                x: 325 + 120 * Math.cos(angle),
                y: 195 + 120 * Math.sin(angle)
            };

        }

    });

    const visited = data.visited || [];
    const updated = data.updated_neighbors || [];
    const path = data.shortest_path || [];

    const pathEdges = new Set();

    for (let i = 0; i < path.length - 1; i++) {

        pathEdges.add(`${path[i]}-${path[i + 1]}`);
        pathEdges.add(`${path[i + 1]}-${path[i]}`);

    }

    // Draw weighted edges
    edges.forEach(edge => {

        const from = edge.from;
        const to = edge.to;

        if (!positions[from] || !positions[to]) return;

        const isPath = pathEdges.has(`${from}-${to}`);

        const line = document.createElementNS(svgNS, "line");

        line.setAttribute("x1", positions[from].x);
        line.setAttribute("y1", positions[from].y);
        line.setAttribute("x2", positions[to].x);
        line.setAttribute("y2", positions[to].y);
        line.setAttribute("stroke", isPath ? "#7c3aed" : "#94a3b8");
        line.setAttribute("stroke-width", isPath ? "6" : "3");

        svg.appendChild(line);

        // Edge weight
        const weightLabel =
            document.createElementNS(svgNS, "text");

        weightLabel.setAttribute(
            "x", (positions[from].x + positions[to].x) / 2
        );

        weightLabel.setAttribute(
            "y", (positions[from].y + positions[to].y) / 2 - 8
        );

        weightLabel.setAttribute("text-anchor", "middle");
        weightLabel.setAttribute("font-size", "15");
        weightLabel.setAttribute("font-weight", "bold");
        weightLabel.setAttribute("fill", "#ea580c");

        weightLabel.textContent = edge.weight;

        svg.appendChild(weightLabel);

    });

    // Draw nodes
    nodes.forEach(node => {

        const position = positions[node];

        let fill = "#e2e8f0";
        let stroke = "#64748b";

        if (visited.includes(node)) {
            fill = "#bbf7d0";
            stroke = "#16a34a";
        }

        if (updated.includes(node)) {
            fill = "#fef08a";
            stroke = "#ca8a04";
        }

        if (node === data.selected_node) {
            fill = "#bfdbfe";
            stroke = "#2563eb";
        }

        if (node === data.current_node) {
            fill = "#fed7aa";
            stroke = "#ea5800";
        }

        if (path.includes(node)) {
            fill = "#ddd6fe";
            stroke = "#7c3aed";
        }

        const circle = document.createElementNS(svgNS, "circle");

        circle.setAttribute("cx", position.x);
        circle.setAttribute("cy", position.y);
        circle.setAttribute("r", "27");
        circle.setAttribute("fill", fill);
        circle.setAttribute("stroke", stroke);
        circle.setAttribute("stroke-width", "4");

        svg.appendChild(circle);

        const label = document.createElementNS(svgNS, "text");

        label.setAttribute("x", position.x);
        label.setAttribute("y", position.y + 5);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("font-size", "18");
        label.setAttribute("font-weight", "bold");
        label.setAttribute("fill", "#1e293b");

        label.textContent = node;

        svg.appendChild(label);

        // Distance label
        const distanceLabel =
            document.createElementNS(svgNS, "text");

        distanceLabel.setAttribute("x", position.x);
        distanceLabel.setAttribute("y", position.y + 48);
        distanceLabel.setAttribute("text-anchor", "middle");
        distanceLabel.setAttribute("font-size", "13");
        distanceLabel.setAttribute("font-weight", "bold");
        distanceLabel.setAttribute("fill", "#334155");

        const distance = data.distances
            ? data.distances[node]
            : undefined;

        distanceLabel.textContent =
            distance !== undefined
                ? `Dist: ${distance}`
                : "Dist: -";

        svg.appendChild(distanceLabel);

    });

    graphContainer.appendChild(svg);

    // Legend
    const legend = document.createElement("div");
    legend.className = "graph-legend";

    const legendItems = [
        ["#e2e8f0", "Unvisited"],
        ["#bbf7d0", "Visited"],
        ["#fef08a", "Updated Neighbor"],
        ["#bfdbfe", "Selected"],
        ["#fed7aa", "Current"],
        ["#ddd6fe", "Shortest Path"]
    ];

    legendItems.forEach(([color, name]) => {

        const item = document.createElement("span");
        item.className = "graph-legend-item";

        const colorBox = document.createElement("span");
        colorBox.className = "graph-legend-color";
        colorBox.style.backgroundColor = color;

        item.appendChild(colorBox);
        item.appendChild(document.createTextNode(name));

        legend.appendChild(item);

    });

    graphContainer.appendChild(legend);

    // Shortest path panel
    if (path.length > 0) {

        const panel = document.createElement("div");
        panel.className = "graph-queue-panel";

        const heading = document.createElement("h4");
        heading.textContent = "Shortest Path";

        const pathText = document.createElement("p");
        pathText.textContent = path.join(" → ");

        panel.appendChild(heading);
        panel.appendChild(pathText);

        if (data.total_distance !== undefined) {

            const total = document.createElement("p");

            total.textContent =
                `Total Distance: ${data.total_distance}`;

            panel.appendChild(total);

        }

        graphContainer.appendChild(panel);

    }

    // Status
    if (data.completed) {

        visualStatus.textContent =
            `Dijkstra completed! Total Distance: ${data.total_distance ?? "N/A"}`;

    } else if (data.current_node) {

        visualStatus.textContent =
            `Currently processing node ${data.current_node}.`;

    } else if (data.selected_node) {

        visualStatus.textContent =
            `Node ${data.selected_node} selected as the nearest location.`;

    } else if (path.length > 0) {

        visualStatus.textContent =
            "The shortest path has been identified.";

    } else {

        visualStatus.textContent =
            "Explore the weighted graph and node distances.";

    }

    if (data.total_distance !== undefined) {

        pointerInfo.textContent =
            `Total Distance: ${data.total_distance}`;

    }

}
// =====================================
// RENDER DECISION OPTIONS
// =====================================


function renderDecisionOptions(step) {

    if (!decisionSection || !decisionContainer || !decisionFeedback) {
        console.error("Decision HTML elements not found.");
        return;
    }

    decisionSection.hidden = false;

    decisionContainer.innerHTML = "";
    decisionFeedback.textContent = "";
    decisionFeedback.className = "decision-feedback";

    const decisions = step.decisions || [];

    const isLastStep =
        currentStepIndex === missionSteps.length - 1;

    const alreadyCompleted = completedStepIds.has(step.id);

    if (alreadyCompleted) {
        decisionFeedback.textContent =
            "You have already completed this step correctly.";

        decisionFeedback.classList.add("correct");
    }

    if (decisions.length === 0) {

        if (isLastStep) {

            decisionContainer.innerHTML = `
                <p>All learning steps have been completed.</p>

                <button type="button"
                        class="decision-option"
                        id="finishMissionButton">
                    🏆 Complete Mission
                </button>
            `;

            document.getElementById("finishMissionButton")
                .addEventListener("click", completeMission);

        } else {

            decisionContainer.textContent =
                "No decision options have been added for this step yet.";

        }

        return;
    }

    decisions.forEach((decision, index) => {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "decision-option";

        button.textContent =
            `${String.fromCharCode(65 + index)}. ${decision.option_text}`;

        button.disabled = alreadyCompleted;

        button.addEventListener("click", function () {
            submitDecision(decision.id, button);
        });

        decisionContainer.appendChild(button);

    });

}


// =====================================
// SUBMIT DECISION ANSWER
// AUTO NEXT STEP
// =====================================


async function submitDecision(decisionId, selectedButton) {

    if (answering || missionCompleted) return;

    const step = missionSteps[currentStepIndex];

    if (!step || completedStepIds.has(step.id)) return;

    const token = getToken();

    if (!token) {
        decisionFeedback.textContent =
            "Please login again to submit your answer.";
        return;
    }

    answering = true;

    const optionButtons =
        decisionContainer.querySelectorAll("button");

    optionButtons.forEach(button => {
        button.disabled = true;
    });

    selectedButton.textContent += " (Checking...)";

    try {

        const response = await fetch(
            `${API_URL}decisions/${decisionId}/answer/`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (response.status === 401 || response.status === 403) {
            throw new Error(
                "Your login session has expired. Please login again."
            );
        }

        if (!response.ok) {
            throw new Error("Unable to submit your answer.");
        }

        const result = await response.json();

        if (result.is_correct) {

            completedStepIds.add(step.id);

            decisionFeedback.textContent =
                `Correct! ${result.feedback || "Well done!"}`;

            decisionFeedback.className =
                "decision-feedback correct";

            optionButtons.forEach(button => {
                button.disabled = true;
            });

            if (currentStepIndex === missionSteps.length - 1) {

                decisionContainer.innerHTML = `
                    <p>All learning steps have been completed!</p>

                    <button type="button"
                            class="decision-option"
                            id="finishMissionButton">
                        🏆 Complete Mission
                    </button>
                `;

                document.getElementById("finishMissionButton")
                    .addEventListener("click", completeMission);

            } else {

                nextStepButton.disabled = false;

                setTimeout(() => {

                    if (missionCompleted) return;

                    currentStepIndex++;

                    renderCurrentStep();

                }, 1200);

            }

        } else {

            decisionFeedback.textContent =
                `Incorrect! ${result.feedback || "Try again."}`;

            decisionFeedback.className =
                "decision-feedback incorrect";

            optionButtons.forEach(button => {
                button.disabled = false;
            });

            selectedButton.textContent =
                selectedButton.textContent.replace(
                    " (Checking...)", ""
                );
        }

    } catch (error) {

        console.error("Decision submission error:", error);

        decisionFeedback.textContent = error.message;

        decisionFeedback.className =
            "decision-feedback incorrect";

        optionButtons.forEach(button => {
            button.disabled = false;
        });

        selectedButton.textContent =
            selectedButton.textContent.replace(
                " (Checking...)", ""
            );

    } finally {

        answering = false;

    }

}


// =====================================
// COMPLETE MISSION
// =====================================


async function completeMission() {

    console.log("completeMission function called!");

    if (missionCompletionRequested || missionCompleted) return;

    const token = getToken();

    if (!token) {
        decisionFeedback.textContent =
            "Please login again to complete the mission.";
        return;
    }

    missionCompletionRequested = true;

    decisionContainer.innerHTML = `
        <p>Saving your mission progress...</p>
    `;

    try {

        const response = await fetch(
            `${API_URL}${missionId}/complete/`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const result = await response.json();

        console.log("Completion API Status:", response.status);
        console.log("Completion API Response:", result);

        if (!response.ok) {
            throw new Error(
                result.error ||
                result.detail ||
                "Unable to save mission completion."
            );
        }

        missionCompleted = true;

        previousStepButton.disabled = true;
        nextStepButton.disabled = true;

        visualStatus.textContent =
            "Mission completed successfully!";

        decisionSection.innerHTML = `
            <div class="mission-complete-card">

                <div class="completion-icon">🏆</div>

                <h2>Congratulations!</h2>

                <h3>Mission Completed Successfully!</h3>

                <p>
                    You have successfully completed all the mission steps.
                    Great job, Algorithm Explorer!
                </p>

                <div class="completion-details">
                    <span>✓ All steps completed</span>
                    <span>✓ Your progress has been saved</span>
                </div>

                <button type="button" id="backToDashboardButton">
                    Back
                </button>

            </div>
        `;

        document.getElementById("backToDashboardButton")
            .addEventListener("click", function () {
                window.location.href = "/accounts/learner-dashboard/";
            });
    } catch (error) {

        console.error("Mission completion error:", error);

        missionCompletionRequested = false;

        decisionContainer.innerHTML = `
            <p>Your mission steps are complete, but saving failed.</p>

            <button type="button"
                    class="decision-option"
                    id="retryCompletionButton">
                Try Again
            </button>
        `;

        document.getElementById("retryCompletionButton")
            .addEventListener("click", completeMission);

    }

}


// =====================================
// PREVIOUS STEP BUTTON
// =====================================

previousStepButton.addEventListener("click", function () {

    if (currentStepIndex > 0 && !missionCompleted && !answering) {

        currentStepIndex--;

        renderCurrentStep();

    }

});

// =====================================
// NEXT STEP BUTTON
// =====================================

nextStepButton.addEventListener("click", function () {

    const currentStep = missionSteps[currentStepIndex];

    if (!currentStep || missionCompleted || answering) return;

    if (!completedStepIds.has(currentStep.id)) {
        return;
    }

    if (currentStepIndex < missionSteps.length - 1) {

        currentStepIndex++;

        renderCurrentStep();

    }

});

// =====================================
// ERROR HANDLING
// =====================================

function showError(message) {

    missionTitle.textContent = "Mission Unavailable";
    missionLabel.textContent = "ERROR";
    missionDescription.textContent = message;

    if (visualizationSection) {
        visualizationSection.hidden = true;
    }

    if (quizSection) {
        quizSection.hidden = true;
    }

    if (decisionSection) {
        decisionSection.hidden = true;
    }

}

// =====================================
// START
// =====================================

loadMission();