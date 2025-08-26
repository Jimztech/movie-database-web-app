import 'flowbite';
const API_KEY = import.meta.env.VITE_MOVIE_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Darkmode functionality from flowbite

document.addEventListener("DOMContentLoaded", function(){
    var themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    var themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    // Change the icons inside the button based on previous settings
    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        themeToggleLightIcon.classList.remove('hidden');
    } else {
        themeToggleDarkIcon.classList.remove('hidden');
    }

    var themeToggleBtn = document.getElementById('theme-toggle');

    themeToggleBtn.addEventListener('click', function() {

        // toggle icons inside button
        themeToggleDarkIcon.classList.toggle('hidden');
        themeToggleLightIcon.classList.toggle('hidden');

        // if set via local storage previously
        if (localStorage.getItem('color-theme')) {
            if (localStorage.getItem('color-theme') === 'light') {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            }

        // if NOT set via local storage previously
        } else {
            if (document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('color-theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('color-theme', 'dark');
            }
        }   
    });
});

// Function to create movie card
function createMovieCard(movie, index) {
    const movieDiv = document.createElement("div");
    movieDiv.className = "w-[160px] lg:w-[220px] h-[221px] rounded-2xl flex flex-row justify-center cursor-pointer";

    // Create movie poster background
    const posterUrl = movie.poster_path 
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : 'https://via.placeholder.com/220x221?text=No+Image';

    movieDiv.style.backgroundImage = `url(${posterUrl})`;
    movieDiv.style.backgroundSize = "contain";
    movieDiv.style.backgroundPosition = "center";

    // Create overlay with movie title
    const overlayDiv = document.createElement("div");
    overlayDiv.className = "bg-black/70 w-[130px] self-end rounded-xl my-4 text-rose-500 dark:text-white";

    // Creating the p-tag for the overlay element
    const titleP = document.createElement("p");
    titleP.className = "py-0.5 px-1 font-semibold";
    titleP.setAttribute("data-movie-title", "");
    titleP.setAttribute("data-movie-id", movie.id);
    titleP.setAttribute("data-movie-index", index);

    // Limit title to prevent overflow
    const movieTitle = movie.title || movie.original_title;
    titleP.textContent = limitWords(movieTitle, 7);

    overlayDiv.appendChild(titleP);
    movieDiv.appendChild(overlayDiv);

    // Add click event to show movie details
    movieDiv.addEventListener('click', function() {
        const movieId = movie.id;
        showMovieDetails(movieId, movieTitle);
    });

    return movieDiv;
}

// The function to get the number of movies to show based on screen size
function getMovieCount() {
     if(window.innerWidth >= 768 && window.innerWidth < 1024) {
        return 9;
    } else if(window.innerWidth >= 1024) {
        return 8;
    } else {
        return 4;
    }
}



// code for returning movie name as 7 words.
function limitWords(text, wordLimit) {
    const words = text.split(" ");
    if(words.length <= wordLimit) {
        return text;
    } else {
        return words.slice(0, wordLimit).join(" ") + "...";
    }
}


// Function to get youtube trailer
function getYouTubeTrailer(videos) {
    if(!videos || !videos.results) {
        return null;
    }

    // search for official trailer first
    const trailer = videos.results.find(video =>
        video.site === 'YouTube' &&
        (video.type === 'Trailer' || video.type === 'Teaser') &&
        video.official === true
    );

    // If no official trailer get any yt video
    if(!trailer) {
        const anyYouTubeVideo = videos.results.find(video => 
            video.site === 'Youtube'
        );
        return anyYouTubeVideo;
    }

    return trailer;
}

