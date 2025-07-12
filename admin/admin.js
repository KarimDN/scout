import { auth, db } from "../database.js";
import {
  getDoc,
  getDocs,
  doc,
  collection
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { loadNavBar, handleAdminNavBar } from '../navBar.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadNavBar();          // Load navbar first
  handleAdminNavBar();         // Inject admin link & red dot
});

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  try {
    const adminRef = doc(db, "admins", user.uid);
    const adminSnap = await getDoc(adminRef);

    if (adminSnap.exists()) {
      const pendingUsersSnapshot = await getDocs(collection(db, "pendingUsers"));
      if (pendingUsersSnapshot.size > 0) {
        const redDot = document.getElementById("redDot");
        if (redDot) redDot.style.opacity = 1;
      }
    } else {
      window.location.href = "../main/main.html";
    }
  } catch (error) {
    console.error("Error checking admin or pending users:", error);
  }
});
