import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import {getFirestore, setDoc, doc} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-AxGPkmEXr3lPE6BobCuoP2uEENmKbHY",
  authDomain: "omarbenabdelaziz-53d71.firebaseapp.com",
  projectId: "omarbenabdelaziz-53d71",
  storageBucket: "omarbenabdelaziz-53d71.firebasestorage.app",
  messagingSenderId: "922216423766",
  appId: "1:922216423766:web:3b211423c07c82badd36f7",
  measurementId: "G-C2F87ZG3LP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

export{ app, auth, db }