// Function to create cast member element
function createCastMember(castMember) {
    const castDiv = document.createElement("div");
    castDiv.className = 'flex flex-col items-center text-center min-w-[100px]';

    // Cast member photo
    const img = document.createElement("img");
    img.className = 'w-16 h-16 rounded-full object-cover mb-2';
    img.src = castMember.profile_path 
        ? `${IMAGE_BASE_URL}${castMember.profile_path}`
        : 'https://via.placeholder.com/64x64?text=No+Photo';
    img.alt = castMember.name;
    img.onerror = function () {
        this.src = 'https://via.placeholder.com/64x64?text=No+Photo';
    };

    // Cast member name
    const nameP = document.createElement("p");
    nameP.className = 'text-sm font-medium';
    nameP.textContent = castMember.name;

    // Character name
    const characterP = document.createElement("p");
    characterP.className = 'text-xs text-gray-600 dark:text-gray-400';
    characterP.textContent = castMember.character;

    castDiv.appendChild(img);
    castDiv.appendChild(nameP);
    castDiv.appendChild(characterP);

    return castDiv;
}


// Function to fetch trending movies
async function fetchTrendingMovies() {
    try {
        const response = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error("Error fetching trending movies: ", error);
        return [];
    }
}

// Function to fetch Popular movies
async function fetchPopularMovies() {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error("Error fetching popular movies: ", error);
        return [];
    }
}

// Function to fetch Documentaries
async function fetchDocumentaries() {
    try {
        const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=99`);
        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error("Error fetching documentaries: ", error);
        return[];
    }
}

// Function to fetch Tv Series
async function fetchTvSeries() {
    try {
        // ✅ Correct - added & before api_key
        const response = await fetch(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`);

        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.results;

    } catch (error) {
        console.error("Error fetching tv series: ", error);
        return[];
    }
}

