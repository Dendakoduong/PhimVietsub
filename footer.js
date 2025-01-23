// Function to fetch and load the footer content from the footer.html file
window.onload = function () {
  fetch("footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("dynamic-footer").innerHTML = data;
    })
    .catch((error) => console.error("Error loading footer:", error));
};
