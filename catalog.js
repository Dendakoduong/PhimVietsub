document.addEventListener("DOMContentLoaded", function () {
  const apiKey = "f6062ea8b0d90fa9ad309cfdd78b9875  "; // Replace with your TMDb API key
  const tvId = 431; // The Simpsons TV show ID on TMDb
  const seasonNumber = 18; // Season 18

  // Fetch the episode data from the TMDb API
  fetch(
    `https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}/episodes?api_key=${apiKey}&language=en-US`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // Get the container where the episodes will be displayed
      const episodesContainer = document.getElementById("episodes-container");

      // Loop through each episode and create a Bootstrap card for it
      data.episodes.forEach((episode) => {
        // Create a new card element
        const card = document.createElement("div");
        card.classList.add("col-md-4", "mb-4");

        // Add the HTML for the card
        card.innerHTML = `
                  <div class="card">
                      <img src="https://image.tmdb.org/t/p/w500${
                        episode.still_path
                      }" class="card-img-top" alt="Episode Image">
                      <div class="card-body">
                          <h5 class="card-title">${episode.name}</h5>
                          <p class="card-text">Season: ${seasonNumber}</p>
                          <a href="streaming.html?video_url=${encodeURIComponent(
                            `https://www.tmdb.org/tv/${tvId}/season/${seasonNumber}/episode/${episode.episode_number}`
                          )}" class="btn btn-primary">View</a>
                      </div>
                  </div>
              `;

        // Append the card to the container
        episodesContainer.appendChild(card);
      });
    })
    .catch((error) => console.error("Error loading episode data:", error));
});
