// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Get the button and gallery elements
const getImagesBtn = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// Your NASA API key
const apiKey = 'RXBq0zQEtbaX0ELRLr5Y2p9Qbt5fSUGIZwcQer39';

// Store last fetched data for filtering
let lastFetchedData = [];

// Media filter logic
const mediaFilter = document.querySelector('.media-filter');
if (mediaFilter) {
  mediaFilter.addEventListener('change', () => {
    renderGallery(lastFetchedData);
  });
}

// Helper to get selected media type
function getSelectedMediaType() {
  const checked = document.querySelector('input[name="mediaType"]:checked');
  return checked ? checked.value : 'all';
}

// Render gallery based on filter
function renderGallery(data) {
  const mediaType = getSelectedMediaType();
  gallery.innerHTML = '';
  data.forEach(item => {
    if (
      mediaType === 'all' ||
      (mediaType === 'image' && item.media_type === 'image') ||
      (mediaType === 'video' && item.media_type === 'video')
    ) {
      if (item.media_type === 'image') {
        // Create a container for each image
        const imgDiv = document.createElement('div');
        imgDiv.className = 'apod-item';

        // Create the image element
        const img = document.createElement('img');
        img.src = item.url;
        img.alt = item.title;

        // Add the image to the container
        imgDiv.appendChild(img);

        // Add the container to the gallery
        gallery.appendChild(imgDiv);

        // Add click event to open modal with larger image and details
        imgDiv.addEventListener('click', () => {
          openModal(item);
        });
      } else if (item.media_type === 'video') {
        // Handle video entries
        const videoDiv = document.createElement('div');
        videoDiv.className = 'apod-item';

        // Try to embed YouTube videos, otherwise show a link
        let isYouTube = item.url.includes('youtube.com') || item.url.includes('youtu.be');
        if (isYouTube) {
          // Create an iframe for YouTube
          const iframe = document.createElement('iframe');
          iframe.src = item.url.replace('watch?v=', 'embed/');
          iframe.width = '100%';
          iframe.height = '220';
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          iframe.allowFullscreen = true;
          iframe.style.borderRadius = '6px';
          iframe.title = item.title;
          videoDiv.appendChild(iframe);
        } else {
          // For non-YouTube videos, show a link
          const link = document.createElement('a');
          link.href = item.url;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = 'Watch Video';
          link.style.display = 'inline-block';
          link.style.margin = '80px 0';
          link.style.fontWeight = 'bold';
          link.style.color = '#0b3d91';
          videoDiv.appendChild(link);
        }

        // Add the container to the gallery
        gallery.appendChild(videoDiv);

        // Add click event to open modal with video details
        videoDiv.addEventListener('click', (e) => {
          // Prevent opening modal when clicking the video link or iframe
          if (e.target.tagName === 'A' || e.target.tagName === 'IFRAME') return;
          openModal(item);
        });
      }
    }
  });
}

// Function to fetch and display APOD images
getImagesBtn.addEventListener('click', () => {
  // Get the selected start and end dates
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Build the API URL using template literals
  const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

  // Show loading message before fetching
  gallery.innerHTML = '<div class="placeholder"><div class="placeholder-icon">🔄</div><p>Loading space photos…</p></div>';

  // Fetch data from NASA's APOD API
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      lastFetchedData = data;
      renderGallery(data);
    })
    .catch(error => {
      // Show an error message if something goes wrong
      gallery.innerHTML = `<p style="color:red;">Error fetching data: ${error.message}</p>`;
    });
});

// Modal creation and logic
// Create modal elements only once
let modal = document.getElementById('apod-modal');
if (!modal) {
  modal = document.createElement('div');
  modal.id = 'apod-modal';
  modal.style.display = 'none';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.8)';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '1000';
  modal.innerHTML = `
    <div id="modal-content" style="background: #fff; padding: 20px; border-radius: 8px; max-width: 90vw; max-height: 90vh; overflow: auto; position: relative; text-align: center;">
      <span id="modal-close" style="position: absolute; top: 10px; right: 20px; font-size: 2rem; cursor: pointer;">&times;</span>
      <img id="modal-img" src="" alt="" style="max-width: 80vw; max-height: 60vh; margin-bottom: 20px;" />
      <h2 id="modal-title"></h2>
      <p id="modal-explanation" style="text-align: left;"></p>
    </div>
  `;
  document.body.appendChild(modal);
}

// Function to open the modal with image details
function openModal(item) {
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalExplanation = document.getElementById('modal-explanation');
  // Remove any previous video iframe
  if (modalImg.nextSibling && modalImg.nextSibling.tagName === 'IFRAME') {
    modalImg.nextSibling.remove();
  }

  if (item.media_type === 'image') {
    modalImg.style.display = '';
    modalImg.src = item.hdurl || item.url;
    modalImg.alt = item.title;
  } else if (item.media_type === 'video') {
    modalImg.style.display = 'none';
    // Embed YouTube video if possible, else show a link
    let isYouTube = item.url.includes('youtube.com') || item.url.includes('youtu.be');
    if (isYouTube) {
      const iframe = document.createElement('iframe');
      iframe.src = item.url.replace('watch?v=', 'embed/');
      iframe.width = '90%';
      iframe.height = '350';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.style.borderRadius = '8px';
      iframe.style.marginBottom = '18px';
      iframe.title = item.title;
      modalImg.parentNode.insertBefore(iframe, modalImg.nextSibling);
    } else {
      const link = document.createElement('a');
      link.href = item.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Watch Video';
      link.style.display = 'block';
      link.style.fontWeight = 'bold';
      link.style.color = '#0b3d91';
      link.style.margin = '18px 0';
      modalImg.parentNode.insertBefore(link, modalImg.nextSibling);
    }
  }
  modalTitle.textContent = `${item.title} (${item.date})`;
  modalExplanation.textContent = item.explanation;
  modal.style.display = 'flex';
}

// Close modal when clicking the close button or outside the modal content
modal.addEventListener('click', function(event) {
  if (event.target === modal || event.target.id === 'modal-close') {
    modal.style.display = 'none';
  }
});

// Fun space facts array
const spaceFacts = [
  "Did you know? A day on Venus is longer than a year on Venus!",
  "Did you know? Neutron stars can spin at a rate of 600 rotations per second!",
  "Did you know? One million Earths could fit inside the Sun!",
  "Did you know? There are more trees on Earth than stars in the Milky Way!",
  "Did you know? The footprints on the Moon will be there for millions of years.",
  "Did you know? Jupiter has 95 known moons!",
  "Did you know? Space is completely silent—there’s no air for sound to travel.",
  "Did you know? The hottest planet in our solar system is Venus.",
  "Did you know? The International Space Station travels at 28,000 km/h!",
  "Did you know? Saturn could float in water because it’s mostly gas!"
];

// Pick a random fact and display it
const factSection = document.getElementById('space-fact');
const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
factSection.textContent = randomFact;
