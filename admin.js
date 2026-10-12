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

// Admin account
const ADMIN_UID = "CgDaRsZS7RY2MJkJyiUONAO1H0x2";

// Google Apps Script Web App
const SHEET_API_URL =
  "https://script.google.com/macros/s/AKfycbxueR0s1EpSfs6gulx6VSv_WGAcQa0crIvoIkqQW0UFnLhiI6AndWkOaUTx_7IIhqlEWw/exec";

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
  if (!element) return;
  element.textContent = text;
  element.className = "message " + type;
}

function showDashboard(visible) {
  if (loginSection) loginSection.hidden = visible;
  if (dashboard) dashboard.hidden = !visible;
  if (logoutBtn) logoutBtn.hidden = !visible;
}

function readableError(error) {
  const code = error?.code || "";
  const messages = {
    "auth/invalid-credential": "Email ya password galat hai.",
    "auth/invalid-email": "Email address sahi nahi hai.",
    "auth/too-many-requests":
      "Bahut attempts hue. Thodi der baad try karo.",
    "auth/network-request-failed":
      "Internet connection check karo.",
    "permission-denied":
      "Firestore permission nahi hai. Rules check karo.",
    "unavailable":
      "Firebase abhi available nahi hai. Dobara try karo."
  };

  return messages[code] ||
    error?.message ||
    "Kuch error hua. Dobara try karo.";
}

// Call Google Apps Script with the logged-in admin's Firebase token.
async function sheetApi(action, extra = {}) {
  const user = auth.currentUser;

  if (!user || user.uid !== ADMIN_UID) {
    throw new Error("Admin login required.");
  }

  const idToken = await user.getIdToken();

  const response = await fetch(SHEET_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      action,
      idToken,
      ...extra
    })
  });

  if (!response.ok) {
    throw new Error(
      "Google Sheets API request failed. HTTP " +
      response.status
    );
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(
      result.error || "Google Sheets API error."
    );
  }

  return result;
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

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("en-IN");
}

function updateDashboard() {
  $("totalOrders").textContent = orders.length;

  $("pendingOrders").textContent = orders.filter(
    order =>
      order.status === "Pending" ||
      order.status === "New"
  ).length;

  $("processingOrders").textContent = orders.filter(
    order => order.status === "Processing"
  ).length;

  $("completedOrders").textContent = orders.filter(
    order => order.status === "Completed"
  ).length;
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
      order.orderId,
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

    // Order ID
    tr.appendChild(
      makeCell(order.orderId || order.docId)
    );

    // Customer details
    tr.appendChild(makeCell(order.name));
    tr.appendChild(makeCell(order.phone));
    tr.appendChild(makeCell(order.service));

    // Status dropdown
    const statusCell = document.createElement("td");
    const statusSelect = document.createElement("select");

    ["New", "Pending", "Processing", "Completed", "Cancelled"]
      .forEach(status => {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status;
        statusSelect.appendChild(option);
      });

    const allowedStatuses = [
      "New",
      "Pending",
      "Processing",
      "Completed",
      "Cancelled"
    ];

    statusSelect.value = allowedStatuses.includes(order.status)
      ? order.status
      : "New";

    statusSelect.addEventListener("change", async () => {
      const previousStatus = order.status;
      const newStatus = statusSelect.value;

      statusSelect.disabled = true;

      try {
        if (order.source === "sheet") {
          await sheetApi("updateStatus", {
            orderId: order.orderId,
            status: newStatus
          });
        } else {
          await updateDoc(
            doc(db, "orders", order.docId),
            { status: newStatus }
          );
        }

        order.status = newStatus;

        message(
          tableMessage,
          "Order status update ho gaya.",
          "success"
        );

        updateDashboard();
      } catch (error) {
        statusSelect.value = previousStatus;

        message(
          tableMessage,
          readableError(error),
          "error"
        );
      } finally {
        statusSelect.disabled = false;
      }
    });

    statusCell.appendChild(statusSelect);
    tr.appendChild(statusCell);

    // Date and time
    tr.appendChild(
      makeCell(safeDate(order.createdAt || order.dateTime))
    );

    // Delete only Firestore orders.
    const actionCell = document.createElement("td");

    if (order.source !== "sheet") {
      const deleteButton = document.createElement("button");

      deleteButton.textContent = "Delete";
      deleteButton.className = "delete";

      deleteButton.addEventListener("click", async () => {
        if (
          !confirm("Kya tum is order ko delete karna chahte ho?")
        ) {
          return;
        }

        deleteButton.disabled = true;

        try {
          await deleteDoc(
            doc(db, "orders", order.docId)
          );

          orders = orders.filter(
            item => item.docId !== order.docId
          );

          renderOrders();

          message(
            tableMessage,
            "Order delete ho gaya.",
            "success"
          );
        } catch (error) {
          message(
            tableMessage,
            readableError(error),
            "error"
          );

          deleteButton.disabled = false;
        }
      });

      actionCell.appendChild(deleteButton);
    } else {
      actionCell.textContent = "-";
    }

    tr.appendChild(actionCell);
    orderTable.appendChild(tr);
  }

  updateDashboard();

  if (filtered.length === 0) {
    message(tableMessage, "Koi order nahi mila.");
  }
}

