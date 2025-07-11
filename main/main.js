import { app, auth, db } from '../database.js';
import {
  getDoc, doc, query, orderBy, getDocs, collection, deleteDoc
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import {
  getStorage, ref, deleteObject
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-storage.js";

const storage = getStorage();

function getStoragePathFromUrl(url) {
  const bucketName = "omarbenabdelaziz-53d71.firebasestorage.app";
  const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/`;
  let path = url.split(baseUrl)[1];
  if (!path) return null;
  return decodeURIComponent(path.split("?")[0]);
}

export async function deleteImageByUrl(imageUrl) {
  if (!imageUrl) return;
  try {
    const imagePath = getStoragePathFromUrl(imageUrl);
    if (!imagePath) {
      console.warn("Could not parse storage path:", imageUrl);
      return;
    }
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    console.log("Deleted image:", imagePath);
  } catch (error) {
    console.error("Error deleting image:", error);
  }
}

export async function deleteAnnouncement(announcementId, imageUrl) {
  try {
    if (imageUrl) await deleteImageByUrl(imageUrl);
    await deleteDoc(doc(db, "announcements", announcementId));
    console.log("Deleted announcement:", announcementId);
  } catch (error) {
    console.error("Error deleting announcement:", error);
    throw error;
  }
}

// Load navbar on page load
document.addEventListener('DOMContentLoaded', async function () {
  try {
    const response = await fetch('../navBar.html');
    const data = await response.text();
    document.getElementById('nav').innerHTML = data;
  } catch (error) {
    console.error("Error loading navbar:", error);
  }
});

// Auth check and admin handling
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = '../login/login.html';
    return;
  }

  console.log('Logged in:', user.email);
  const userId = user.uid;
  let isAdmin = false;

  try {
    const adminDoc = await getDoc(doc(db, "admins", userId));
    isAdmin = adminDoc.exists();
    if (isAdmin) {
      console.log("User is admin");

      // Wait for navbar to be injected
      await new Promise(resolve => setTimeout(resolve, 100)); // wait for DOM update

      const navLinks = document.getElementById("navLinks");
      if (navLinks) {
        // Insert "Pending Users" with red dot
        const pendingLi = document.createElement("li");
        pendingLi.innerHTML = `
          <a href="../pendingUsers/pendingUsers.html" style="position: relative;">
            <span style="font-size: 18px">المستخدمون المعلقون</span>
            <span id="redDot" class="red-dot" style="display: none; position: absolute; top: -5px; right: -5px; width: 10px; height: 10px; background: red; border-radius: 50%;"></span>
          </a>
        `;
        navLinks.insertBefore(pendingLi, navLinks.children[1]);

        const pendingUsersSnapshot = await getDocs(collection(db, "pendingUsers"));
        if (pendingUsersSnapshot.size > 0) {
          const redDot = document.getElementById("redDot");
          if (redDot) redDot.style.display = "block";
        }
      }

      // Add "Add Announcement" button
      const adminBtn = document.createElement("a");
      adminBtn.classList.add("adminBtn");
      adminBtn.href = "../admin/admin.html";
      adminBtn.innerText = "Add Announcement";

      const buttonContainer = document.getElementById("buttonContainer");
      if (buttonContainer) {
        buttonContainer.appendChild(adminBtn);
      }
    }
  } catch (err) {
    console.error("Admin check error:", err);
  }

  // Load and render announcements
  try {
    const container = document.getElementById('updates');
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    container.innerHTML = '';

    const expirationMs = 3 * 24 * 60 * 60 * 1000; // 3 days
    const now = Date.now();

    for (const docSnap of querySnapshot.docs) {
      const announcement = docSnap.data();
      const createdAt = announcement.createdAt?.toDate().getTime() || 0;

      if (!announcement.pinned && createdAt && (now - createdAt > expirationMs)) {
        try {
          await deleteAnnouncement(docSnap.id, announcement.imageUrl);
          continue;
        } catch {
          // already logged
        }
      }

      const announcementElement = document.createElement('div');
      announcementElement.classList.add('update');
      announcementElement.dataset.id = docSnap.id;
      announcementElement.dataset.image = announcement.imageUrl || '';
      announcementElement.style.position = "relative";

      const date = createdAt
        ? new Date(createdAt).toLocaleDateString("en-GB")
        : "Unknown Date";

      let html = `
        <div class="title">
          <div class="pin">
            <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.5 5C6.5 4.44772...Z" fill="#000000"/>
            </svg>
          </div>
          <h4>${announcement.title}</h4>
        </div>
        <p>${announcement.content}</p>
        <small>${date}</small>
      `;

      if (announcement.imageUrl) {
        html += `<img src="${announcement.imageUrl}" alt="Announcement Image" style="max-width: 100%; margin-top: 10px;">`;
      }

      announcementElement.innerHTML = html;

      if (announcement.pinned) {
        announcementElement.classList.add('pinned');
      }

      if (isAdmin) {
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'DELETE';
        deleteBtn.title = 'Delete Announcement';
        deleteBtn.classList.add('delete-btn');

        deleteBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const confirmDelete = confirm("Are you sure you want to delete this announcement?");
          if (!confirmDelete) return;
          try {
            await deleteAnnouncement(announcementElement.dataset.id, announcementElement.dataset.image);
            announcementElement.remove();
          } catch {
            alert("Failed to delete announcement.");
          }
        });

        announcementElement.appendChild(deleteBtn);
      }

      container.appendChild(announcementElement);
    }
  } catch (error) {
    console.error("Error loading announcements:", error);
  }
});
