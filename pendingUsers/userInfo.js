import { app, auth, db } from '../database.js';
import { getFirestore, getDoc, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

const infoContainer = document.getElementById("infoContainer");
const acceptButton = document.getElementById("acceptButton");
const rejectButton = document.getElementById("rejectButton");

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("userId");

async function loadUserData() {
    if (!userId) return;

    try {
        const userDoc = await getDoc(doc(db, "pendingUsers", userId));
        if (userDoc.exists()) {
            const data = userDoc.data();

            if (data.profilePicture) {
                const profilePictureDiv = document.createElement("div");
                profilePictureDiv.innerHTML = `
                    <label>Profile Picture:</label>
                    <img src="${data.profilePicture}" alt="Profile Picture" style="max-width: 150px; max-height: 150px;">
                `;
                infoContainer.appendChild(profilePictureDiv);
            }

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
    } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Error loading user data.");
    }
}

// Protect the page
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "../login/login.html"; // Redirect if not logged in
    } else {
        // Check if the user is an admin
        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        if (!adminDoc.exists()) {
            alert("You are not authorized to view this page!");
            window.location.href = "../main/main.html"; // Redirect non-admins to main page
        } else {
            // User is admin, now load user data
            loadUserData();
        }
    }
});

acceptButton.addEventListener("click", async () => {
    const updatedData = {};

    infoContainer.querySelectorAll("input").forEach(input => {
        updatedData[input.id] = input.value;
    });
    // Try to get the current profilePicture URL from the displayed image (if any)
    const profilePicImg = infoContainer.querySelector("img");
    if (profilePicImg) {
      updatedData.profilePicture = profilePicImg.src;
    }


    try {
        await setDoc(doc(db, "Users", userId), updatedData);
        await deleteDoc(doc(db, "pendingUsers", userId));

        alert("User accepted and added to Users collection!");
        window.location.href = "pendingUsers.html";
    } catch (error) {
        console.error("Error accepting user:", error);
        alert("Error accepting user.");
    }
});

rejectButton.addEventListener("click", async () => {
    try {
        await deleteDoc(doc(db, "pendingUsers", userId));
        alert("User rejected and removed from Pending Users!");
        window.location.href = "pendingUsers.html";
    } catch (error) {
        console.error("Error rejecting user:", error);
        alert("Error rejecting user.");
    }
});
