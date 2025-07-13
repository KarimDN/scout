import { auth, db } from '../database.js';  // Assuming this is where Firebase is initialized
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { getDocs, collection } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { loadNavBar, handleAdminNavBar } from '../navBar.js';

const tableBody = document.getElementById("tableBody");

document.addEventListener('DOMContentLoaded', async () => {
  await loadNavBar();          // Load navbar first
  handleAdminNavBar();         // Inject admin link & red dot
});

async function loadUsers() {
  // Make sure user is logged in and is an admin
  onAuthStateChanged(auth, async (user) => {
    const adminRef = doc(db, "admins", user.uid);
    const adminSnap = await getDoc(adminRef);
    if (!adminSnap.exists()) return location.href = '../main/main.html';
    if (!user) {
      window.location.href = '../login/login.html';  // Redirect to login page if not authenticated
    } else {
      // Check if the user is an admin
      try {
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        if (adminDoc.exists()) {
          console.log("User is an admin.");

          // Proceed to fetch pending users
          const querySnapshot = await getDocs(collection(db, "pendingUsers"));
          tableBody.innerHTML = ""; // Clear the table before loading users
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement("tr");

            row.innerHTML = `
              <td>${data.scoutName || 'N/A'}</td>
              <td>${data.currentRank || 'N/A'} - ${data.stage || 'N/A'}</td>
            `;

            // Add click event to each row
            row.addEventListener("click", () => {
                // Navigate to the user info page with the user ID as a query parameter
                window.location.href = `userInfo.html?userId=${doc.id}`;
            });

            tableBody.appendChild(row);
          });
        } else {
          console.log("User is NOT an admin.");
          // Optionally, you can show an error message or redirect the user if they are not an admin
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    }
  });
}

loadUsers();
