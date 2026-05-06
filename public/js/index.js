/* eslint-disable */
import "@babel/polyfill";
import { displayMap } from "./leaflet.js";
import { login, logout } from "./login";
import { updateData } from "./updateSettings";
// DOM Elements
const leaflet = document.getElementById("map");
const loginForm = document.querySelector(".form--login");
const logoutBtn = document.querySelector(".nav__el--logout");
const userDataForm = document.querySelector(".form-user-data");

// Delegation
if (leaflet) {
  const locations = JSON.parse(
    document.getElementById("map").dataset.locations,
  );
  displayMap(locations);
}

if (loginForm)
  document.querySelector(".form").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });

if (logoutBtn) logoutBtn.addEventListener("click", logout);
if (userDataForm)
  userDataForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const name = document.getElementById("name").value;
    updateData(name, email);
  });
