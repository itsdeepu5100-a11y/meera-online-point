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
// Order Form
const orderForm = document.getElementById("orderForm");

if (orderForm) {

    orderForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const name = document.getElementById("name").value;
        const phone = document.getElementById("phone").value;
        const service = document.getElementById("service").value;

        let other = "";

        const otherInput = document.getElementById("otherService");

        if (otherInput) {
            other = otherInput.value;
        }

        try {

            await addDoc(collection(db, "orders"), {

                name: name,
                phone: phone,
                service: service,
                other: other,

                status: "Pending",

                createdAt: new Date()

            });

            let message =
`Hello Meera Online Point

Name : ${name}
Phone : ${phone}
Service : ${service}

${service === "Other" ? "Work Details : " + other : ""}
`;

            window.open(
                "https://wa.me/919335779880?text=" +
                encodeURIComponent(message),
                "_blank"
            );

            alert("Order Submitted Successfully.");

            orderForm.reset();

        } catch (error) {

            console.error(error);

            alert("Firebase Error : " + error.message);

        }

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