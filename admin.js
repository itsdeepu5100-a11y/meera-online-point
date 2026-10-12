import {
  auth,
  db,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "./firebase.js";

// Only this Firebase account can use this dashboard.
const ADMIN_UID = "CgDaRsZS7RY2MJkJyiUONAO1H0x2";

const $ = (id) => document.getElementById(id);

const loginSection = $("loginSection");
const dashboard = $("dashboard");
const loginForm = $("loginForm");
const loginBtn = $("loginBtn");
const loginMessage = $("loginMessage");
const logoutBtn = $("logoutBtn");
const orderForm = $("addOrderForm");
const orderMessage = $("orderMessage");
const tableMessage = $("tableMessage");
const orderTable = $("orderTable");
const searchInput = $("searchInput");

let orders = [];
let loadingOrders = false;

function message(element, text, type = "") {
  element.textContent = text;
  element.className = "message " + type;
}

function showDashboard(visible) {
  loginSection.hidden = visible;
  dashboard.hidden = !visible;
  logoutBtn.hidden = !visible;
}

function readableError(error) {
  const code = error?.code || "";
  const messages = {
    "auth/invalid-credential": "Email ya password galat hai.",
    "auth/invalid-email": "Email address sahi nahi hai.",
    "auth/too-many-requests": "Bahut attempts hue. Thodi der baad try karo.",
    "auth/network-request-failed": "Internet connection check karo.",
    "permission-denied": "Firestore permission nahi hai. Rules check karne honge.",
    "unavailable": "Firebase abhi available nahi hai. Dobara try karo."
  };

  return messages[code] || error?.message || "Kuch error hua. Dobara try karo.";
}

function safeDate(value) {
  if (!value) return "-";

  let date;
  if (typeof value.toDate === "function") {
    date = value.toDate();
  } else if (typeof value.seconds === "number") {
    date = new Date(value.seconds * 1000);
  } else {
    date = new Date(value);
  }

  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString("en-IN");
}

function updateDashboard() {
  $("totalOrders").textContent = orders.length;
  $("pendingOrders").textContent =
    orders.filter(o => o.status === "Pending" || o.status === "New").length;
  $("processingOrders").textContent =
    orders.filter(o => o.status === "Processing").length;
  $("completedOrders").textContent =
    orders.filter(o => o.status === "Completed").length;
}

function makeCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value == null ? "" : String(value);
  return cell;
}

function renderOrders() {
  const query = searchInput.value.trim().toLowerCase();
  orderTable.replaceChildren();

  const filtered = orders.filter(order => {
    const searchable = [
      order.docId,
      order.name,
      order.phone,
      order.service,
      order.status
    ].join(" ").toLowerCase();

    return searchable.includes(query);
  });

  for (const order of filtered) {
    const tr = document.createElement("tr");

    tr.appendChild(makeCell(order.docId));
    tr.appendChild(makeCell(order.name));
    tr.appendChild(makeCell(order.phone));
    tr.appendChild(makeCell(order.service));

    const statusCell = document.createElement("td");
    const statusSelect = document.createElement("select");

    ["Pending", "Processing", "Completed"].forEach(status => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      statusSelect.appendChild(option);
    });

    statusSelect.value = [
      "Pending", "Processing", "Completed"
    ].includes(order.status) ? order.status : "Pending";

    statusSelect.addEventListener("change", async () => {
      statusSelect.disabled = true;
      try {
        await updateDoc(doc(db, "orders", order.docId), {
          status: statusSelect.value
        });
        order.status = statusSelect.value;
        message(tableMessage, "Order status update ho gaya.", "success");
        updateDashboard();
      } catch (error) {
        message(tableMessage, readableError(error), "error");
        statusSelect.value = order.status;
      } finally {
        statusSelect.disabled = false;
      }
    });

    statusCell.appendChild(statusSelect);
    tr.appendChild(statusCell);
    tr.appendChild(makeCell(safeDate(order.createdAt)));

    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete";

    deleteButton.addEventListener("click", async () => {
      if (!confirm("Kya tum is order ko delete karna chahte ho?")) return;

      deleteButton.disabled = true;
      try {
        await deleteDoc(doc(db, "orders", order.docId));
        orders = orders.filter(item => item.docId !== order.docId);
        renderOrders();
        message(tableMessage, "Order delete ho gaya.", "success");
      } catch (error) {
        message(tableMessage, readableError(error), "error");
        deleteButton.disabled = false;
      }
    });

    actionCell.appendChild(deleteButton);
    tr.appendChild(actionCell);
    orderTable.appendChild(tr);
  }

  updateDashboard();

  if (filtered.length === 0) {
    message(tableMessage, "Koi order nahi mila.");
  }
}

