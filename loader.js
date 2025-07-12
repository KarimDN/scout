// loader.js
document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  if (loader) {
    // You can wait for Firebase to finish loading here if needed
    setTimeout(() => {
      loader.style.display = "none";
    }, 1000);
  }
});
