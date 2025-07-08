import { app, auth, db } from '../database.js';
import { getFirestore, setDoc, doc, getDoc, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

const storage = getStorage(app);

onAuthStateChanged(auth, async(user) => {
    if(!user){
        window.location.href = '../login/login.html';
    } else {

        const userId = user.uid;
        const adminRef = doc(db, "admins", userId);
        getDoc(adminRef)
        .then(docSnap => {
            if (!docSnap.exists()) {
                window.location.href = "../main/main.html";
            }
        })
        .catch(error => {
            console.error("Error checking admin status:", error);
        });

        document.getElementById('announcementForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            
            const title = document.getElementById('title').value;
            const content = document.getElementById('content').value;
            const pinned = document.getElementById('pin').checked;
            const imageFile = document.getElementById('imageUpload').files[0];
        
            let imageUrl = "";

            if (imageFile) {
                try {
                    // Create a reference to Firebase Storage location
                    const imageRef = storageRef(storage, `announcementImages/${userId}/${imageFile.name}`);
                    // Upload the file
                    await uploadBytes(imageRef, imageFile);
                    // Get the download URL
                    imageUrl = await getDownloadURL(imageRef);
                    console.log("Image URL:", imageUrl);
                } catch (error) {
                    console.error("Error uploading image to Firebase Storage:", error);
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
    }
})