// Function to fetch movie details
async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos,credits`);

        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const movieData = await response.json();
        return movieData;
    } catch (error) {
        console.error("Error fetching movie details:", error);
        return null;
    }
}


// Function to render Trending movies
async function renderTrendingMovies() {
    const trendingSection = document.getElementById("trending");

    if(!trendingSection) {
        console.error("Trending section not found");
        return;
    }

    trendingSection.innerHTML = '<div class="col-span-full text-center p-4">Loading trending movies...</div>';

    try {
        // Fetch movies
        const movies = await fetchTrendingMovies();

        if (movies.length === 0) {
            trendingSection.innerHTML = '<div class="col-span-full text-center p-4">No movies found</div>';
            return;
        }

        // Clear Loading States
        trendingSection.innerHTML = "";

        // get the number of movies to show
        const movieCount = getMovieCount();
        const moviesToShow = movies.slice(0, movieCount);

        // Create and append movie cards
        moviesToShow.forEach((movie, index) => {
            const movieCard = createMovieCard(movie, index);
            trendingSection.appendChild(movieCard);
        });

        console.log(`Rendered ${moviesToShow.length} trending movies`);

    } catch (error) {
        console.error('Error rendering movies:', error);
        trendingSection.innerHTML = '<div class="col-span-full text-center p-4 text-red-500">Error loading movies</div>';
    }
}

// Function to render Popular movies
async function renderPopularMovies() {
    const popularSection = document.getElementById("popular");

    if(!popularSection) {
        console.error("Popular section not found");
        return;
    }

    popularSection.innerHTML = '<div class="col-span-full text-center p-4">Loading popular movies...</div>';

    try {
        // Fetch movies
        const movies = await fetchPopularMovies();

        if (movies.length === 0) {
            popularSection.innerHTML = '<div class="col-span-full text-center p-4">No movies found</div>';
            return;
        }

        // Clear Loading States
        popularSection.innerHTML = "";

        // get the number of movies to show
        const movieCount = getMovieCount();
        const moviesToShow = movies.slice(0, movieCount);

        // Create and append movie cards
        moviesToShow.forEach((movie, index) => {
            const movieCard = createMovieCard(movie, index);
            popularSection.appendChild(movieCard);
        });

        console.log(`Rendered ${moviesToShow.length} popular movies`);

    } catch (error) {
        console.error('Error rendering movies:', error);
        popularSection.innerHTML = '<div class="col-span-full text-center p-4 text-red-500">Error loading movies</div>';
    }
}

async function renderDocumentaries() {
    const documentarySection = document.getElementById("documentary");

    if(!documentarySection) {
        console.error("documentary section not found");  
        return;
    }

    documentarySection.innerHTML = '<div class="col-span-full text-center p-4">Loading documentary movies...</div>';

    try {
        const movies = await fetchDocumentaries();

        if(movies.length === 0) {
            documentarySection.innerHTML = '<div class="col-span-full text-center p-4">No movies found</div>';
            return;
        }
        
        // Clear Loading States
        documentarySection.innerHTML = "";

        // get the number of movies to show
        const movieCount = getMovieCount();
        const moviesToShow = movies.slice(0, movieCount);

        // Create and append movie cards
        moviesToShow.forEach((movie, index) => {
            const movieCard = createMovieCard(movie, index);
            documentarySection.appendChild(movieCard);
        });

        console.log(`Rendered ${moviesToShow.length} documentaries`);

    } catch (error) {
        console.error('Error rendering movies:', error);
        documentarySection.innerHTML = '<div class="col-span-full text-center p-4 text-red-500">Error loading movies</div>';
    }
}

// Function to render tv series 
async function renderTvSeries() {
    const seriesSection = document.getElementById("series");

    if(!seriesSection) {
        console.error("TvSeries section not found");
        return;
    }

    seriesSection.innerHTML = '<div class="col-span-full text-center p-4">Loading Series ...</div>';

    try {
        const movies = await fetchTvSeries();

        if(movies.length === 0) {
            seriesSection.innerHTML = '<div class="col-span-full text-center p-4">No movies found</div>';
            return;
        }

        // Clear Loading States
        seriesSection.innerHTML = "";

        // get the number of movies to show
        const movieCount = getMovieCount();
        const moviesToShow = movies.slice(0, movieCount);

        // Create and append movie cards
        moviesToShow.forEach((movie, index) => {
            const movieCard = createMovieCard(movie, index);
            seriesSection.appendChild(movieCard);
        });

        console.log(`Rendered ${moviesToShow.length} series`);        
    } catch (error) {
        console.error('Error rendering movies:', error);
        seriesSection.innerHTML = '<div class="col-span-full text-center p-4 text-red-500">Error loading movies</div>';
    }
}


// function to show movie details page
async function showMovieDetails(movieId, movieTitle) {
    const detailsPage = document.getElementById("details-page");
    const movieNameEl = document.getElementById("movie-name");
    const movieDetailsEl = document.getElementById("movie-details");
    const castSection = document.getElementById("cast");
    const videoElement = document.querySelector("#details-page video");
    const mainSection = document.getElementById("main");
    const header = document.getElementById("header");
    const searchPage = document.getElementById("search-results");

    if(!detailsPage) {
        console.error('Details page element not found');
        return;
    }

    // Show details page, hide main content and search bar.
    detailsPage.classList.remove("hidden");
    mainSection.classList.add("hidden");
    header.classList.add("hidden");
    searchPage.classList.add("hidden");

    // Show loading state
    movieNameEl.textContent = movieTitle || "Loading...";
    movieDetailsEl.textContent = "Loading movie details";
    castSection.innerHTML = '<p class="text-center p-4">Loading cast...</p>';

    try {
        // Fetch movie details
        const movieData = await fetchMovieDetails(movieId);

        if(!movieData) {
            movieDetailsEl.textContent = "Error Loading Movie details...";
            return;
        }

        // Update movie name
        movieNameEl.textContent = movieData.title || movieData.original_title;

        // Update movie details (limit ~300 words)
        const overview = movieData.overview || "No description available.";
        movieDetailsEl.textContent = limitWords(overview, 50);

        // Handle movie trailer
        const trailer = getYouTubeTrailer(movieData.videos);

        if(trailer) {
            // Replace video element with Youtube iframe
            const iframe = document.createElement('iframe');
            iframe.className = "w-full h-64 md:h-80 lg:h-96";
            iframe.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=0&controls=1`;
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('frameborder', '0');
            iframe.title = `${movieData.title} Trailer`;

            // Replace video element with iframe
            videoElement.parentNode.replaceChild(iframe, videoElement)
        } else {
            // Hide video section if no trailer available
            videoElement.style.display = "none";

            // Show placeholder
            const placeholder = document.createElement('div');
            placeholder.className = 'w-full h-64 bg-gray-200 dark:bg-gray-800 flex items-center justify-center rounded-lg mb-4';
            placeholder.innerHTML = '<p class="text-gray-500">No trailer available</p>';
            videoElement.parentNode.insertBefore(placeholder, videoElement);
        }

        // Update cast
        if(movieData.credits && movieData.credits.cast) {
            const cast = movieData.credits.cast.slice(0, 10);
            castSection.innerHTML = "";

            // Create cast container
            const castContainer = document.createElement("div");
            castContainer.className = "";

            const castTitle = document.createElement("h3");
            castTitle.className = 'text-2xl px-[1rem] font-bold mb-4';
            castTitle.textContent = "Cast";

            const castGrid = document.createElement("div");
            castGrid.className = 'grid grid-cols-3 md:grid-cols-5 gap-4 pb-4';

            cast.forEach(castMember => {
                const castElement = createCastMember(castMember);
                castGrid.appendChild(castElement);
            });

            castContainer.appendChild(castTitle);
            castContainer.appendChild(castGrid);
            castSection.appendChild(castContainer);
        } else {
            castSection.innerHTML = '<p class="text-center p-4 text-gray-500">No cast information available</p>';
        }

    } catch (error) {
        console.error("Error displaying movie details: ", error);
        movieDetailsEl.textContent = "Error loading movie details.";
        castSection.innerHTML = '<p class="text-center p-4 text-red-500">Error loading cast information</p>';
    }
} 


