
const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");
const registerButton = document.getElementById("registerButton");

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    message.textContent = "";
    registerButton.disabled = true;
    registerButton.textContent = "Creating Account...";

    try {
        const response = await fetch("/accounts/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                role: role
            })
        });

        const data = await response.json();

        if (!response.ok) {
            const errors = Object.entries(data)
                .map(([field, details]) => {
                    const errorText = Array.isArray(details)
                        ? details.join(", ")
                        : typeof details === "string"
                            ? details
                            : JSON.stringify(details);

                    return `${field}: ${errorText}`;
                })
                .join(" | ");

            throw new Error(errors || "Registration failed.");
        }

        message.style.color = "#16a34a";
        message.textContent =
            "Account created successfully! Redirecting to login...";

        registerForm.reset();

        setTimeout(function () {
            window.location.href = "/login/";
        }, 2000);

    } catch (error) {
        message.style.color = "#dc2626";
        message.textContent = error.message;
    } finally {
        registerButton.disabled = false;
        registerButton.textContent = "Create Account";
    }
});
