// Theme Toggle Functionality
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved user preference, if any
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  body.classList.add(savedTheme);
}

// Toggle theme on button click
if (themeToggle) { // Ensure themeToggle button exists before adding listener
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    if (body.classList.contains('light-mode')) {
      localStorage.setItem('theme', 'light-mode');
    } else {
      localStorage.setItem('theme', '');
    }
  });
} else {
    console.warn("Theme toggle button (#theme-toggle) not found.");
}

// --- Helper Functions ---

// Date Formatting Function (for display)
function formatDate(dateString) {
  if (!dateString) return 'Date not available';
  const parts = String(dateString).split('-');
  if (parts.length !== 3) return 'Invalid Date';

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
  const day = parseInt(parts[2], 10);
  const date = new Date(Date.UTC(year, month, day));

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
  return date.toLocaleDateString('en-US', options);
}

// Helper to parse date string as UTC Date object for reliable sorting
function parseDateAsUTC(dateString) {
  if (!dateString) return null;
  const parts = String(dateString).split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(Date.UTC(year, month, day));
  return isNaN(d.getTime()) ? null : d;
}

// --- Logic for "Latest Insights" on blog.html (displaying latest 3 posts) ---

// Get the container for latest posts (expected to be on blog.html)
const latestPostsContainer = document.getElementById('post-container');

// Only run this logic if the 'post-container' element exists on the current page
if (latestPostsContainer) {
  fetch('posts.json')
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status} while fetching posts.json`);
      }
      return res.json();
    })
    .then(posts => {
      // Ensure posts is an array and map to a standard structure, providing defaults
      let allFetchedPosts = Array.isArray(posts) ? posts.map(p => ({
          ...p, // Spread existing post properties
          id: p.id || `post-${Date.now()}-${Math.random()}`, // Basic fallback for ID
          title: p.title || "Untitled Post",
          summary: p.summary || "No summary available.",
          date: p.date // Keep original date string for sorting/formatting
      })) : [];

      // Sort posts by date in descending order (newest first)
      allFetchedPosts.sort((a, b) => {
        const dateA_Obj = parseDateAsUTC(a.date);
        const dateB_Obj = parseDateAsUTC(b.date);
        const timeA = dateA_Obj ? dateA_Obj.getTime() : NaN;
        const timeB = dateB_Obj ? dateB_Obj.getTime() : NaN;

        // Handle cases where dates might be invalid or missing
        if (isNaN(timeA) && isNaN(timeB)) return 0; // Both invalid, treat as equal
        if (isNaN(timeA)) return 1;  // Invalid A comes after valid B (effectively pushing it towards the end)
        if (isNaN(timeB)) return -1; // Invalid B comes after valid A
        
        return timeB - timeA; // Descending order for newest first
      });

      // Get the first 3 posts (which are now the latest)
      const postsToShow = allFetchedPosts.slice(0, 3);

      if (postsToShow.length > 0) {
        latestPostsContainer.innerHTML = ''; // Clear any static content or old posts
        postsToShow.forEach(post => {
          if (!post.date) { // A simple check, though formatDate handles it
              console.warn(`LATEST INSIGHTS: Post ID '${post.id}' (Title: '${post.title}') is missing a 'date'. It might not display correctly or affect order if many are missing dates.`);
          }
          latestPostsContainer.innerHTML += `
            <article class="post-card">
              <h2>${post.title}</h2>
              <p class="post-date">${formatDate(post.date)}</p>
              <p>${post.summary}</p>
              <a href="/post.html?id=${post.id}">Read More →</a>
            </article>
          `;
        });
      } else {
        latestPostsContainer.innerHTML = '<p>No recent posts found.</p>';
      }
    })
    .catch(error => {
      console.error('Failed to load latest posts for blog.html (post-container):', error);
      if (latestPostsContainer) { // Check again, though it should be defined if we are in this block
          latestPostsContainer.innerHTML = '<p style="color:orange;">Could not load recent posts. Please check console for errors.</p>';
      }
    });
} else {
  // This console log can be helpful to know if script.js is running on a page without 'post-container'
  // console.log("Note: 'post-container' not found on this page. Latest posts section will not be populated by script.js.");
}

// Ensure that the 'article.js' specific logic (like the DOMContentLoaded listener
// for 'all-posts-container' and 'sort-by') is NOT in this file.
// That logic should be exclusively in your 'article.js' file, which is linked only in 'articles.html'.