import { app, auth, db } from '../database.js';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import {getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import {getFirestore, setDoc, doc} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

const signIn = document.getElementById('submitBtn');
signIn.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('pwd').value;

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        alert('Login Successfully');
        const user = userCredential.user;
        localStorage.setItem('loggedInUserId', user.uid);
        window.location.href = '../main/main.html';
    })
    .catch((error) => {
        const errorCode = error.code;
        if(errorCode === 'auth/invalid-credential'){
            alert('Incorrect Email or Password');
        } else {
            alert('Account Does Not Exist');
        }
    })
})