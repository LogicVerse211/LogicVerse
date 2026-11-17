
/* =========================================
   LOGICVERSE - ALGORITHM VISUALIZATION
========================================= */


/* =========================================
   1. BREADTH FIRST SEARCH (BFS)
========================================= */

const bfsGraph = {
    A: ["B", "C"],
    B: ["A", "D", "E"],
    C: ["A", "F"],
    D: ["B"],
    E: ["B", "F"],
    F: ["C", "E"]
};

const bfsPositions = {
    A: [300, 45],
    B: [150, 130],
    C: [450, 130],
    D: [75, 235],
    E: [225, 235],
    F: [525, 235]
};

let bfsQueue = [];
let bfsVisited = [];
let bfsCurrent = null;
let bfsRunning = false;
let bfsFinished = false;


function renderBFS() {

    const nodesContainer = document.getElementById("bfsNodes");

    nodesContainer.innerHTML = "";

    Object.keys(bfsPositions).forEach(node => {

        const [x, y] = bfsPositions[node];

        let fill = "#34345a";

        if (bfsVisited.includes(node)) {
            fill = "#16a34a";
        }

        if (bfsCurrent === node) {
            fill = "#7c3aed";
        }

        nodesContainer.innerHTML += `
            <circle
                cx="${x}"
                cy="${y}"
                r="23"
                fill="${fill}"
                stroke="#a78bfa"
                stroke-width="3"
            />

            <text
                x="${x}"
                y="${y + 6}"
                text-anchor="middle"
                fill="white"
                font-size="17"
                font-weight="bold"
            >${node}</text>
        `;

    });

    document.getElementById("bfsCurrent").textContent =
        bfsCurrent || "-";

    document.getElementById("bfsQueue").textContent =
        JSON.stringify(bfsQueue);

    document.getElementById("bfsVisited").textContent =
        JSON.stringify(bfsVisited);
}


function startBFS() {

    const startNode = document.getElementById("bfsStart").value;

    bfsQueue = [startNode];
    bfsVisited = [];
    bfsCurrent = null;

    bfsRunning = true;
    bfsFinished = false;

    document.getElementById("bfsMessage").textContent =
        `BFS started from node ${startNode}. Queue initialized. Click Next Step.`;

    renderBFS();
}


function nextBFS() {

    if (!bfsRunning || bfsFinished) {
        return;
    }

    if (bfsQueue.length === 0) {

        bfsFinished = true;

        document.getElementById("bfsMessage").textContent =
            "BFS completed! All reachable nodes have been visited.";

        renderBFS();
        return;
    }

    bfsCurrent = bfsQueue.shift();

    if (!bfsVisited.includes(bfsCurrent)) {

        bfsVisited.push(bfsCurrent);

        bfsGraph[bfsCurrent].forEach(neighbor => {

            if (
                !bfsVisited.includes(neighbor) &&
                !bfsQueue.includes(neighbor)
            ) {
                bfsQueue.push(neighbor);
            }

        });

    }

    document.getElementById("bfsMessage").textContent =
        `Visited node ${bfsCurrent}. Its unvisited neighbors have been added to the queue.`;

    if (bfsQueue.length === 0) {

        bfsFinished = true;

        document.getElementById("bfsMessage").textContent +=
            " BFS completed!";

    }

    renderBFS();
}


function resetBFS() {

    bfsQueue = [];
    bfsVisited = [];
    bfsCurrent = null;

    bfsRunning = false;
    bfsFinished = false;

    document.getElementById("bfsMessage").textContent =
        "Click Start BFS to begin.";

    renderBFS();
}


document.getElementById("bfsStartBtn").addEventListener("click", startBFS);
document.getElementById("bfsNextBtn").addEventListener("click", nextBFS);
document.getElementById("bfsResetBtn").addEventListener("click", resetBFS);

renderBFS();


/* =========================================
   2. BINARY SEARCH
========================================= */

