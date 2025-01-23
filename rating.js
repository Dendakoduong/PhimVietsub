document.addEventListener("DOMContentLoaded", function () {
  const stars = document.querySelectorAll("#star-rating .fa");
  const ratingOutput = document.getElementById("rating-value");
  let rating = 0;

  // Retrieve the stored rating from localStorage (if exists)
  const storedRating = localStorage.getItem("episodeRating");
  if (storedRating) {
    rating = parseInt(storedRating);
    updateRating(rating); // Update the displayed rating
  }

  // Set up click event on stars
  stars.forEach((star) => {
    star.addEventListener("click", function () {
      // Update the rating when a star is clicked
      rating = parseInt(this.getAttribute("data-index"));
      localStorage.setItem("episodeRating", rating); // Save the rating to localStorage
      updateRating(rating);
    });

    // Highlight stars on hover
    star.addEventListener("mouseover", function () {
      const index = parseInt(this.getAttribute("data-index"));
      highlightStars(index);
    });

    // Remove highlight when mouse leaves
    star.addEventListener("mouseleave", function () {
      highlightStars(rating);
    });
  });

  // Function to update the rating display
  function updateRating(rating) {
    ratingOutput.textContent = rating;
    highlightStars(rating);
  }

  // Function to highlight the stars
  function highlightStars(rating) {
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.add("text-warning");
      } else {
        star.classList.remove("text-warning");
      }
    });
  }
});
