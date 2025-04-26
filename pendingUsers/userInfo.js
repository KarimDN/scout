import { app, auth, db } from '../database.js';
import { getFirestore, getDoc, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

const infoContainer = document.getElementById("infoContainer");
const acceptButton = document.getElementById("acceptButton");
const rejectButton = document.getElementById("rejectButton");

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("userId");

async function loadUserData() {
    if (!userId) return;

    const userDoc = await getDoc(doc(db, "pendingUsers", userId));
    if (userDoc.exists()) {
        const data = userDoc.data();

        // Display profile picture only if it exists
        if (data.profilePicture) {
            const profilePictureDiv = document.createElement("div");
            profilePictureDiv.innerHTML = `
                <label>Profile Picture:</label>
                <img src="${data.profilePicture}" alt="Profile Picture" style="max-width: 150px; max-height: 150px;">
            `;
            infoContainer.appendChild(profilePictureDiv);
        }

        // Create editable fields for other requested data
        const fields = [
            "address", "chronicDisease", "currentRank", "education", "emergencyContact",
            "fatherName", "gender", "homeJob", "medication", "scoutGroup", "scoutName",
            "stage", "surgery", "team"
        ];

        fields.forEach(field => {
            const fieldDiv = document.createElement("div");
            fieldDiv.innerHTML = `
                <label for="${field}">${field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                <input type="text" id="${field}" value="${data[field] || ''}">
            `;
            infoContainer.appendChild(fieldDiv);
        });
    } else {
        alert("User not found!");
    }
}

acceptButton.addEventListener("click", async () => {
    const updatedData = {};

    // Collect updated data from inputs
    infoContainer.querySelectorAll("input").forEach(input => {
        updatedData[input.id] = input.value;
    });

    // Save to Users collection without profilePicture
    await setDoc(doc(db, "Users", userId), updatedData);
    await deleteDoc(doc(db, "pendingUsers", userId));

    alert("User accepted and added to Users collection!");
    window.location.href = "pendingUsers.html";
});

rejectButton.addEventListener("click", async () => {
    // Remove the user from pendingUsers
    await deleteDoc(doc(db, "pendingUsers", userId));

    alert("User rejected and removed from Pending Users!");
    window.location.href = "pendingUsers.html"; 
});

loadUserData();