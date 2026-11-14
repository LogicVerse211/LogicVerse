
// =====================================
// LOGICVERSE - BINARY SEARCH MISSION
// =====================================

const numbers = [12, 25, 38, 47, 59, 64, 78];

const target = 47;

let low = 0;
let high = numbers.length - 1;
let attempts = 0;
let finished = false;

const arrayItems = document.querySelectorAll(".array-item");

const visualStatus = document.getElementById("visualStatus");

const attemptCount = document.getElementById("attemptCount");

const resetButton = document.getElementById("resetButton");


// UPDATE VISUALIZATION

function updateArray() {

    arrayItems.forEach((item, index) => {

        item.classList.remove("active", "eliminated", "found");

        item.disabled = finished;

        if (index < low || index > high) {
            item.classList.add("eliminated");
        }

    });

}


// HANDLE USER DECISION

arrayItems.forEach((item, index) => {

    item.addEventListener("click", function() {

        if (finished) return;

        const middle = Math.floor((low + high) / 2);

        if (index !== middle) {

            visualStatus.textContent =
                "Not quite! Binary Search requires you to check the middle element first. Try again.";

            return;

        }

        attempts++;

        attemptCount.textContent = attempts;

        const middleValue = numbers[middle];

        item.classList.add("active");


        if (middleValue === target) {

            item.classList.remove("active");

            item.classList.add("found");

            visualStatus.textContent =
                "Congratulations! You found the treasure! The target was 47.";

            finished = true;

            arrayItems.forEach(element => {
                element.disabled = true;
            });

        }

        else if (target > middleValue) {

            visualStatus.textContent =
                middleValue + " is smaller than 47. Search the right half.";

            low = middle + 1;

            updateArray();

        }

        else {

            visualStatus.textContent =
                middleValue + " is greater than 47. Search the left half.";

            high = middle - 1;

            updateArray();

        }

    });

});


// RESET MISSION

resetButton.addEventListener("click", function() {

    low = 0;
    high = numbers.length - 1;
    attempts = 0;
    finished = false;

    attemptCount.textContent = 0;

    visualStatus.textContent =
        "Click the middle element to begin.";

    arrayItems.forEach(item => {

        item.classList.remove("active", "eliminated", "found");

        item.disabled = false;

    });

});


// =====================================
// QUIZ FUNCTIONALITY
// =====================================

const submitQuiz = document.getElementById("submitQuiz");

const quizResult = document.getElementById("quizResult");

submitQuiz.addEventListener("click", function() {

    const selectedAnswer = document.querySelector(
        'input[name="answer"]:checked'
    );

    if (!selectedAnswer) {

        quizResult.textContent = "Please select an answer first.";

        quizResult.style.color = "#d97706";

        return;

    }

    if (selectedAnswer.value === "b") {

        quizResult.textContent =
            "Correct! When the target is smaller, Binary Search checks the left half.";

        quizResult.style.color = "#15803d";

    }

    else {

        quizResult.textContent =
            "Incorrect! Try again. Think about the target's position.";

        quizResult.style.color = "#dc2626";

    }

});