// Function to handle responsive sizes
function handleResize() {
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            const currentMovieCount = document.querySelectorAll('#trending > div').length;
            const newMovieCount = getMovieCount();

            // Only re-render if movie count should change
            if (currentMovieCount != newMovieCount) {
                renderTrendingMovies();
                renderPopularMovies();
                renderTvSeries();
            }
        }, 250)
    });
}


// function to add back button to details page
function addBackButton() {
    const detailsPage = document.getElementById("details-page");

    if(detailsPage && !detailsPage.querySelector('.back-button')) {
        const backButton = document.createElement('button');
        backButton.className = 'back-button bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mb-4 mt-2 mx-2 transition-colors duration-300';
        backButton.textContent = '← Back to Movies';
        
        backButton.addEventListener('click', function() {
            window.location.reload();
        });
        
        // Insert back button at the beginning of details page
        detailsPage.insertBefore(backButton, detailsPage.firstChild);
    }
}


// Search results page
const searchPage = document.getElementById("search-results");
searchPage.classList.add("hidden");

// Implementing the search functionality
async function searchMovies(query) {
    try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`);

        if(!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // limiting movies result to 20 movies only
        return data.results.slice(0, 20);
    } catch (error) {
        console.error('Error searching movies:', error);
        return [];
    }
}


// Display search results
function displaySearchResults(movies, query) {
    const searchResultsGrid = document.querySelector('#search-results .grid');
    const searchResultsSection = document.getElementById("search-results");
    const searchResultsText = document.querySelector("#search-results p");

    // clear previous results
    searchResultsGrid.innerHTML = "";

    // Update the search results text
    searchResultsText.textContent = `Search Results for "${query}" (${movies.length} results)`;

    if(movies.length === 0) {
        searchResultsGrid.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-500 dark:text-gray-400 text-lg">No movies found for "${query}"</p>
                <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">Try searching with different keywords</p>
            </div>
        `;
        return;
    }

    // Display movie cards
    movies.forEach((movie, index) => {
        const movieCard = createMovieCard(movie, index);
        searchResultsGrid.appendChild(movieCard);
    });

    // show search results section
    searchResultsSection.classList.remove("hidden");
}

