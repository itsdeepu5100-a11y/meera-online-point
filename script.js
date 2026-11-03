import { initializeApp } from "https://gstatic.com";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://gstatic.com";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://gstatic.com";

// आपके प्रोजेक्ट का वेरिफाइड क्रेडेंशियल
const firebaseConfig = {
  apiKey: "AIzaSyDxJu0QZDEj1jdtC9VjGNpDQy43x0QIpbs",
  authDomain: "://firebaseapp.com",
  projectId: "meera-online-point",
  storageBucket: "meera-online-point.firebasestorage.app",
  messagingSenderId: "660544825222",
  appId: "1:660544825222:web:5152625caf483b35a5ee07"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let isAdminLoggedIn = false;

// डेटाबेस से लाइव थीम और डायनेमिक सर्विसेज लोड करना
async function loadLiveWebsiteData() {
    try {
        const docRef = doc(db, "siteSettings", "config");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // 1. लाइव कलर्स और फॉन्ट साइज लागू करना
            if (data.theme) {
                document.documentElement.style.setProperty('--main-bg-color', data.theme.bgColor);
                document.documentElement.style.setProperty('--main-font-size', data.theme.textSize);
                
                document.getElementById('bg-color-picker').value = data.theme.bgColor;
                document.getElementById('text-size-picker').value = data.theme.textSize;
            }
            
            // 2. एक्स्ट्रा सर्विसेज लोड करना
            const container = document.getElementById('dynamic-services-container');
            const title = document.getElementById('additional-services-title');
            container.innerHTML = '';
            
            if (data.services && data.services.length > 0) {
                title.style.display = 'block';
                data.services.forEach(service => {
                    const item = document.createElement('div');
                    item.className = 'service-card dynamic-card';
                    
                    if (isAdminLoggedIn) {
                        item.innerHTML = `⚙️ <h3>${service}</h3><button class="delete-service-btn" data-service="${service}">Remove</button>`;
                    } else {
                        item.innerHTML = `💻 <h3>${service}</h3><p>विशेष ऑनलाइन सेवा</p>`;
                    }
                    container.appendChild(item);
                });
                
                // रिमूव बटन पर क्लिक हैंडलर लगाना
                document.querySelectorAll('.delete-service-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const name = e.target.getAttribute('data-service');
                        if(confirm(`क्या आप "${name}" सर्विस को हटाना चाहते हैं?`)) {
                            await updateDoc(doc(db, "siteSettings", "config"), {
                                services: arrayRemove(name)
                            });
                            loadLiveWebsiteData();
                        }
                    });
                });
            } else {
                title.style.display = 'none';
            }
        }
    } catch (error) {
        console.log("डेटाबेस से अभी कोई नया डेटा नहीं मिला, डिफ़ॉल्ट चालू है।", error);
    }
}

// लॉगिन की स्थिति पर नजर रखना
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

// लॉगिन पॉपअप खोलना/बंद करना
document.getElementById('btn-admin-login-trigger').addEventListener('click', () => {
    document.getElementById('login-modal').style.display = 'flex';
});
document.getElementById('btn-close-modal').addEventListener('click', () => {
    document.getElementById('login-modal').style.display = 'none';
});

// लॉगिन बटन का काम
document.getElementById('btn-submit-login').addEventListener('click', () => {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    if(!email || !password) {
        alert("कृपया सही ईमेल और पासवर्ड भरें");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            document.getElementById('login-modal').style.display = 'none';
            alert("सफलतापूर्वक लॉगिन हुआ! एडमिन पैनल नीचे खुल गया है।");
        })
        .catch(err => alert("लॉगिन फेल: " + err.message));
});

// लॉगआउट बटन का काम
document.getElementById('btn-logout').addEventListener('click', () => {
    signOut(auth).then(() => {
        alert("एडमिन पैनल बंद हो गया है।");
    });
});

// नई सर्विस जोड़ना
document.getElementById('btn-add-service').addEventListener('click', async () => {
    const serviceName = document.getElementById('new-service-name').value;
    if (!serviceName) return alert("कृपया सर्विस का नाम लिखें");
    
    await updateDoc(doc(db, "siteSettings", "config"), {
        services: arrayUnion(serviceName)
    });
    document.getElementById('new-service-name').value = '';
    loadLiveWebsiteData();
});

// कलर्स और फॉन्ट सेटिंग्स सेव करना
document.getElementById('btn-save-settings').addEventListener('click', async () => {
    const color = document.getElementById('bg-color-picker').value;
    const size = document.getElementById('text-size-picker').value;
    
    await setDoc(doc(db, "siteSettings", "config"), {
        theme: { bgColor: color, textSize: size }
    }, { merge: true });
    
    alert("वेबसाइट की थीम बदल दी गई है!");
    loadLiveWebsiteData();
});

// पेज लोड होने पर शुरू करें
window.addEventListener('DOMContentLoaded', loadLiveWebsiteData);
