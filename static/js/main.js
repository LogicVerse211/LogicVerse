console.log("LogicVerse JavaScript Connected!");

alert("Welcome to LogicVerse!");

/* =================================
   LOGICVERSE - MAIN JAVASCRIPT
================================= */

// Mobile Navigation
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", function () {
        navLinks.classList.toggle("show");
    });

}

// Close menu after clicking a link
const navItems = document.querySelectorAll(".nav-links a");

navItems.forEach(function (link) {

    link.addEventListener("click", function () {
        navLinks?.classList.remove("show");
    });

});

console.log("LogicVerse JavaScript Loaded Successfully!");
