// ==========================
 // MEERA ONLINE POINT
 // script.js
 // ==========================

 // Hide Loader
 window.addEventListener("load", function () {
     const loader = document.querySelector(".loader");
     if (loader) loader.style.display = "none";
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
         header.style.boxShadow = window.scrollY > 50
             ? "0 8px 20px rgba(0,0,0,.25)"
             : "0 5px 15px rgba(0,0,0,.08)";
     }
 });

 // Order Form - Send directly to WhatsApp
 const orderForm = document.getElementById("orderForm");

 if (orderForm) {
     orderForm.addEventListener("submit", function (e) {
         e.preventDefault();

         const name = document.getElementById("name")?.value.trim() || "";
         const phone = document.getElementById("phone")?.value.trim() || "";
         const serviceSelect = document.getElementById("service");
         const service = serviceSelect?.value || "";
         const otherInput = document.getElementById("otherService");
         const other = otherInput?.value.trim() || "";

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

         window.location.href = whatsappURL;
     });
 }

 // Other Service Box
 const serviceSelect = document.getElementById("service");
 const otherBox = document.getElementById("otherServiceBox");

 if (serviceSelect && otherBox) {
     function updateOtherBox() {
         otherBox.style.display =
             serviceSelect.value === "Other" ? "block" : "none";
     }

     serviceSelect.addEventListener("change", updateOtherBox);
     updateOtherBox();
 }

 // Smooth Scroll
 document.querySelectorAll('a[href^="#"]').forEach(anchor => {
     anchor.addEventListener("click", function (e) {
         const href = this.getAttribute("href");
         if (!href || href === "#") return;

         const target = document.querySelector(href);
         if (target) {
             e.preventDefault();
             target.scrollIntoView({ behavior: "smooth" });
         }
     });
 });

 console.log("Welcome To Meera Online Point");