// Handle search form submission
function handleSearch(event) {
    event.preventDefault();

    const searchInput = document.getElementById("default-search");
    const query = searchInput.value.trim();

    if(query === "") {
        alert("Please enter a search term");
        return;
    }

    // Hide other sections and show loading states
    hideOtherSections();
    showLoadingState();

    // Perform search
    searchMovies(query)
        .then(movies => {
            hideLoadingState();
            displaySearchResults(movies, query);
        })
        .catch(error => {
            hideLoadingState();
            console.error('Search failed:', error);
            showErrorState(query);
        });
}


// Hide other sections when showing search results
function hideOtherSections() {
    const mainSection = document.getElementById("main");
    const trendingSection = document.getElementById("trending-page");
    const popularSection = document.getElementById("popular-page");
    const documentarySection = document.getElementById("documentary-page");
    const serieSection = document.getElementById("series-page");
    const logo = document.getElementById("header-logo");
    const headerItems = document.getElementById("header-toggle");
    const header = document.getElementById("header");

    const sectionsToHide = [
        mainSection,
        trendingSection,
        popularSection,
        documentarySection,
        serieSection,
        header
    ]

    sectionsToHide.forEach(element => {
        if(element) {
            element.classList.add("hidden");
        }
    });
}

// Show loading state
function showLoadingState() {
    const searchResultsGrid = document.querySelector('#search-results .grid');
    const searchResultsSection = document.getElementById("search-results");
    const searchResultsText = document.querySelector("#search-results p");

    searchResultsText.textContent = 'Searching...';
    searchResultsGrid.innerHTML = `
        <div class="col-span-full text-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p class="text-gray-500 dark:text-gray-400 mt-4">Searching for movies...</p>
        </div>
    `;

    searchResultsSection.classList.remove("hidden");
}

// Hide loading state
function hideLoadingState() {
    // Loading state will be replaced by search results or error state
}


// Show error state
function showErrorState(query) {
    const searchResultsGrid = document.querySelector('#search-results .grid');
    const searchResultsText = document.querySelector('#search-results p');

    searchResultsText.textContent = `Search Error`;
    searchResultsGrid.innerHTML = `
        <div class="col-span-full text-center py-8">
            <p class="text-red-500 text-lg">Failed to search for "${query}"</p>
            <p class="text-gray-400 dark:text-gray-500 text-sm mt-2">Please check your internet connection and try again</p>
        </div>
    `;
}

// Handle back button from search results
function handleBackFromSearch() {
    const searchResultsSection = document.getElementById('search-results');
    const searchInput = document.getElementById('default-search');
    const mainSection = document.getElementById("main");

    // Hide search results
    searchResultsSection.classList.add('hidden');
    
    // Clear search input
    searchInput.value = '';

    // mainSection.classList.remove("hidden");
    window.location.reload();
}

// function to show other sections
function showOtherSections() {
    const sectionsToShow = [
        mainSection,
        trendingSection,
        popularSection,
        documentarySection,
        serieSection
    ];

    sectionsToShow.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.remove('hidden');
        }
    });
}


// Initialize everything when dom is loaded
document.addEventListener('DOMContentLoaded', function() {
    renderTrendingMovies();
    renderPopularMovies();
    renderDocumentaries();
    renderTvSeries();
    handleResize();
    addBackButton();

    // Add event listener to search form
    const searchForm = document.querySelector('#search-bar form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }
    
    // Add event listener to back button in search results
    const backButton = document.getElementById('search-back-button');
    if (backButton) {
        backButton.addEventListener('click', handleBackFromSearch);
    }
});