async function loadOrders() {
  if (loadingOrders || auth.currentUser?.uid !== ADMIN_UID) return;

  loadingOrders = true;
  message(tableMessage, "Orders load ho rahe hain...");

  try {
    const snapshot = await getDocs(collection(db, "orders"));

    orders = snapshot.docs.map(item => ({
      docId: item.id,
      ...item.data()
    }));

    renderOrders();
    if (orders.length === 0) {
      message(tableMessage, "Firestore mein abhi koi order nahi hai.");
    }
  } catch (error) {
    message(tableMessage, readableError(error), "error");
  } finally {
    loadingOrders = false;
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginBtn.disabled = true;
  message(loginMessage, "Login ho raha hai...");

  try {
    const email = $("loginEmail").value.trim();
    const password = $("loginPassword").value;

    const result = await signInWithEmailAndPassword(auth, email, password);

    if (result.user.uid !== ADMIN_UID) {
      await signOut(auth);
      message(loginMessage, "Is account ko admin access nahi hai.", "error");
      return;
    }

    message(loginMessage, "Login successful.", "success");
  } catch (error) {
    message(loginMessage, readableError(error), "error");
  } finally {
    loginBtn.disabled = false;
  }
});

logoutBtn.addEventListener("click", async () => {
  logoutBtn.disabled = true;

  try {
    await signOut(auth);
    orders = [];
    orderTable.replaceChildren();
    loginForm.reset();
    message(loginMessage, "Logout successful.", "success");
  } catch (error) {
    message(tableMessage, readableError(error), "error");
  } finally {
    logoutBtn.disabled = false;
  }
});

orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (auth.currentUser?.uid !== ADMIN_UID) {
    message(orderMessage, "Pehle admin login karo.", "error");
    return;
  }

  const name = $("customerName").value.trim();
  const phone = $("customerMobile").value.trim();
  const service = $("customerService").value.trim();
  const status = $("customerStatus").value;

  if (!name || !phone || !service) {
    message(orderMessage, "Saari details bharo.", "error");
    return;
  }

  const addButton = $("addOrderBtn");
  addButton.disabled = true;
  message(orderMessage, "Order save ho raha hai...");

  try {
    await addDoc(collection(db, "orders"), {
      name,
      phone,
      service,
      status,
      createdAt: new Date()
    });

    orderForm.reset();
    message(orderMessage, "Order successfully add ho gaya.", "success");
    await loadOrders();
  } catch (error) {
    message(orderMessage, readableError(error), "error");
  } finally {
    addButton.disabled = false;
  }
});

searchInput.addEventListener("input", renderOrders);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    showDashboard(false);
    orders = [];
    orderTable.replaceChildren();
    return;
  }

  if (user.uid !== ADMIN_UID) {
    showDashboard(false);
    message(loginMessage, "Is account ko admin access nahi hai.", "error");

    try {
      await signOut(auth);
    } catch (error) {
      message(loginMessage, readableError(error), "error");
    }
    return;
  }

  showDashboard(true);
  await loadOrders();
});

console.log("Meera Online Point Admin ready");
