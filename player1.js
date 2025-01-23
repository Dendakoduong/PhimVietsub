document.addEventListener("DOMContentLoaded", function () {
  const tmdbApiKey = "f6062ea8b0d90fa9ad309cfdd78b9875"; // Replace with your TMDb API key
  const tmdbBaseUrl = "https://api.themoviedb.org/3";

  // Retrieve episode data from localStorage
  const episodeData = JSON.parse(localStorage.getItem("episodeData"));

  if (!episodeData) {
    console.error("No episode data found!");
    return;
  }

  // Update the page with episode details
  document.getElementById("episode-name").textContent = episodeData.name;
  document.getElementById("episode-title").textContent = episodeData.title;
  document.getElementById("episode-season").textContent = episodeData.season;
  document.getElementById("video-player").src = episodeData.video_url;

  // Update the title of the page (browser tab)
  document.title = `${episodeData.name} - ${episodeData.title}`;

  // Fetch show details from TMDb
  fetch(
    `${tmdbBaseUrl}/search/tv?api_key=${tmdbApiKey}&query=${encodeURIComponent(
      episodeData.name
    )}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.results && data.results.length > 0) {
        const show = data.results[0]; // Use the first result
        const showId = show.id;

        // Fetch additional details about the show
        return fetch(`${tmdbBaseUrl}/tv/${showId}?api_key=${tmdbApiKey}`);
      } else {
        throw new Error("Show not found on TMDb.");
      }
    })
    .then((response) => response.json())
    .then((showDetails) => {
      const detailsContainer = document.createElement("div");
      detailsContainer.classList.add("details-container", "mt-4");
      //beta
      const voteAverage = showDetails.vote_average; // Example: 8.4
      const userScore = Math.round(voteAverage * 10); // Convert to percentage (e.g., 84%)

      // Update the text and progress
      document.getElementById("score-percentage").textContent = `${userScore}%`;

      // Calculate stroke-dasharray for the circular progress
      const circle = document.querySelector(".circle");
      const progress = (userScore / 100) * 100;
      circle.setAttribute("stroke-dasharray", `${progress}, 100`);
      //beta end
      // Heading
      const heading = document.createElement("h3");
      heading.classList.add("details-heading");
      heading.textContent = "About the Show";

      // Poster container
      const posterContainer = document.createElement("div");
      posterContainer.classList.add("poster-container");
      const posterUrl = showDetails.poster_path
        ? `https://image.tmdb.org/t/p/w200${showDetails.poster_path}`
        : "no_image.png"; // Fallback image if no poster is available
      const poster = document.createElement("img");
      poster.src = posterUrl;
      poster.alt = `${showDetails.name} Poster`;
      posterContainer.appendChild(poster);

      // Details content
      const content = document.createElement("div");
      content.classList.add("details-content");
      content.innerHTML = `
        <p><strong>Overview:</strong><br/> ${showDetails.overview}</p>
        <strong>Genres:</strong> ${showDetails.genres
          .map((g) => g.name)
          .join(", ")}<br/>
        <strong>First Air Date:</strong> ${showDetails.first_air_date}<br/>
        <strong>Original Language:</strong> ${showDetails.original_language.toUpperCase()}<br/>
        <strong>User Rating:</strong> ${showDetails.vote_average} / 10 (${
        showDetails.vote_count
      } votes)
      `;

      // Append elements to the details container
      detailsContainer.appendChild(heading);
      detailsContainer.appendChild(posterContainer);
      detailsContainer.appendChild(content);

      // Append details below the video container
      document.getElementById("video-container").appendChild(detailsContainer);
      //beta
      const userScoreContainer = document.getElementById(
        "user-score-container"
      );
      detailsContainer.appendChild(userScoreContainer);
      //beta end
    })

    .catch((error) => {
      console.error("Error fetching TMDb details:", error);
    });
});
