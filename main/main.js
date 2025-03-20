

document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector('.announcements .updates');

    // Get announcements from localStorage
    let updates = JSON.parse(localStorage.getItem('announcements')) || [];
    let username = localStorage.getItem('username');
    // Loop through and display each update
    if(username === 'ADMIN'){
        if(!document.querySelector('.adminBtn')){
            let adminBtn = document.createElement('a');
            adminBtn.classList.add('adminBtn');
            adminBtn.href = '../admin/admin.html';
            adminBtn.innerText = 'Admin Pannel';
            container.appendChild(adminBtn);
        }
    }
    updates.forEach(update => {
        const newUpdate = document.createElement('div');
        newUpdate.classList.add('update');
        newUpdate.innerHTML = `
            <div class="title">
                <div class="pin">
                    <svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M6.5 5C6.5 4.44772 6.94772 4 7.5 4H9H15H16.5C17.0523 4 17.5 4.44772 17.5 5C17.5 5.55228 17.0523 6 16.5 6H16.095L16.9132 15H19C19.5523 15 20 15.4477 20 16C20 16.5523 19.5523 17 19 17H16H13V22C13 22.5523 12.5523 23 12 23C11.4477 23 11 22.5523 11 22V17H8H5C4.44772 17 4 16.5523 4 16C4 15.4477 4.44772 15 5 15H7.08679L7.90497 6H7.5C6.94772 6 6.5 5.55228 6.5 5ZM9.91321 6L9.09503 15H12H14.905L14.0868 6H9.91321Z" fill="#000000"/>
                    </svg>
                </div>
                <h4>${update.title}</h4>
            </div>
            <p>${update.content}</p>
        `;
        if(update.pinned){
            newUpdate.classList.add('pinned');
        }

        
        container.appendChild(newUpdate);
    });
});

fetch('../navBar.html')
    .then(response => response.text())
    .then(data => document.getElementById('nav').innerHTML = data);