const binaryData = [10, 20, 30, 40, 50, 60, 70, 80, 90];

let binaryLow = 0;
let binaryHigh = binaryData.length - 1;
let binaryMid = -1;

let binaryTarget = null;
let binaryRunning = false;
let binaryFinished = false;
let binaryFound = false;


function renderBinarySearch() {

    const container = document.getElementById("binaryArray");

    container.innerHTML = "";

    binaryData.forEach((value, index) => {

        let className = "array-item";

        if (binaryRunning && index === binaryMid) {
            className += " active";
        }

        if (binaryFound && index === binaryMid) {
            className += " visited";
        }

        if (
            binaryRunning &&
            (index < binaryLow || index > binaryHigh)
        ) {
            className += " discarded";
        }

        if (binaryFinished && !binaryFound) {
            className += " discarded";
        }

        container.innerHTML += `
            <div class="${className}">
                ${value}
            </div>
        `;

    });

    document.getElementById("binaryLow").textContent =
        binaryRunning ? binaryLow : "-";

    document.getElementById("binaryMid").textContent =
        binaryMid >= 0 ? binaryMid : "-";

    document.getElementById("binaryHigh").textContent =
        binaryRunning ? binaryHigh : "-";
}


function startBinarySearch() {

    const inputValue = document.getElementById("binaryTarget").value;

    if (inputValue.trim() === "") {

        document.getElementById("binaryMessage").textContent =
            "Please enter a target value.";

        return;
    }

    binaryTarget = Number(inputValue);

    binaryLow = 0;
    binaryHigh = binaryData.length - 1;
    binaryMid = -1;

    binaryRunning = true;
    binaryFinished = false;
    binaryFound = false;

    document.getElementById("binaryMessage").textContent =
        `Searching for ${binaryTarget}. Click Next Step to begin.`;

    renderBinarySearch();
}


function nextBinarySearch() {

    if (!binaryRunning || binaryFinished) {
        return;
    }

    if (binaryLow > binaryHigh) {

        binaryFinished = true;

        document.getElementById("binaryMessage").textContent =
            `Target ${binaryTarget} was not found in the array.`;

        renderBinarySearch();
        return;
    }

    binaryMid = Math.floor((binaryLow + binaryHigh) / 2);

    const middleValue = binaryData[binaryMid];

    if (middleValue === binaryTarget) {

        binaryFound = true;
        binaryFinished = true;

        document.getElementById("binaryMessage").textContent =
            `Success! Target ${binaryTarget} found at index ${binaryMid}.`;

    }

    else if (middleValue < binaryTarget) {

        binaryLow = binaryMid + 1;

        document.getElementById("binaryMessage").textContent =
            `${middleValue} is smaller than ${binaryTarget}. Search the right half.`;

    }

    else {

        binaryHigh = binaryMid - 1;

        document.getElementById("binaryMessage").textContent =
            `${middleValue} is greater than ${binaryTarget}. Search the left half.`;

    }

    renderBinarySearch();
}


function resetBinarySearch() {

    binaryLow = 0;
    binaryHigh = binaryData.length - 1;
    binaryMid = -1;

    binaryTarget = null;

    binaryRunning = false;
    binaryFinished = false;
    binaryFound = false;

    document.getElementById("binaryMessage").textContent =
        "Enter a target and click Start Search.";

    renderBinarySearch();
}


document.getElementById("binaryStartBtn")
    .addEventListener("click", startBinarySearch);

document.getElementById("binaryNextBtn")
    .addEventListener("click", nextBinarySearch);

document.getElementById("binaryResetBtn")
    .addEventListener("click", resetBinarySearch);

renderBinarySearch();


/* =========================================
   3. DIJKSTRA'S SHORTEST PATH
========================================= */

const dijkstraGraph = {
    A: { B: 4, C: 2 },
    B: { A: 4, C: 1, D: 5 },
    C: { A: 2, B: 1, D: 8, E: 10 },
    D: { B: 5, C: 8, E: 2, F: 6 },
    E: { C: 10, D: 2, F: 3 },
    F: { D: 6, E: 3 }
};

