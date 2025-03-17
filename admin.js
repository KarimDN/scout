document.getElementById('announcementForm').addEventListener('submit', function (e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    // Get existing updates or create an empty array
    let updates = JSON.parse(localStorage.getItem('announcements')) || [];

    // Add the new update
    updates.push({ title, content });

    // Save back to localStorage
    localStorage.setItem('announcements', JSON.stringify(updates));

    console.log('Announcement saved to localStorage');

    this.reset(); // Clear the form
});