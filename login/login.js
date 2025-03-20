const login = document.getElementById('loginForm').addEventListener("submit", function(e) {
    e.preventDefault();
    const userName = document.getElementById('usrName').value;
    localStorage.setItem('username', userName);
    setTimeout(() => {
        window.location.href = "../main/main.html";
    }, 300);
});