const dijkstraPositions = {
    A: [80, 150],
    B: [200, 65],
    C: [200, 235],
    D: [370, 65],
    E: [370, 235],
    F: [520, 150]
};

let dijkstraDistances = {};
let dijkstraPrevious = {};
let dijkstraVisited = [];

let dijkstraCurrent = null;
let dijkstraStartNode = "A";
let dijkstraEndNode = "F";

let dijkstraRunning = false;
let dijkstraFinished = false;
let dijkstraPath = [];


function renderDijkstra() {

    const edgesContainer = document.getElementById("dijkstraEdges");
    const nodesContainer = document.getElementById("dijkstraNodes");

    edgesContainer.innerHTML = "";
    nodesContainer.innerHTML = "";

    const drawnEdges = new Set();

    Object.keys(dijkstraGraph).forEach(node => {

        Object.keys(dijkstraGraph[node]).forEach(neighbor => {

            const edgeKey = [node, neighbor].sort().join("-");

            if (drawnEdges.has(edgeKey)) {
                return;
            }

            drawnEdges.add(edgeKey);

            const [x1, y1] = dijkstraPositions[node];
            const [x2, y2] = dijkstraPositions[neighbor];

            const isPathEdge = dijkstraPath.some((pathNode, index) => {

                if (index === dijkstraPath.length - 1) {
                    return false;
                }

                const nextNode = dijkstraPath[index + 1];

                return (
                    (pathNode === node && nextNode === neighbor) ||
                    (pathNode === neighbor && nextNode === node)
                );

            });

            const lineColor = isPathEdge ? "#22c55e" : "#666";

            const middleX = (x1 + x2) / 2;
            const middleY = (y1 + y2) / 2;

            edgesContainer.innerHTML += `
                <line
                    x1="${x1}"
                    y1="${y1}"
                    x2="${x2}"
                    y2="${y2}"
                    stroke="${lineColor}"
                    stroke-width="${isPathEdge ? 5 : 3}"
                />

                <text
                    x="${middleX}"
                    y="${middleY - 8}"
                    fill="#facc15"
                    text-anchor="middle"
                    font-size="15"
                    font-weight="bold"
                >${dijkstraGraph[node][neighbor]}</text>
            `;

        });

    });


    Object.keys(dijkstraPositions).forEach(node => {

        const [x, y] = dijkstraPositions[node];

        let fill = "#34345a";

        if (dijkstraVisited.includes(node)) {
            fill = "#16a34a";
        }

        if (dijkstraCurrent === node) {
            fill = "#7c3aed";
        }

        if (dijkstraFinished && dijkstraPath.includes(node)) {
            fill = "#16a34a";
        }

        nodesContainer.innerHTML += `
            <circle
                cx="${x}"
                cy="${y}"
                r="23"
                fill="${fill}"
                stroke="#a78bfa"
                stroke-width="3"
            />

            <text
                x="${x}"
                y="${y + 6}"
                text-anchor="middle"
                fill="white"
                font-size="17"
                font-weight="bold"
            >${node}</text>

            <text
                x="${x}"
                y="${y + 42}"
                text-anchor="middle"
                fill="#ddd"
                font-size="13"
            >${dijkstraDistances[node] === Infinity
                ? "∞"
                : dijkstraDistances[node] ?? "∞"}</text>
        `;

    });


    document.getElementById("dijkstraCurrent").textContent =
        dijkstraCurrent || "-";

    document.getElementById("dijkstraVisited").textContent =
        JSON.stringify(dijkstraVisited);

    document.getElementById("dijkstraDistance").textContent =
        dijkstraDistances[dijkstraEndNode] === Infinity ||
        dijkstraDistances[dijkstraEndNode] === undefined
            ? "∞"
            : dijkstraDistances[dijkstraEndNode];
}


