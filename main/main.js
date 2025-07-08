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
  const bucketName = "omarbenabdelaziz-53d71.firebasestorage.app"; // Your bucket name
  const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/`;

  let path = url.split(baseUrl)[1];
  if (!path) return null;
  path = decodeURIComponent(path.split("?")[0]);
  return path;
}

// Reusable image delete helper
export async function deleteImageByUrl(imageUrl) {
  if (!imageUrl) return;
  try {
    const imagePath = getStoragePathFromUrl(imageUrl);
    if (!imagePath) {
      console.warn("Could not parse storage path from URL:", imageUrl);
      return;
    }
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    console.log("Deleted image from storage:", imagePath);
  } catch (error) {
    console.error("Error deleting image from storage:", error);
  }
}

// Reusable announcement delete function (Firestore doc + image)
export async function deleteAnnouncement(announcementId, imageUrl) {
  try {
    if (imageUrl) {
      await deleteImageByUrl(imageUrl);
    }
    await deleteDoc(doc(db, "announcements", announcementId));
    console.log("Deleted announcement:", announcementId);
  } catch (error) {
    console.error("Error deleting announcement:", error);
    throw error;
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  try {
    const response = await fetch('../navBar.html');
    const data = await response.text();
    document.getElementById('nav').innerHTML = data;
  } catch (error) {
    console.error("Error loading navbar:", error);
  }
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = '../login/login.html';
    return;
  }

  console.log('Logged in user:', user.email);
  const userId = user.uid;

  let isAdmin = false;

  // Admin check and add Add Announcement button
  try {
    const adminDoc = await getDoc(doc(db, "admins", userId));
    isAdmin = adminDoc.exists();

    if (isAdmin) {
      console.log("User is an admin.");

      const adminBtn = document.createElement("a");
      adminBtn.classList.add("adminBtn");
      adminBtn.href = "../admin/admin.html";
      adminBtn.innerText = "Add Announcement";

      const container = document.getElementById("buttonContainer");
      if (container) {
        container.appendChild(adminBtn);
      }

      const pendingUsersSnapshot = await getDocs(collection(db, "pendingUsers"));
      const redDot = document.getElementById('redDot');
      if (redDot) {
        redDot.style.display = pendingUsersSnapshot.size > 0 ? 'block' : 'none';
      }
    } else {
      console.log("User is not an admin.");
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
  }

  // Load announcements and auto-delete expired
  try {
    const container = document.getElementById('updates');
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    container.innerHTML = '';

    const expirationMs = 3 * 24 * 60 * 60 * 1000; // 3 days
    // const expirationMs = 1 * 15 * 1000; // 15 seconds for testing
    const now = Date.now();

    for (const docSnap of querySnapshot.docs) {
      const announcement = docSnap.data();
      const createdAt = announcement.createdAt ? announcement.createdAt.toDate().getTime() : 0;

      // Auto-delete expired unpinned announcements
      if (!announcement.pinned && createdAt && (now - createdAt > expirationMs)) {
        try {
          await deleteAnnouncement(docSnap.id, announcement.imageUrl);
          continue; // Skip rendering deleted announcement
        } catch {
          // error logged in deleteAnnouncement
        }
      }

      // Create announcement element
      const announcementElement = document.createElement('div');
      announcementElement.classList.add('update');
      announcementElement.dataset.id = docSnap.id;
      announcementElement.dataset.image = announcement.imageUrl || '';

      // Show delete button only on hover if admin
      announcementElement.style.position = "relative";

      const date = createdAt
        ? new Date(createdAt).toLocaleDateString("en-GB")
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

      if (announcement.imageUrl) {
        html += `<img src="${announcement.imageUrl}" alt="Announcement Image" style="max-width: 100%; margin-top: 10px;">`;
      }

      announcementElement.innerHTML = html;

      if (announcement.pinned) {
        announcementElement.classList.add('pinned');
      }

      // Add delete button for admins
      if (isAdmin) {
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'DELETE';
        deleteBtn.title = 'Delete Announcement';
        deleteBtn.classList.add('delete-btn');

        deleteBtn.addEventListener('click', async (e) => {
          e.stopPropagation(); // prevent any parent click handlers if any
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
