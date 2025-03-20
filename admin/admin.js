document.getElementById('announcementForm').addEventListener('submit', function (e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const pinned = document.getElementById('pin').checked;
    let updates = JSON.parse(localStorage.getItem('announcements')) || [];

    updates.push({ title, content, pinned });

    localStorage.setItem('announcements', JSON.stringify(updates));

    console.log('Announcement saved to localStorage');

    this.reset();

    setTimeout(() => {
        window.location.href = "../main/main.html";
    }, 300);
});