// ==========================
// MEERA ONLINE POINT
// script.js
// ==========================
import { db, collection, addDoc } from "./firebase.js";

// Hide Loader
window.addEventListener("load", function () {
    const loader = document.querySelector(".loader");
    if (loader) {
        loader.style.display = "none";
    }
});

// Current Year in Footer
const copyright = document.querySelector(".copyright");

if (copyright) {
    copyright.innerHTML = `© ${new Date().getFullYear()} Meera Online Point. All Rights Reserved.`;
}

// Header Shadow on Scroll
window.addEventListener("scroll", function () {

    const header = document.querySelector("header");

    if (header) {

        if (window.scrollY > 50) {
            header.style.boxShadow = "0 8px 20px rgba(0,0,0,.25)";
        } else {
            header.style.boxShadow = "0 5px 15px rgba(0,0,0,.08)";
        }

    }

});
const orderForm = document.getElementById("orderForm");

if (orderForm) {
  orderForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = document.getElementById("service").value;
    const otherInput = document.getElementById("otherService");
    const other = otherInput ? otherInput.value.trim() : "";

    if (!name || !phone || !service) {
      alert("Please fill all required fields.");
      return;
    }

    const message =
      `Hello Meera Online Point\n\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Service: ${service}\n` +
      (service === "Other" ? `Work Details: ${other}\n` : "");

    const whatsappURL =
      "https://wa.me/919335779880?text=" +
      encodeURIComponent(message);

    window.open(whatsappURL, "_blank");

    alert("WhatsApp is opening. Please send your order message there.");
  });
}const orderForm = document.getElementById("orderForm");

if (orderForm) {
  orderForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const service = document.getElementById("service").value;
    const otherInput = document.getElementById("otherService");
    const other = otherInput ? otherInput.value.trim() : "";

    if (!name || !phone || !service) {
      alert("Please fill all required fields.");
      return;
    }

    const message =
      `Hello Meera Online Point\n\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Service: ${service}\n` +
      (service === "Other" ? `Work Details: ${other}\n` : "");

    const whatsappURL =
      "https://wa.me/919335779880?text=" +
      encodeURIComponent(message);

    window.open(whatsappURL, "_blank");

    alert("WhatsApp is opening. Please send your order message there.");
  });
}

// Other Service Box
const service = document.getElementById("service");
const otherBox = document.getElementById("otherServiceBox");

if (service && otherBox) {

    service.addEventListener("change", function () {

        if (this.value === "Other") {
            otherBox.style.display = "block";
        } else {
            otherBox.style.display = "none";
        }

    });

}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {

            target.scrollIntoView({
                behavior: "smooth"
            });

        }

    });

});

console.log("Welcome To Meera Online Point");