function startDijkstra() {

    dijkstraStartNode =
        document.getElementById("dijkstraStart").value;

    dijkstraEndNode =
        document.getElementById("dijkstraEnd").value;

    if (dijkstraStartNode === dijkstraEndNode) {

        document.getElementById("dijkstraMessage").textContent =
            "Start and destination must be different.";

        return;
    }

    dijkstraDistances = {};
    dijkstraPrevious = {};
    dijkstraVisited = [];

    dijkstraCurrent = null;
    dijkstraPath = [];

    Object.keys(dijkstraGraph).forEach(node => {

        dijkstraDistances[node] = Infinity;
        dijkstraPrevious[node] = null;

    });

    dijkstraDistances[dijkstraStartNode] = 0;

    dijkstraRunning = true;
    dijkstraFinished = false;

    document.getElementById("dijkstraMessage").textContent =
        `Finding the shortest path from ${dijkstraStartNode} to ${dijkstraEndNode}. Click Next Step.`;

    renderDijkstra();
}


function finishDijkstra() {

    dijkstraFinished = true;
    dijkstraRunning = false;

    if (dijkstraDistances[dijkstraEndNode] === Infinity) {

        dijkstraPath = [];

        document.getElementById("dijkstraMessage").textContent =
            `No path found from ${dijkstraStartNode} to ${dijkstraEndNode}.`;

        renderDijkstra();
        return;
    }

    let current = dijkstraEndNode;
    dijkstraPath = [];

    while (current !== null) {

        dijkstraPath.unshift(current);
        current = dijkstraPrevious[current];

    }

    document.getElementById("dijkstraMessage").textContent =
        `Shortest path: ${dijkstraPath.join(" → ")} | Total distance: ${dijkstraDistances[dijkstraEndNode]}`;

    renderDijkstra();
}


function nextDijkstra() {

    if (!dijkstraRunning || dijkstraFinished) {
        return;
    }

    let smallestDistance = Infinity;
    let nextNode = null;

    Object.keys(dijkstraDistances).forEach(node => {

        if (
            !dijkstraVisited.includes(node) &&
            dijkstraDistances[node] < smallestDistance
        ) {

            smallestDistance = dijkstraDistances[node];
            nextNode = node;

        }

    });


    if (nextNode === null) {

        finishDijkstra();
        return;
    }

    dijkstraCurrent = nextNode;
    dijkstraVisited.push(nextNode);


    if (nextNode === dijkstraEndNode) {

        finishDijkstra();
        return;
    }


    Object.keys(dijkstraGraph[nextNode]).forEach(neighbor => {

        if (dijkstraVisited.includes(neighbor)) {
            return;
        }

        const newDistance =
            dijkstraDistances[nextNode] +
            dijkstraGraph[nextNode][neighbor];

        if (newDistance < dijkstraDistances[neighbor]) {

            dijkstraDistances[neighbor] = newDistance;
            dijkstraPrevious[neighbor] = nextNode;

        }

    });


    document.getElementById("dijkstraMessage").textContent =
        `Visited node ${nextNode}. Updated the distances of its neighboring nodes.`;

    renderDijkstra();
}


function resetDijkstra() {

    dijkstraDistances = {};
    dijkstraPrevious = {};
    dijkstraVisited = [];

    dijkstraCurrent = null;
    dijkstraPath = [];

    dijkstraRunning = false;
    dijkstraFinished = false;

    Object.keys(dijkstraGraph).forEach(node => {

        dijkstraDistances[node] = Infinity;
        dijkstraPrevious[node] = null;

    });

    document.getElementById("dijkstraMessage").textContent =
        "Click Start Dijkstra to begin.";

    renderDijkstra();
}


document.getElementById("dijkstraStartBtn")
    .addEventListener("click", startDijkstra);

document.getElementById("dijkstraNextBtn")
    .addEventListener("click", nextDijkstra);

document.getElementById("dijkstraResetBtn")
    .addEventListener("click", resetDijkstra);

resetDijkstra();
