
document.addEventListener("DOMContentLoaded", function () {
    loadLearnerDashboard();
});

async function loadLearnerDashboard() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        window.location.href = "/login/";
        return;
    }

    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };

    try {
        // 1. Load User Profile
        const profileResponse = await fetch("/accounts/profile/", {
            method: "GET",
            headers: headers
        });

        const profileData = await profileResponse.json();

        if (!profileResponse.ok) {
            throw new Error("Unable to load user profile.");
        }

        const username =
            profileData.username ||
            profileData.first_name ||
            profileData.email ||
            "Learner";

        document.getElementById("learnerName").textContent =
            `Welcome, ${username}!`;

        // 2. Load Dashboard Data
        const response = await fetch("/accounts/learner/dashboard/", {
            method: "GET",
            headers: headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Unable to load dashboard.");
        }

        // Mission Summary
        document.getElementById("totalStarted").textContent =
            data.mission_summary.total_started;

        document.getElementById("totalCompleted").textContent =
            data.mission_summary.total_completed;

        // Quiz Summary
        document.getElementById("totalAttempts").textContent =
            data.quiz_summary.total_attempts;

        // 3. Quiz Performance
        const quizContainer =
            document.getElementById("quizPerformance");

        const quizzes =
            data.quiz_summary.quiz_performance || [];

        if (quizzes.length === 0) {
            quizContainer.textContent =
                "You have not attempted any quiz yet.";
        } else {
            quizContainer.innerHTML = "";

            quizzes.forEach(quiz => {
                const quizCard = document.createElement("div");

                quizCard.style.marginBottom = "20px";
                quizCard.style.padding = "15px";
                quizCard.style.borderBottom = "1px solid #eee";

                const title = document.createElement("h3");
                title.textContent = quiz.quiz_title;

                const attempts = document.createElement("p");
                attempts.textContent =
                    `Total Attempts: ${quiz.total_attempts}`;

                const latest = document.createElement("p");
                latest.textContent =
                    `Latest Score: ${quiz.latest_score}/${quiz.total_marks}`;

                const best = document.createElement("p");
                best.textContent =
                    `Best Score: ${quiz.best_score}/${quiz.total_marks}`;

                quizCard.append(title, attempts, latest, best);
                quizContainer.appendChild(quizCard);
            });
        }

        // 4. Load Quiz History
        await loadQuizHistory(headers);

    } catch (error) {
        console.error("Dashboard Error:", error);
        alert(error.message);
    }
}


// Load Quiz History
async function loadQuizHistory(headers) {
    const historyContainer =
        document.getElementById("quizHistory");

    try {
        const response = await fetch("/api/progress/quizzes/", {
            method: "GET",
            headers: headers
        });

        const historyData = await response.json();

        if (!response.ok) {
            throw new Error("Unable to load quiz history.");
        }

        if (!Array.isArray(historyData)) {
            throw new Error("Unexpected quiz history response.");
        }

        if (historyData.length === 0) {
            historyContainer.innerHTML = "";

            const message = document.createElement("p");
            message.className = "empty-message";
            message.textContent =
                "You have not attempted any quiz yet.";

            historyContainer.appendChild(message);
            return;
        }

        // Create Table
        const tableWrapper = document.createElement("div");
        tableWrapper.className = "history-table-wrapper";

        const table = document.createElement("table");
        table.className = "history-table";

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        ["Quiz Title", "Score", "Total Marks", "Date & Time"]
            .forEach(text => {
                const th = document.createElement("th");
                th.textContent = text;
                headerRow.appendChild(th);
            });

        thead.appendChild(headerRow);

        const tbody = document.createElement("tbody");

        historyData.forEach(attempt => {
            const row = document.createElement("tr");

            const titleCell = document.createElement("td");
            titleCell.textContent = attempt.quiz_title;

            const scoreCell = document.createElement("td");
            scoreCell.textContent = attempt.score;

            const marksCell = document.createElement("td");
            marksCell.textContent = attempt.total_marks;

            const dateCell = document.createElement("td");

            if (attempt.completed_at) {
                dateCell.textContent =
                    new Date(attempt.completed_at).toLocaleString();
            } else {
                dateCell.textContent = "N/A";
            }

            row.append(
                titleCell,
                scoreCell,
                marksCell,
                dateCell
            );

            tbody.appendChild(row);
        });

        table.append(thead, tbody);
        tableWrapper.appendChild(table);

        historyContainer.innerHTML = "";
        historyContainer.appendChild(tableWrapper);

    } catch (error) {
        console.error("Quiz History Error:", error);

        historyContainer.textContent =
            "Unable to load quiz history. Please try again.";
    }
}


// 5. Logout Function
function logout() {
    const refreshToken = localStorage.getItem("refresh_token");
    const accessToken = localStorage.getItem("access_token");

    fetch("/accounts/logout/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            refresh: refreshToken
        })
    }).finally(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        window.location.href = "/login/";
    });
}
