document.addEventListener("DOMContentLoaded", function () {
  const dataUrl = "data.json";
  const tmdbApiKey = "f6062ea8b0d90fa9ad309cfdd78b9875";
  const tmdbBaseUrl = "https://api.themoviedb.org/3";

  const episodesContainer = document.getElementById("episodes-container");
  const paginationContainer = document.getElementById("pagination");

  const ITEMS_PER_PAGE = 6;
  const MAX_VISIBLE_PAGES = 5;
  let currentPage = 1;
  let episodes = [];

  // TMDb cache to store fetched data
  const tmdbCache = {};

  // Fetch and initial setup remain the same
  fetch(dataUrl)
    .then((response) => response.json())
    .then((data) => {
      episodes = data;
      renderPage();
    })
    .catch((error) => {
      console.error("Error loading episode data:", error);
    });

  // Render page with episodes and pagination
  function renderPage() {
    episodesContainer.innerHTML = "";

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginatedEpisodes = episodes.slice(start, end);

    paginatedEpisodes.forEach((episode) => {
      const card = document.createElement("div");
      card.classList.add("col-md-4", "mb-4");

      // Check if TMDb data is already cached
      if (tmdbCache[episode.name]) {
        renderCard(card, episode, tmdbCache[episode.name]);
      } else {
        // If not in cache, fetch from API and cache the result
        fetch(
          `${tmdbBaseUrl}/search/tv?api_key=${tmdbApiKey}&query=${encodeURIComponent(
            episode.name
          )}`
        )
          .then((response) => response.json())
          .then((data) => {
            const show = data.results && data.results[0];
            const imageUrl =
              show && show.poster_path
                ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                : "no_image.png"; // Use fallback image if no poster_path

            // Cache the data
            tmdbCache[episode.name] = { show, imageUrl };

            renderCard(card, episode, { show, imageUrl });
          })
          .catch((error) => {
            console.error("Error fetching image:", error);
            // Render card with fallback image if API fails
            renderCard(card, episode, { show: null, imageUrl: "no_image.png" });
          });
      }

      episodesContainer.appendChild(card);
    });

    renderPagination();
  }

  // Render individual card
  function renderCard(card, episode, tmdbData) {
    const { imageUrl } = tmdbData;
    card.innerHTML = `
      <div class="card">
        <img src="${imageUrl}" class="card-img-top" alt="${episode.title}">
        <div class="card-body">
          <h5 class="card-title">${episode.name} - ${episode.season}</h5>
          <p class="card-text">${episode.title}</p>
          <a href="watch.html" class="btn btn-primary"><i class="fa-solid fa-play"></i> View</a>
        </div>
      </div>
    `;

    card.addEventListener("click", function () {
      localStorage.setItem("episodeData", JSON.stringify(episode));
      window.location.href = "watch.html";
    });
  }

  // Render pagination (unchanged)
  function renderPagination() {
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(episodes.length / ITEMS_PER_PAGE);

    function createPageButton(
      number,
      text = number,
      isActive = false,
      isDisabled = false
    ) {
      const li = document.createElement("li");
      li.classList.add("page-item");
      if (isActive) li.classList.add("active");
      if (isDisabled) li.classList.add("disabled");
      li.innerHTML = `<a class="page-link" href="#">${text}</a>`;
      if (text === "Next")
        li.querySelector(".page-link").classList.add("next-button");
      if (text === "Previous")
        li.querySelector(".page-link").classList.add("previous-button");
      if (!isDisabled) {
        li.addEventListener("click", (e) => {
          e.preventDefault();
          if (text === "First") {
            currentPage = 1;
          } else if (text === "Last") {
            currentPage = totalPages;
          } else if (text === "Previous") {
            currentPage--;
          } else if (text === "Next") {
            currentPage++;
          } else {
            currentPage = number;
          }
          renderPage();
        });
      }
      return li;
    }

    if (currentPage === 1) {
      for (let i = 1; i <= Math.min(MAX_VISIBLE_PAGES, totalPages); i++) {
        paginationContainer.appendChild(
          createPageButton(i, i, currentPage === i)
        );
      }
      if (totalPages > MAX_VISIBLE_PAGES) {
        paginationContainer.appendChild(createPageButton(totalPages, "Last"));
      }
    } else if (currentPage === totalPages) {
      paginationContainer.appendChild(
        createPageButton(currentPage - 1, "Previous")
      );
      paginationContainer.appendChild(createPageButton(1, "...", false, true));
      const startPage = Math.max(totalPages - 2, 1);
      for (let i = startPage; i <= totalPages; i++) {
        paginationContainer.appendChild(
          createPageButton(i, i, currentPage === i)
        );
      }
      paginationContainer.appendChild(createPageButton(1, "First"));
    } else {
      paginationContainer.appendChild(
        createPageButton(currentPage - 1, "Previous")
      );
      const startPage = Math.max(currentPage - 2, 1);
      const endPage = Math.min(startPage + 4, totalPages);
      for (let i = startPage; i <= endPage; i++) {
        paginationContainer.appendChild(
          createPageButton(i, i, currentPage === i)
        );
      }
      paginationContainer.appendChild(
        createPageButton(currentPage + 1, "Next")
      );
    }
  }
});
