// Movie Details System
const API_KEY = import.meta.env.VITE_MOVIE_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Function to limit text to specific word count
function limitWords(text, wordLimit) {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length <= wordLimit) {
        return text;
    }
    return words.slice(0, wordLimit).join(' ') + '...';
}

// Function to fetch movie details
async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos,credits`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const movieData = await response.json();
        return movieData;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
}

// Function to get YouTube trailer
function getYouTubeTrailer(videos) {
    if (!videos || !videos.results) return null;
    
    // Look for official trailer first
    const trailer = videos.results.find(video => 
        video.site === 'YouTube' && 
        (video.type === 'Trailer' || video.type === 'Teaser') &&
        video.official === true
    );
    
    // If no official trailer, get any YouTube video
    if (!trailer) {
        const anyYouTubeVideo = videos.results.find(video => video.site === 'YouTube');
        return anyYouTubeVideo;
    }
    
    return trailer;
}

// Function to create cast member element
function createCastMember(castMember) {
    const castDiv = document.createElement('div');
    castDiv.className = 'flex flex-col items-center text-center min-w-[100px]';
    
    // Cast member photo
    const img = document.createElement('img');
    img.className = 'w-16 h-16 rounded-full object-cover mb-2';
    img.src = castMember.profile_path 
        ? `${IMAGE_BASE_URL}${castMember.profile_path}`
        : 'https://via.placeholder.com/64x64?text=No+Photo';
    img.alt = castMember.name;
    img.onerror = function() {
        this.src = 'https://via.placeholder.com/64x64?text=No+Photo';
    };
    
    // Cast member name
    const nameP = document.createElement('p');
    nameP.className = 'text-sm font-medium';
    nameP.textContent = castMember.name;
    
    // Character name
    const characterP = document.createElement('p');
    characterP.className = 'text-xs text-gray-600 dark:text-gray-400';
    characterP.textContent = castMember.character;
    
    castDiv.appendChild(img);
    castDiv.appendChild(nameP);
    castDiv.appendChild(characterP);
    
    return castDiv;
}

// Function to show movie details page
async function showMovieDetails(movieId, movieTitle) {
    const detailsPage = document.getElementById('details-page');
    const movieNameEl = document.getElementById('movie-name');
    const movieDetailsEl = document.getElementById('movie-details');
    const castSection = document.getElementById('cast');
    const videoElement = document.querySelector('#details-page video');
    
    if (!detailsPage) {
        console.error('Details page element not found');
        return;
    }
    
    // Show details page and hide main content
    detailsPage.classList.remove('hidden');
    document.querySelector('main')?.classList.add('hidden'); // Hide main content if exists
    
    // Show loading state
    movieNameEl.textContent = movieTitle || 'Loading...';
    movieDetailsEl.textContent = 'Loading movie details...';
    castSection.innerHTML = '<p class="text-center p-4">Loading cast...</p>';
    
    try {
        // Fetch movie details
        const movieData = await fetchMovieDetails(movieId);
        
        if (!movieData) {
            movieDetailsEl.textContent = 'Error loading movie details.';
            return;
        }
        
        // Update movie name
        movieNameEl.textContent = movieData.title || movieData.original_title;
        
        // Update movie details (limit to ~300 words)
        const overview = movieData.overview || 'No description available.';
        movieDetailsEl.textContent = limitWords(overview, 50); // Roughly 300 words
        
        // Handle video trailer
        const trailer = getYouTubeTrailer(movieData.videos);
        
        if (trailer) {
            // Replace video element with YouTube iframe
            const iframe = document.createElement('iframe');
            iframe.className = 'w-full h-64 md:h-80 lg:h-96';
            iframe.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=0&controls=1`;
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('frameborder', '0');
            iframe.title = `${movieData.title} Trailer`;
            
            // Replace video element with iframe
            videoElement.parentNode.replaceChild(iframe, videoElement);
        } else {
            // Hide video section if no trailer available
            videoElement.style.display = 'none';
            
            // Show placeholder
            const placeholder = document.createElement('div');
            placeholder.className = 'w-full h-64 bg-gray-200 dark:bg-gray-800 flex items-center justify-center rounded-lg mb-4';
            placeholder.innerHTML = '<p class="text-gray-500">No trailer available</p>';
            videoElement.parentNode.insertBefore(placeholder, videoElement);
        }
        
        // Update cast
        if (movieData.credits && movieData.credits.cast) {
            const cast = movieData.credits.cast.slice(0, 10); // Show first 10 cast members
            castSection.innerHTML = '';
            
            // Create cast container
            const castContainer = document.createElement('div');
            castContainer.className = 'overflow-x-auto';
            
            const castTitle = document.createElement('h3');
            castTitle.className = 'text-lg font-bold mb-4';
            castTitle.textContent = 'Cast';
            
            const castGrid = document.createElement('div');
            castGrid.className = 'flex gap-4 pb-4';
            
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
        console.error('Error displaying movie details:', error);
        movieDetailsEl.textContent = 'Error loading movie details.';
        castSection.innerHTML = '<p class="text-center p-4 text-red-500">Error loading cast information</p>';
    }
}

// Function to hide movie details page
function hideMovieDetails() {
    const detailsPage = document.getElementById('details-page');
    const mainContent = document.querySelector('main');
    
    if (detailsPage) {
        detailsPage.classList.add('hidden');
    }
    
    if (mainContent) {
        mainContent.classList.remove('hidden');
    }
}

// Updated function to create movie card with click handler
function createMovieCard(movie, index) {
    const movieDiv = document.createElement("div");
    movieDiv.className = "w-[160px] lg:w-[220px] h-[221px] rounded-2xl flex flex-row justify-center cursor-pointer hover:scale-105 transition-transform duration-300";

    // Create movie poster background
    const posterUrl = movie.poster_path 
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : 'https://via.placeholder.com/220x221?text=No+Image';

    movieDiv.style.backgroundImage = `url(${posterUrl})`;
    movieDiv.style.backgroundSize = "cover";
    movieDiv.style.backgroundPosition = "center";

    // Create overlay with movie title
    const overlayDiv = document.createElement("div");
    overlayDiv.className = "bg-black/70 w-[130px] self-end rounded-xl my-4 text-white";

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

// Function to add back button to details page
function addBackButton() {
    const detailsPage = document.getElementById('details-page');
    
    if (detailsPage && !detailsPage.querySelector('.back-button')) {
        const backButton = document.createElement('button');
        backButton.className = 'back-button bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg mb-4 transition-colors duration-300';
        backButton.textContent = '← Back to Movies';
        
        backButton.addEventListener('click', hideMovieDetails);
        
        // Insert back button at the beginning of details page
        detailsPage.insertBefore(backButton, detailsPage.firstChild);
    }
}

// Initialize back button when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    addBackButton();
});

// Export functions for use in other files
export { 
    showMovieDetails, 
    hideMovieDetails, 
    createMovieCard, 
    fetchMovieDetails 
};