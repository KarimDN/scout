import { app, auth, db } from '../database.js';
import { getDoc, doc, query, orderBy, getDocs, collection } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";


document.addEventListener('DOMContentLoaded', async function () {
  try {
    const response = await fetch('../navBar.html');
    const data = await response.text();
    document.getElementById('nav').innerHTML = data;
  } catch (error) {
    console.error("Error loading navbar:", error);
  }
});

onAuthStateChanged(auth, async(user) => {
    if (!user) {
        window.location.href = '../login/login.html';
    } else {
        console.log('Logged in user:', user.email);

        const userId = user.uid;
    
        try {
          const adminDoc = await getDoc(doc(db, "admins", userId));
          if (adminDoc.exists()) {
                console.log("User is an admin.");
    
                let adminBtn = document.createElement("a");
                adminBtn.classList.add("adminBtn");
                adminBtn.href = "../admin/admin.html";
                adminBtn.innerText = "Add Announcement";
                const container = document.getElementById("buttonContainer");
                if (container) {
                    container.appendChild(adminBtn);
                }
            } else {
                console.log("User is not an admin.");
            }
        } catch(error){
            console.error("Error checking admin status:", error);
        }

        try{
            const container = document.getElementById('updates');

            const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);

            container.innerHTML = '';

            querySnapshot.forEach(doc => {
                const announcement = doc.data();
                const announcementElement = document.createElement('div');
                announcementElement.classList.add('update');

                const date = announcement.createdAt
                ? new Date(announcement.createdAt.toDate()).toLocaleDateString("en-GB")
                : "Unknown Date";


                let html = `
                    <div class="title">
                        <div class="pin">
                            <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M6.5 5C6.5 4.44772 6.94772 4 7.5 4H9H15H16.5C17.0523 4 17.5 4.44772 17.5 5C17.5 5.55228 17.0523 6 16.5 6H16.095L16.9132 15H19C19.5523 15 20 15.4477 20 16C20 16.5523 19.5523 17 19 17H16H13V22C13 22.5523 12.5523 23 12 23C11.4477 23 11 22.5523 11 22V17H8H5C4.44772 17 4 16.5523 4 16C4 15.4477 4.44772 15 5 15H7.08679L7.90497 6H7.5C6.94772 6 6.5 5.55228 6.5 5ZM9.91321 6L9.09503 15H12H14.905L14.0868 6H9.91321Z" fill="#000000"/>
                            </svg>
                        </div>
                        <h4>${announcement.title}</h4>
                    </div>
                    <p>${announcement.content}</p>
                    <small>${date}</small>
                `;

                if(announcement.imageUrl) {
                    html += `<img src="${announcement.imageUrl}" alt="Announcement Image" style="max-width: 100%; margin-top: 10px;">`;
                }

                announcementElement.innerHTML = html;

                if(announcement.pinned) {
                    announcementElement.classList.add('pinned');
                }

                container.appendChild(announcementElement);
            });
        } catch(error){
            console.error("Error loading announcements:", error);
        }
    } 
})