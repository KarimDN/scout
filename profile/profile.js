import { app, auth, db } from '../database.js';
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-storage.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";

const storage = getStorage(app);

document.addEventListener('DOMContentLoaded', async function () {
    try {
      const response = await fetch('../navBar.html');
      const data = await response.text();
      document.getElementById('nav').innerHTML = data;
    } catch (error) {
      console.error("Error loading navbar:", error);
    }
  
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = '../login/login.html';
      } else {
        const userId = user.uid;
        const container = document.getElementById('formCard');
        const profCard = document.getElementById('leftCard');
        if (!userId) {
          window.location.href = '../login/login.html';
          return;
        }
  
        try {
          const pendingDoc = await getDoc(doc(db, "pendingUsers", userId));
          if (pendingDoc.exists()) {
            console.log("User is pending");
            container.innerHTML = "<p>طلبك قيد المراجعة...</p>";
            return;
          }
  
          const userDoc = await getDoc(doc(db, "Users", userId));
          if (userDoc.exists()) {
            // User already registered, show their info
            container.innerHTML = '';
            const userData = userDoc.data();
            container.style = 'display: grid; grid-template-columns: 1fr 1fr; gap: 20px;';
            profCard.style = 'height: 100%';
            
            const personalCard = document.createElement('div');
            personalCard.classList.add('card');
            personalCard.innerHTML = `
                <h2>معلومات شخصية</h2>
                <div class="info"><span>اسم الأب:</span> ${userData.fatherName}</div>
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
                <!-- Default Avatar SVG -->
                <svg width="150px" height="150px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  ...
                </svg>
              </div>
              <div class="memberName"><span>الاسم:</span> ${userData.scoutName}</div>
              <div class="memberPosition"><span>الرتبة :</span> ${userData.currentRank}</div>
              `;
            }
  
          } else {
            // User has not entered their data yet
            console.log("User has not entered their data yet");
            const form = document.getElementById("scoutForm");
  
            if (form) {
              form.addEventListener("submit", async function (e) {
                e.preventDefault();
                const imageFile = document.getElementById('profilePic').files[0];
                let imageUrl = "";
  
                if (imageFile) {
                  try {
                    // Create a storage reference
                    const imageRef = storageRef(storage, `profilePictures/${userId}/${imageFile.name}`);
                    // Upload the file
                    await uploadBytes(imageRef, imageFile);
                    // Get the download URL
                    imageUrl = await getDownloadURL(imageRef);
                    console.log("Image URL:", imageUrl);
                  } catch (error) {
                    console.error("Error uploading image to Firebase Storage:", error);
                    alert("فشل رفع الصورة. الرجاء المحاولة مجددًا.");
                    return;
                  }
                }
  
                const formData = {
                  scoutName: document.getElementById("scoutName").value,
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
                  timestamp: new Date(),
                  profilePicture: imageUrl
                };
  
                try {
                  await setDoc(doc(db, "pendingUsers", userId), formData);
                  alert("تم إرسال البيانات بنجاح! في انتظار المراجعة.");
                  form.reset();
                } catch (error) {
                  console.error("Error saving data:", error);
                  alert("حدث خطأ أثناء إرسال البيانات. حاول مرة أخرى.");
                }
              });
            }
          }
  
        } catch (error) {
          console.error("Error:", error);
          container.innerHTML = "<p>حدث خطأ. الرجاء المحاولة مجدداً.</p>";
        }
      }
    });
});
