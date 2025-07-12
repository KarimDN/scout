// navBar.js
import { auth, db } from '../database.js';
import {
  getDoc,
  doc,
  getDocs,
  collection
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

// Load navbar into page
export async function loadNavBar() {
  try {
    const response = await fetch('../navBar.html');
    const data = await response.text();
    document.getElementById('nav').innerHTML = data;
    setupLogoutListener();
  } catch (error) {
    console.error("Error loading navbar:", error);
  }
}

// Admin handling inside navbar
export function handleAdminNavBar() {
  onAuthStateChanged(auth, async (user) => {
    const userId = user.uid;

    try {
      const adminDoc = await getDoc(doc(db, "admins", userId));
      const isAdmin = adminDoc.exists();

      if (isAdmin) {
        console.log("User is admin");

        // Wait for DOM update
        await new Promise(resolve => setTimeout(resolve, 100));

        const navLinks = document.getElementById("navLinks");
        if (navLinks) {
          const adminLi = document.createElement("li");
          adminLi.innerHTML = `
            <a href="../admin/admin.html" style="position: relative;">
              <span style="font-size: 18px">أدوات المدير</span>
              <span id="redDot" class="red-dot" style="display: none; position: absolute; top: -5px; right: -5px; width: 10px; height: 10px; background: red; border-radius: 50%;"></span>
            </a>
          `;
          navLinks.insertBefore(adminLi, navLinks.children[1]);

          const pendingUsersSnapshot = await getDocs(collection(db, "pendingUsers"));
          if (pendingUsersSnapshot.size > 0) {
            const redDot = document.getElementById("redDot");
            if (redDot) redDot.style.display = "block";
          }
        }
      }
    } catch (err) {
      console.error("Admin check error:", err);
    }
  });
}

function setupLogoutListener() {
  const logoutBtn = document.getElementById("logOutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await signOut(auth);
        window.location.href = "../login/login.html";
      } catch (error) {
        console.error("Error during logout:", error);
        alert("حدث خطأ أثناء تسجيل الخروج");
      }
    });
  }
}


