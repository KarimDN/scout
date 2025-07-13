import { app, auth, db } from '../database.js';
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";
import { loadNavBar, handleAdminNavBar } from '../navBar.js';
import { Timestamp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";



const storage = getStorage(app);

function showForm(container, profCard, userId) {
  profCard.innerHTML = '';

  const form = document.getElementById("scoutForm");
  if (!form) return;

  form.style.display = 'block';
  const clonedForm = form.cloneNode(true);
  form.replaceWith(clonedForm);
  const newForm = document.getElementById("scoutForm"); // updated form

  const uploadLoader = document.getElementById("uploadLoader"); // Get here after DOM is ready

  newForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    uploadLoader.style.display = "flex"; // Show loading overlay

    const imageFile = document.getElementById('profilePic').files[0];
    let imageUrl = "";

    try {
      if (imageFile) {
        const pathUserId = userId || 'anonymous-' + uuidv4();

        // compress image
        const compressedFile = await imageCompression(imageFile, {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true
        });

        const imageRef = storageRef(storage, `profilePictures/${pathUserId}/${imageFile.name}`);
        await uploadBytes(imageRef, compressedFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const formData = {
        scoutName: document.getElementById("scoutName").value,
        email: document.getElementById("email").value,
        birthdate: document.getElementById("birthdate").value,
        timestamp: Timestamp.now(),
        fatherName: document.getElementById("fatherName").value,
        homeJob: document.getElementById("homeJob").value,
        address: document.getElementById("address").value,
        education: document.getElementById("education").value,
        stage: document.getElementById("stage").value,
        gender: document.getElementById("gender").value,
        team: document.getElementById("team").value,
        bloodType: document.getElementById("bloodType").value,
        chronicDisease: document.getElementById("chronicDisease").value,
        medication: document.getElementById("medication").value,
        surgery: document.getElementById("surgery").value,
        emergencyContact: document.getElementById("emergencyContact").value,
        scoutGroup: document.getElementById("scoutGroup").value,
        currentRank: document.getElementById("currentRank").value,
        profilePicture: imageUrl
      };

      const documentId = userId || uuidv4();
      await setDoc(doc(db, "pendingUsers", documentId), formData);
      alert("تم إرسال البيانات بنجاح! في انتظار المراجعة.");
      newForm.reset();
      location.reload();
    } catch (error) {
      console.error("Error saving data:", error);
      alert("حدث خطأ أثناء إرسال البيانات. حاول مرة أخرى.");
    } finally {
      uploadLoader.style.display = "none"; // Hide loader
    }
  });
}

document.addEventListener('DOMContentLoaded', async function () {
  await loadNavBar();
  handleAdminNavBar();

  let user = null;
  onAuthStateChanged(auth, async (u) => {
    user = u;

    const userId = user ? user.uid : null;
    const container = document.getElementById('formCard');
    const profCard = document.getElementById('leftCard');

    if (userId) {
      try {
        const pendingDoc = await getDoc(doc(db, "pendingUsers", userId));
        if (pendingDoc.exists()) {
          container.innerHTML = "<p>طلبك قيد المراجعة...</p>";
          return;
        }

        const userDoc = await getDoc(doc(db, "Users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          container.innerHTML = '';
          container.style = 'display: grid; grid-template-columns: 1fr 1fr; gap: 20px;';
          profCard.style = 'height: 100%';

          const personalCard = document.createElement('div');
          personalCard.classList.add('card');
          personalCard.innerHTML = `
            <h2>معلومات شخصية</h2>
            <div class="info"><span>اسم الأب:</span> ${userData.fatherName}</div>
            <div class="info"><span>تاريخ الميلاد:</span> ${userData.birthdate || ''}</div>
            <div class="info"><span>البريد الإلكتروني:</span> ${userData.email || ''}</div>
            <div class="info"><span>عنوان السكن:</span> ${userData.address}</div>
            <div class="info"><span>التحصيل العلمي:</span> ${userData.education}</div>
            <div class="info"><span>الجنس:</span> ${userData.gender}</div>
          `;

          const scoutingCard = document.createElement('div');
          scoutingCard.classList.add('card');
          scoutingCard.innerHTML = `
            <h2>معلومات كشفية</h2>
            <div class="info"><span>المرحلة:</span> ${userData.stage}</div>
            <div class="info"><span>الفرقة:</span> ${userData.team}</div>
            <div class="info"><span>اسم الطليعة:</span> ${userData.scoutGroup}</div>
            <div class="info"><span>الاتصال في حالات الطوارئ:</span> ${userData.emergencyContact}</div>
          `;

          container.appendChild(personalCard);
          container.appendChild(scoutingCard);

          if (userData.profilePicture) {
            profCard.innerHTML = `
              <div class="picture">
                <img src="${userData.profilePicture}" alt="UserProfilePic" style="max-width: 100%;">
              </div>
              <div class="memberName"><span>الاسم:</span> ${userData.scoutName}</div>
              <div class="memberPosition"><span>الرتبة :</span> ${userData.currentRank}</div>
            `;
          } else {
            profCard.innerHTML = `
              <div class="picture">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path opacity="0.4" d="M12 22.01C17.5228 22.01 22 17.5329 22 12.01C22 6.48716 17.5228 2.01001 12 2.01001C6.47715 2.01001 2 6.48716 2 12.01C2 17.5329 6.47715 22.01 12 22.01Z" fill="#292D32"/>
                  <path d="M12 6.93994C9.93 6.93994 8.25 8.61994 8.25 10.6899C8.25 12.7199 9.84 14.3699 11.95 14.4299C11.98 14.4299 12.02 14.4299 12.04 14.4299C12.06 14.4299 12.09 14.4299 12.11 14.4299C12.12 14.4299 12.13 14.4299 12.13 14.4299C14.15 14.3599 15.74 12.7199 15.75 10.6899C15.75 8.61994 14.07 6.93994 12 6.93994Z" fill="#292D32"/>
                  <path d="M18.7807 19.36C17.0007 21 14.6207 22.01 12.0007 22.01C9.3807 22.01 7.0007 21 5.2207 19.36C5.4607 18.45 6.1107 17.62 7.0607 16.98C9.7907 15.16 14.2307 15.16 16.9407 16.98C17.9007 17.62 18.5407 18.45 18.7807 19.36Z" fill="#292D32"/>
                </svg>
              </div>
              <div class="memberName"><span>الاسم:</span> ${userData.scoutName}</div>
              <div class="memberPosition"><span>الرتبة :</span> ${userData.currentRank}</div>
            `;
          }

        } else {
          showForm(container, profCard, userId); // Not registered yet
        }

      } catch (error) {
        console.error("Error loading user data:", error);
        container.innerHTML = "<p>حدث خطأ. الرجاء المحاولة مجدداً.</p>";
      }
    } else {
      showForm(container, profCard, null); // Not logged in
    }
  });
});