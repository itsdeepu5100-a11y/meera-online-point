// ==============================
// Meera Online Point Admin V2.0
// Firebase Version - Part 1
// ==============================

import {
  db,
  collection,
  getDocs,
  deleteDoc,
  doc
} from "./firebase.js";

let orders = [];

const table = document.getElementById("orderTable");
const search = document.getElementById("searchInput");

async function loadOrders() {

    const querySnapshot = await getDocs(collection(db, "orders"));

    orders = [];

    querySnapshot.forEach((document) => {

        orders.push({

            docId: document.id,

            ...document.data()

        });

    });

    showOrders();

}

function updateDashboard() {

    document.getElementById("totalOrders").innerText =
        orders.length;

    document.getElementById("pendingOrders").innerText =
        orders.filter(o => o.status === "Pending").length;

    document.getElementById("processingOrders").innerText =
        orders.filter(o => o.status === "Processing").length;

    document.getElementById("completedOrders").innerText =
        orders.filter(o => o.status === "Completed").length;

}function showOrders(data = orders) {

    table.innerHTML = "";

    data.forEach((order) => {

        table.innerHTML += `

        <tr>

            <td>${order.docId}</td>

            <td>${order.name}</td>

            <td>${order.phone}</td>

            <td>${order.service}</td>

            <td>${order.status}</td>

            <td>${
                order.createdAt
                ? new Date(order.createdAt.seconds * 1000).toLocaleString()
                : "-"
            }</td>

            <td>

                <button onclick="deleteOrder('${order.docId}')">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

    updateDashboard();

}

window.deleteOrder = async function(id){

    if(confirm("Delete this Order?")){

        await deleteDoc(doc(db,"orders",id));

        loadOrders();

    }

}

search.addEventListener("keyup", function(){

    let value = this.value.toLowerCase();

    let filtered = orders.filter(order =>

        order.name.toLowerCase().includes(value) ||

        order.phone.includes(value) ||

        order.service.toLowerCase().includes(value)

    );

    showOrders(filtered);

});// ==============================
// Part 3 (Final)
// ==============================

// Initial Load
loadOrders();

// Auto Refresh every 10 seconds
setInterval(() => {
    loadOrders();
}, 10000);

console.log("✅ Meera Online Point Admin V2.0 Ready");