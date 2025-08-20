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
    movieDiv.className = "w-[160px] lg:w-[220px] h-[221px] rounded-2xl flex flex-row justify-center";

    // Create movie poster background
    const posterUrl = movie.poster_path 
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : 'https://via.placeholder.com/220x221?text=No+Image';

    movieDiv.style.backgroundImage = `url(${posterUrl})`;
    movieDiv.style.backgroundSize = "contain";
    movieDiv.style.backgroundPosition = "center";

    // Create overlay with movie title
    const overlayDiv = document.createElement("div");
    overlayDiv.className = "bg-black/70 w-[130px] h-[74px] self-end rounded-xl my-4 text-rose-500 dark:text-white";

    // Creating the p-tag for the overlay element
    const titleP = document.createElement("p");
    titleP.className = "py-0.5 px-1 font-semibold";
    titleP.setAttribute("data-movie-title", "");
    titleP.setAttribute("data-movie-id", movie.id);
    titleP.setAttribute("data-movie-index", index);

    // Limit title to prevent overflow
    titleP.textContent = limitWords(movie.title || movie.original_title, 7);

    overlayDiv.appendChild(titleP);
    movieDiv.appendChild(overlayDiv);

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
function limitWords(text, wordLimit = 7) {
    const words = text.split(" ");
    if(words.length <= wordLimit) {
        return text;
    } else {
        return words.slice(0, wordLimit).join(" ") + "...";
    }
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


// Initialize everything when dom is loaded
document.addEventListener('DOMContentLoaded', function() {
    renderTrendingMovies();
    renderPopularMovies();
    renderDocumentaries();
    renderTvSeries();
    handleSeeMore();
    handleResize();
});