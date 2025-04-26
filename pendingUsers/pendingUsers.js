import { app, auth, db } from '../database.js';
import { getFirestore, getDocs, collection } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

const tableBody = document.getElementById("tableBody");

async function loadUsers() {
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
}

loadUsers();