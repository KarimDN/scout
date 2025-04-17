import { app, auth, db } from '../database.js';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";


const signIn = document.getElementById('submitBtn');
signIn.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('pwd').value;

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        const user = userCredential.user;
        localStorage.setItem('loggedInUserId', user.uid);
        localStorage.setItem('loggedInEmail', user.email);
        window.location.href = '../main/main.html';
    })
    .catch((error) => {
        const errorCode = error.code;
        if(errorCode === 'auth/invalid-credentials'){
            alert('Incorrect Email or Password');
        } else {
            alert(error.message);
        }
    })
})

const forgetPass = document.getElementById('forgetPass');
forgetPass.addEventListener('click', function() {
    const email = document.getElementById('email').value;
    if(email) {
        sendPasswordResetEmail(auth, email)
        .then(() => {
            alert("Email Sent");
        })
        .catch((error) => {
            alert(error.message);
        });
    } else {
        alert("Please enter your email.");
    }
})