// ==============================
// Meera Online Point Admin V1.0
// ==============================

let orders = JSON.parse(localStorage.getItem("orders")) || [];

const form = document.getElementById("adminOrderForm");
const table = document.getElementById("orderTable");
const search = document.getElementById("searchInput");

function saveOrders() {
    localStorage.setItem("orders", JSON.stringify(orders));
}

function updateDashboard() {

    document.getElementById("totalOrders").innerText = orders.length;

    document.getElementById("pendingOrders").innerText =
        orders.filter(o => o.status === "Pending").length;

    document.getElementById("processingOrders").innerText =
        orders.filter(o => o.status === "Processing").length;

    document.getElementById("completedOrders").innerText =
        orders.filter(o => o.status === "Completed").length;

}

function showOrders(data = orders) {

    table.innerHTML = "";

    data.forEach((order, index) => {

        table.innerHTML += `
        <tr>

        <td>${order.id}</td>

        <td>${order.name}</td>

        <td>${order.mobile}</td>

        <td>${order.service}</td>

        <td>${order.status}</td>

        <td>${order.date}</td>

        <td>

        <button onclick="deleteOrder(${index})">
        Delete
        </button>

        </td>

        </tr>
        `;

    });

    updateDashboard();

}

form.addEventListener("submit", function(e){

    e.preventDefault();

    const order = {

        id: "MOP" + Date.now(),

        name: document.getElementById("customerName").value,

        mobile: document.getElementById("customerMobile").value,

        service: document.getElementById("customerService").value,

        status: document.getElementById("orderStatus").value,

        date: new Date().toLocaleDateString()

    };

    orders.push(order);

    saveOrders();

    showOrders();

    form.reset();

});

function deleteOrder(index){

    if(confirm("Delete this Order?")){

        orders.splice(index,1);

        saveOrders();

        showOrders();

    }

}

search.addEventListener("keyup", function(){

    let value = this.value.toLowerCase();

    let filtered = orders.filter(order =>

        order.name.toLowerCase().includes(value) ||

        order.mobile.includes(value) ||

        order.service.toLowerCase().includes(value)

    );

    showOrders(filtered);

});

showOrders();

console.log("Admin Panel Ready");