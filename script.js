const orderForm = document.getElementById("orderForm");

if (orderForm) {
  orderForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name")?.value.trim() || "";
    const phone = document.getElementById("phone")?.value.trim() || "";
    const service = document.getElementById("service")?.value || "";
    const other = document.getElementById("otherService")?.value.trim() || "";

    if (!name || !phone || !service) {
      alert("Please fill all required fields.");
      return;
    }

    const orderId = "MOP-" + Date.now();
    const details = service === "Other" ? other : "";
    const apiURL = "https://script.google.com/macros/s/AKfycbz58mEGOTFYhiJWDJh9QLJdRNKRL00GbtQnbBD--uenKfXhA_JeT_Tok7mDMilIOODjfQ/exec";

    const payload = {
      orderId,
      name,
      phone,
      service,
      details
    };

    const message =
      `New Order - Meera Online Point\n\n` +
      `Order ID: ${orderId}\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      `Service: ${service}\n` +
      `Details: ${details || "N/A"}`;

    const whatsappURL =
      "https://wa.me/919335779880?text=" +
      encodeURIComponent(message);

    try {
      await fetch(apiURL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      window.location.href = whatsappURL;
    } catch (error) {
      alert("Order send nahi ho saka. Internet check karke dobara try karein.");
      console.error(error);
    }
  });
}
