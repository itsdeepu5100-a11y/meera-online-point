import { initializeApp } from "https://gstatic.com";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://gstatic.com";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://gstatic.com";

// आपकी कन्फिगरेशन डिटेल्स यहाँ सेट कर दी गई हैं
const firebaseConfig = {
  apiKey: "AIzaSyDxJu0QZDEj1jdtC9VjGNpDQy43x0QIpbs",
  authDomain: "meera-online-point.firebaseapp.com",
  projectId: "meera-online-point",
  storageBucket: "meera-online-point.firebasestorage.app",
  messagingSenderId: "660544825222",
  appId: "1:660544825222:web:5152625caf483b35a5ee07"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let isAdminLoggedIn = false;

// 1. डेटाबेस से सेटिंग्स और सर्विसेज लोड करना
async function loadLiveWebsiteData() {
    const docRef = doc(db, "siteSettings", "config");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const data = docSnap.data();
        
        // थीम कलर्स और टेक्स्ट साइज़ सेट करना
        if (data.theme) {
            document.documentElement.style.setProperty('--main-bg-color', data.theme.bgColor);
            document.documentElement.style.setProperty('--main-font-size', data.theme.textSize);
            
            document.getElementById('bg-color-picker').value = data.theme.bgColor;
            document.getElementById('text-size-picker').value = data.theme.textSize;
        }
        
        // सर्विसेज रेंडर करना
        const container = document.getElementById('services-container');
        container.innerHTML = '';
        if (data.services) {
            data.services.forEach(service => {
                const item = document.createElement('div');
                item.className = 'service-item';
                
                if (isAdminLoggedIn) {
                    item.innerHTML = `📄 ${service} <button class="delete-service-btn" data-service="${service}">Delete</button>`;
                } else {
                    item.innerHTML = `📄 ${service}`;
                }
                container.appendChild(item);
            });
            
            // डिलीट बटन के लिए इवेंट लिस्नर
            document.querySelectorAll('.delete-service-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const name = e.target.getAttribute('data-service');
                    await updateDoc(doc(db, "siteSettings", "config"), {
                        services: arrayRemove(name)
                    });
                    loadLiveWebsiteData();
                });
            });
        }
    }
}

// 2. लॉगिन स्टेट मॉनिटर करना
onAuthStateChanged(auth, (user) => {
    if (user) {
        isAdminLoggedIn = true;
        document.getElementById('admin-panel').style.display = 'block';
    } else {
        isAdminLoggedIn = false;
        document.getElementById('admin-panel').style.display = 'none';
    }
    loadLiveWebsiteData();
});

// 3. पॉपअप बॉक्स कंट्रोल्स
document.getElementById('btn-admin-login-trigger').addEventListener('click', () => {
    document.getElementById('login-modal').style.display = 'flex';
});
document.getElementById('btn-close-modal').addEventListener('click', () => {
    document.getElementById('login-modal').style.display = 'none';
});

// 4. लॉगिन प्रोसेस
document.getElementById('btn-submit-login').addEventListener('click', () => {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            document.getElementById('login-modal').style.display = 'none';
        })
        .catch(err => alert("लॉगिन फ़ेल: " + err.message));
});

// 5. लॉगआउट प्रोसेस
document.getElementById('btn-logout').addEventListener('click', () => signOut(auth));

// 6. नई सर्विस जोड़ना
document.getElementById('btn-add-service').addEventListener('click', async () => {
    const serviceName = document.getElementById('new-service-name').value;
    if (!serviceName) return alert("कृपया सर्विस का नाम लिखें");
    
    await updateDoc(doc(db, "siteSettings", "config"), {
        services: arrayUnion(serviceName)
    });
    document.getElementById('new-service-name').value = '';
    loadLiveWebsiteData();
});

// 7. कलर्स और सेटिंग्स सेव करना
document.getElementById('btn-save-settings').addEventListener('click', async () => {
    const color = document.getElementById('bg-color-picker').value;
    const size = document.getElementById('text-size-picker').value;
    
    await setDoc(doc(db, "siteSettings", "config"), {
        theme: { bgColor: color, textSize: size }
    }, { merge: true });
    
    alert("सेटिंग्स सफलतापूर्वक सेव हो गईं!");
    loadLiveWebsiteData();
});

// पेज लोड होने पर डेटा चालू करें
window.addEventListener('DOMContentLoaded', loadLiveWebsiteData);