async function loadOrders() {
  if (
    loadingOrders ||
    auth.currentUser?.uid !== ADMIN_UID
  ) {
    return;
  }

  loadingOrders = true;
  message(tableMessage, "Firestore aur Google Sheet se orders load ho rahe hain...");

  try {
    // Load Firestore orders.
    const snapshot = await getDocs(
      collection(db, "orders")
    );

    const firestoreOrders = snapshot.docs.map(item => ({
      ...item.data(),
      docId: item.id,
      source: "firestore"
    }));

    // Load Google Sheets orders.
    const result = await sheetApi("listOrders");

    const sheetOrders = (result.orders || []).map(order => ({
      ...order,
      docId: "sheet:" + order.orderId,
      source: "sheet",
      createdAt: order.dateTime
    }));

    // Show both sources together.
    orders = [...sheetOrders, ...firestoreOrders];

    renderOrders();

    if (orders.length === 0) {
      message(
        tableMessage,
        "Abhi koi order nahi mila."
      );
    }
  } catch (error) {
    message(
      tableMessage,
      "Orders load nahi hue: " + readableError(error),
      "error"
    );
  } finally {
    loadingOrders = false;
  }
}

// Admin login
loginForm.addEventListener("submit", async event => {
  event.preventDefault();

  loginBtn.disabled = true;
  message(loginMessage, "Login ho raha hai...");

  try {
    const email = $("loginEmail").value.trim();
    const password = $("loginPassword").value;

    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (result.user.uid !== ADMIN_UID) {
      await signOut(auth);

      message(
        loginMessage,
        "Is account ko admin access nahi hai.",
        "error"
      );

      return;
    }

    message(
      loginMessage,
      "Login successful.",
      "success"
    );
  } catch (error) {
    message(
      loginMessage,
      readableError(error),
      "error"
    );
  } finally {
    loginBtn.disabled = false;
  }
});

// Admin logout
logoutBtn.addEventListener("click", async () => {
  logoutBtn.disabled = true;

  try {
    await signOut(auth);

    orders = [];
    orderTable.replaceChildren();

    loginForm.reset();

    message(
      loginMessage,
      "Logout successful.",
      "success"
    );
  } catch (error) {
    message(
      tableMessage,
      readableError(error),
      "error"
    );
  } finally {
    logoutBtn.disabled = false;
  }
});

// Manually add an order to Firestore.
orderForm.addEventListener("submit", async event => {
  event.preventDefault();

  if (auth.currentUser?.uid !== ADMIN_UID) {
    message(
      orderMessage,
      "Pehle admin login karo.",
      "error"
    );
    return;
  }

  const name = $("customerName").value.trim();
  const phone = $("customerMobile").value.trim();
  const service = $("customerService").value.trim();
  const status = $("customerStatus").value;

  if (!name || !phone || !service) {
    message(
      orderMessage,
      "Saari details bharo.",
      "error"
    );
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

    message(
      orderMessage,
      "Order successfully add ho gaya.",
      "success"
    );

    await loadOrders();
  } catch (error) {
    message(
      orderMessage,
      readableError(error),
      "error"
    );
  } finally {
    addButton.disabled = false;
  }
});

// Search
searchInput.addEventListener("input", renderOrders);

// Check login state
onAuthStateChanged(auth, async user => {
  if (!user) {
    showDashboard(false);
    orders = [];
    orderTable.replaceChildren();
    return;
  }

  if (user.uid !== ADMIN_UID) {
    showDashboard(false);

    message(
      loginMessage,
      "Is account ko admin access nahi hai.",
      "error"
    );

    try {
      await signOut(auth);
    } catch (error) {
      message(
        loginMessage,
        readableError(error),
        "error"
      );
    }

    return;
  }

  showDashboard(true);
  await loadOrders();
});

console.log("Meera Online Point Admin ready");
