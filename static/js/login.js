
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");
const loginButton = document.getElementById("loginButton");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    message.textContent = "";
    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    try {
        // Step 1: Login API
        const response = await fetch("/accounts/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Invalid username or password."
            );
        }

        // Step 2: Save JWT Tokens
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        // Step 3: Get User Profile
        const profileResponse = await fetch("/accounts/profile/", {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + data.access,
                "Content-Type": "application/json"
            }
        });

        const profileData = await profileResponse.json();

        console.log("Profile API Response:", profileData);

        if (!profileResponse.ok) {
            throw new Error(
                profileData.detail || "Unable to verify user role."
            );
        }

        // Step 4: Detect Role
        const role = String(profileData.role || "")
            .trim()
            .toLowerCase();

        console.log("Detected Role:", role);

        // Step 5: Redirect According to Role
        if (role === "admin") {
            message.textContent = "Admin login successful!";
            message.style.color = "#4ade80";

            window.location.href = "/accounts/admin-dashboard/";
        }
        else if (role === "teacher") {
            message.textContent = "Teacher login successful!";
            message.style.color = "#4ade80";

            window.location.href = "/teacher-dashboard/";
        }
        else if (role === "learner") {
            message.textContent = "Learner login successful!";
            message.style.color = "#4ade80";

            window.location.href = "/accounts/learner-dashboard/";
        }
        else {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");

            throw new Error(
                "Invalid role received from server: " +
                (profileData.role || "No role found")
            );
        }

    } catch (error) {
        console.error("Login Error:", error);

        message.style.color = "#f87171";
        message.textContent = error.message;

    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Login";
    }
});
