import { app, auth, db } from '../database.js';
import { getFirestore, setDoc, doc, getDoc, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

const userId = localStorage.getItem('loggedInUserId');

if (!userId) {
    alert("Please log in first.");
    window.location.href = "../login/login.html";
} else {
    const adminRef = doc(db, "admins", userId);
    getDoc(adminRef)
        .then(docSnap => {
            if (!docSnap.exists()) {
                alert("You are not authorized to access this page.");
                window.location.href = "../main/main.html";
            }
        })
        .catch(error => {
            console.error("Error checking admin status:", error);
        });
}

document.getElementById('announcementForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const pinned = document.getElementById('pin').checked;
    const imageFile = document.getElementById('imageUpload').files[0];

    let imageUrl = "";

    if (imageFile) {
        // Initialize Filestack with your API key
        const apiKey = 'Afu0mqReaUsEy91qf8mQwz';  // Replace with your actual Filestack API key
        const client = filestack.init(apiKey);

        try {
            const uploadedFile = await client.upload(imageFile);
            imageUrl = uploadedFile.url; // Get the URL of the uploaded image
            console.log("Image URL:", imageUrl);
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Image upload failed. Please try again.");
            return;
        }
    }

    try {
        await addDoc(collection(db, "announcements"), {
            title: title,
            content: content,
            pinned: pinned,
            imageUrl: imageUrl,
            createdAt: serverTimestamp()
        });

        alert("Successfully Announced!");
        document.getElementById('announcementForm').reset(); // Clear the form
        window.location.href = "../main/main.html"; // Redirect after success
    } catch (error) {
        console.error("Error posting announcement:", error);
        alert("Error posting announcement. Please try again.");
    }
});
