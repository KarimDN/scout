import { app, auth, db } from '../database.js';
import { getDoc, doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
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
    if (!userDoc.exists()) {
      alert("المستخدم غير موجود!");
      return;
    }

    const data = userDoc.data();

    // Show profile picture if available
    if (data.profilePicture) {
      const profilePictureDiv = document.createElement("div");
      profilePictureDiv.innerHTML = `
        <label>الصورة الشخصية:</label><br>
        <img src="${data.profilePicture}" alt="Profile Picture" style="max-width: 150px; max-height: 150px;">
      `;
      infoContainer.appendChild(profilePictureDiv);
    }

    const fields = [
      "scoutName", "gender", "fatherName", "homeJob", "address", "emergencyContact", "education",
      "team", "scoutGroup", "stage", "currentRank", 
      "chronicDisease", "medication", "surgery", "bloodType"
    ];

    fields.forEach(field => {
      const fieldDiv = document.createElement("div");
      fieldDiv.innerHTML = `
        <label for="${field}">${field}:</label>
        <input type="text" id="${field}" value="${data[field] || ''}">
      `;
      infoContainer.appendChild(fieldDiv);
    });

  } catch (error) {
    console.error("Error loading user data:", error);
    alert("حدث خطأ أثناء تحميل البيانات.");
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../login/login.html";
    return;
  }

  const adminDoc = await getDoc(doc(db, "admins", user.uid));
  if (!adminDoc.exists()) {
    alert("ليس لديك صلاحية الوصول إلى هذه الصفحة.");
    window.location.href = "../main/main.html";
    return;
  }

  await loadUserData();
});

acceptButton.addEventListener("click", async () => {
  const updatedData = {};

  infoContainer.querySelectorAll("input").forEach(input => {
    updatedData[input.id] = input.value;
  });

  const profilePicImg = infoContainer.querySelector("img");
  if (profilePicImg) {
    updatedData.profilePicture = profilePicImg.src;
  }

  try {
    const isAnonymous = userId.startsWith("anonymous-") || userId.length !== 28;
    const targetCollection = isAnonymous ? "unlinkedUsers" : "Users";

    await setDoc(doc(db, targetCollection, userId), updatedData);
    await deleteDoc(doc(db, "pendingUsers", userId));

    alert(`تم قبول المستخدم ونُقل إلى مجموعة ${isAnonymous ? "unlinkedUsers" : "Users"}.`);
    window.location.href = "pendingUsers.html";
  } catch (error) {
    console.error("Error accepting user:", error);
    alert("حدث خطأ أثناء قبول المستخدم.");
  }
});

rejectButton.addEventListener("click", async () => {
  try {
    await deleteDoc(doc(db, "pendingUsers", userId));
    alert("تم رفض المستخدم وحذفه من قائمة الانتظار.");
    window.location.href = "pendingUsers.html";
  } catch (error) {
    console.error("Error rejecting user:", error);
    alert("حدث خطأ أثناء رفض المستخدم.");
  }
});
