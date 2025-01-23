document.addEventListener("DOMContentLoaded", function () {
  // Get the search query from the URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get("query");

  // Display the search term in the header if available
  if (searchTerm) {
    document.getElementById(
      "search-query"
    ).textContent = `Results for: "${searchTerm}"`;
    document.getElementById("search-input").value = searchTerm;
    fetchAndFilterData(searchTerm); // Fetch data based on the search term
  } else {
    document.getElementById("search-query").textContent =
      "No search term provided.";
  }
});

// Function to fetch image and IMDb ID from TMDb
async function fetchTMDBDetails(seriesName) {
  const TMDB_API_KEY = "8baba8ab6b8bbe247645bcae7df63d0d"; // Replace with your TMDb API key
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";
  try {
    const searchResponse = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        seriesName
      )}`
    );
    const searchData = await searchResponse.json();

    if (searchData.results && searchData.results.length > 0) {
      const show = searchData.results[0];
      const tvId = show.id;

      // Fetch external IDs for IMDb ID
      const externalIdsResponse = await fetch(
        `${TMDB_BASE_URL}/tv/${tvId}/external_ids?api_key=${TMDB_API_KEY}`
      );
      const externalIdsData = await externalIdsResponse.json();

      return {
        imageUrl: `https://image.tmdb.org/t/p/w500${show.poster_path}`,
        imdbId: externalIdsData.imdb_id || null, // Fetch IMDb ID
      };
    }

    return { imageUrl: "https://via.placeholder.com/300x450", imdbId: null };
  } catch (error) {
    console.error("Error fetching TMDb data:", error);
    return { imageUrl: "https://via.placeholder.com/300x450", imdbId: null };
  }
}

// Function to fetch ratings from OMDb
async function fetchOMDbRatings(imdbId) {
  const OMDB_API_KEY = "ffa68ccd"; // Replace with your OMDb API key
  if (!imdbId) return { imdbRating: "N/A", rtRating: "N/A" };
  try {
    const response = await fetch(
      `https://www.omdbapi.com/?i=${imdbId}&apikey=${OMDB_API_KEY}`
    );
    const data = await response.json();
    const imdbRating = data.imdbRating || "N/A";
    const rtRating =
      (data.Ratings &&
        data.Ratings.find((rating) => rating.Source === "Rotten Tomatoes")
          ?.Value) ||
      "N/A";
    return { imdbRating, rtRating };
  } catch (error) {
    console.error("Error fetching OMDb data:", error);
    return { imdbRating: "N/A", rtRating: "N/A" };
  }
}

// Function to fetch and filter data from data.json
async function fetchAndFilterData(searchTerm) {
  const dataUrl = "data.json"; // Path to your JSON data

  try {
    const response = await fetch(dataUrl);
    const episodes = await response.json();

    // Filter the episodes based on the search term
    const filteredEpisodes = episodes.filter((episode) => {
      return (
        episode.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        episode.season.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    const resultsContainer = document.getElementById("results-container");
    resultsContainer.innerHTML = ""; // Clear previous results

    if (filteredEpisodes.length === 0) {
      resultsContainer.innerHTML = `
        <div class="no-results">
          <p class="no-results-text">No results found for ${searchTerm}</p>  
          <img 
            src="not_found.png" 
            alt="No results found" 
            class="no-results-image"
          >
        </div>
      `;
      return;
    }
    // Add results count message
    const resultsCount = document.createElement("div");
    resultsCount.classList.add("text-center", "w-100", "mb-4");
    resultsCount.innerHTML = `<p class="h5">There are ${
      filteredEpisodes.length
    } result${filteredEpisodes.length === 1 ? "" : "s"} match</p>`;
    resultsContainer.appendChild(resultsCount);

    // Cache for storing TMDb and OMDb data to avoid duplicate API calls
    const tmdbCache = new Map();
    const omdbCache = new Map();

    // Loop through the filtered episodes and display them
    for (const episode of filteredEpisodes) {
      const card = document.createElement("div");
      card.classList.add("col-md-4", "mb-4");

      const seriesName = episode.name.split("-")[0].trim();

      // Fetch TMDb details (poster and IMDb ID)
      let tmdbDetails;
      if (tmdbCache.has(seriesName)) {
        tmdbDetails = tmdbCache.get(seriesName);
      } else {
        tmdbDetails = await fetchTMDBDetails(seriesName);
        tmdbCache.set(seriesName, tmdbDetails);
      }

      // Fetch OMDb ratings (IMDb and Rotten Tomatoes)
      let omdbRatings;
      if (omdbCache.has(tmdbDetails.imdbId)) {
        omdbRatings = omdbCache.get(tmdbDetails.imdbId);
      } else {
        omdbRatings = await fetchOMDbRatings(tmdbDetails.imdbId);
        omdbCache.set(tmdbDetails.imdbId, omdbRatings);
      }

      // Create card content
      const safeTitle = episode.title.replace(/'/g, "\\'");
      const safeName = episode.name.replace(/'/g, "\\'");
      const safeSeason = episode.season.replace(/'/g, "\\'");
      const safeVideoUrl = episode.video_url.replace(/'/g, "\\'");

      card.innerHTML = `
      <div class="results-container">
        <div class="card">
          <img 
            src="${tmdbDetails.imageUrl}" 
            class="card-img-top" 
            alt="${safeTitle}" 
            onerror="this.src='https://via.placeholder.com/300x450'"
            style="height: 300px; object-fit: cover;"
          >
          <div class="card-body">
            <h5 class="card-title">${episode.title}</h5>
            <p class="card-text">${episode.name} - ${episode.season}</p>
            <p class="card-text">
              <strong><img src="imdb_logo.svg" alt="IMDb Logo" style="width: 30px; height: 20px; margin-right: 5px;"> </strong> ${omdbRatings.imdbRating}
            </p>
            <p class="card-text">
              <strong><img src="rt_logo.svg" alt="Rotten Tomatoes Logo" style="width: 20px; height: 20px; margin-right: 15px;"> </strong> ${omdbRatings.rtRating}
            </p>
            <button class="btn btn-primary" onclick="storeDataAndRedirect('${safeName}', '${safeSeason}', '${safeTitle}', '${safeVideoUrl}')"><i class="fa-solid fa-play"></i> View</button>
          </div>
        </div>
      </div>
      `;

      resultsContainer.appendChild(card);
    }
  } catch (error) {
    console.error("Error loading episode data:", error);
    const resultsContainer = document.getElementById("results-container");
    resultsContainer.innerHTML = "<p>Error loading results.</p>";
  }
}

// Store data in localStorage and redirect to watch.html
function storeDataAndRedirect(name, season, title, video_url) {
  localStorage.setItem(
    "episodeData",
    JSON.stringify({ name, season, title, video_url })
  );
  window.location.href = "watch.html";
}
