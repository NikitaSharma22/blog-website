/**
 * articles.js
 *
 * Handles fetching, displaying, and sorting of all articles
 * on the articles.html page.
 */
document.addEventListener('DOMContentLoaded', () => {
  const postsContainer = document.getElementById('all-posts-container');
  const sortSelect = document.getElementById('sort-by');
  let allPosts = []; // To store the initially fetched posts

  // Check if essential HTML elements are present
  if (!postsContainer) {
    console.error('CRITICAL ERROR: The posts container (#all-posts-container) was not found in the HTML.');
    // Optionally display an error message to the user if the container is missing
    // document.body.innerHTML = '<p style="color:red; text-align:center; margin-top: 50px;">Page content cannot be loaded: Missing essential container.</p>';
    return;
  }
  if (!sortSelect) {
    console.error('CRITICAL ERROR: The sort select dropdown (#sort-by) was not found in the HTML.');
    // Fallback: attempt to load posts without sorting UI if container exists
    if (postsContainer) postsContainer.innerHTML = "<p>Sorting functionality is unavailable. Loading posts with default order...</p>";
    // Or, simply return if sorting is deemed essential. For now, we'll proceed to fetch if container exists.
  }

  /**
   * Renders the provided list of posts into the postsContainer.
   * @param {Array} postsToRender - An array of post objects to display.
   */
  function renderPosts(postsToRender) {
    postsContainer.innerHTML = ''; // Clear previous posts or "Loading..." message

    if (!postsToRender || postsToRender.length === 0) {
      postsContainer.innerHTML = '<p>No articles found matching your criteria.</p>';
      return;
    }

    postsToRender.forEach(post => {
      const postCard = document.createElement('article');
      postCard.classList.add('post-card');

      let summaryText = 'No summary available.';
      if (post.summary) {
        summaryText = post.summary;
      } else if (post.content) {
        // Fallback: Create a basic text summary from content if post.summary is missing
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = post.content; // Render HTML to help strip tags
        const textContent = tempDiv.textContent || tempDiv.innerText || "";
        summaryText = textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
        if (!post.summary) { // Log only if summary was indeed missing
          // console.log(`INFO: Post ID '${post.id}' is missing a 'summary'. Generated from content.`);
        }
      }

      postCard.innerHTML = `
        <h2>${post.title || 'Untitled Post'}</h2>
        <p>${summaryText}</p>
        <a href="/post.html?id=${post.id}">Read More →</a>
      `;
      postsContainer.appendChild(postCard);
    });
  }

  /**
   * Sorts the global 'allPosts' array based on the selected criteria
   * and then calls renderPosts to update the UI.
   */
  function sortAndRenderPosts() {
    if (!sortSelect && allPosts.length > 0) { // Handle case where sortSelect might be missing but we still want to render
        console.log('Sort select not found, rendering posts in fetched order or default sort if implemented without UI.');
        // Optionally apply a hardcoded default sort here if allPosts are available
        // e.g., allPosts.sort((a,b) => new Date(b.date) - new Date(a.date));
        renderPosts(allPosts);
        return;
    }
    if (!sortSelect) { // If sortSelect is missing and no posts yet, just return.
        return;
    }


    const sortBy = sortSelect.value;
    console.log('Sort criteria selected:', sortBy);
    let sortedPosts = [...allPosts]; // Create a shallow copy to sort

    // Detailed logging for dates before sorting attempt (optional, can be noisy)
    // console.log('Posts before sorting (raw dates):', sortedPosts.map(p => ({ title: p.title, date: p.date })));

    switch (sortBy) {
      case 'date-desc': // Newest first
        sortedPosts.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          // Handle invalid dates: push them to the end when sorting descending
          const timeA = dateA.getTime();
          const timeB = dateB.getTime();
          if (isNaN(timeA) && isNaN(timeB)) return 0;
          if (isNaN(timeA)) return 1;  // a is invalid, sorted after b
          if (isNaN(timeB)) return -1; // b is invalid, sorted after a
          return timeB - timeA;
        });
        break;
      case 'date-asc': // Oldest first
        sortedPosts.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          const timeA = dateA.getTime();
          const timeB = dateB.getTime();
          // Handle invalid dates: push them to the end when sorting ascending
          if (isNaN(timeA) && isNaN(timeB)) return 0;
          if (isNaN(timeA)) return 1;  // a is invalid, sorted after b
          if (isNaN(timeB)) return -1; // b is invalid, sorted after a
          return timeA - timeB;
        });
        break;
      case 'title-asc': // Title A-Z
        sortedPosts.sort((a, b) => {
          const titleA = String(a.title || '').toLowerCase(); // Ensure string and case-insensitive
          const titleB = String(b.title || '').toLowerCase();
          return titleA.localeCompare(titleB);
        });
        break;
      case 'title-desc': // Title Z-A
        sortedPosts.sort((a, b) => {
          const titleA = String(a.title || '').toLowerCase();
          const titleB = String(b.title || '').toLowerCase();
          return titleB.localeCompare(titleA);
        });
        break;
      default:
        console.warn('Unknown sort criteria or no explicit default sort in switch:', sortBy);
        // Fallback to a default sort if necessary (e.g., if select has an unexpected initial value)
        // For now, we rely on the initial select option ('date-desc') being valid.
        // If you want a stronger default, uncomment and adjust:
        // sortedPosts.sort((a, b) => {
        //   const dateA = new Date(a.date); const dateB = new Date(b.date);
        //   if (isNaN(dateA.getTime())) return 1; if (isNaN(dateB.getTime())) return -1;
        //   return dateB - dateA;
        // });
    }

    console.log('Posts after sorting attempt (titles, string dates, parsed Date objects, and validity):',
      sortedPosts.map(p => ({
        title: p.title,
        dateStr: p.date,
        dateObj: new Date(p.date).toString(), // For human-readable check
        isValidDate: !isNaN(new Date(p.date).getTime()) // Crucial check
      }))
    );
    renderPosts(sortedPosts);
  }

  // Fetch posts from the JSON file
  fetch('/posts.json') // Ensure this path is correct
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText} (status: ${response.status})`);
      }
      return response.json();
    })
    .then(posts => {
      console.log('Fetched posts from posts.json:', posts);
      allPosts = Array.isArray(posts) ? posts : []; // Ensure allPosts is always an array

      if (allPosts.length === 0 && Array.isArray(posts) && posts.length > 0) {
          console.warn("INFO: 'allPosts' was empty after assignment but 'posts' from fetch was not. This shouldn't happen.");
      }


      // Data integrity checks and warnings
      let missingDateCount = 0;
      let missingSummaryCount = 0;
      allPosts.forEach(post => {
        if (post.date === undefined || post.date === null || post.date.trim() === "") {
          missingDateCount++;
          console.warn(`DATA WARNING: Post ID '${post.id}' (Title: '${post.title}') is missing a 'date' or it's empty. Date sorting will be unreliable for this item.`);
        }
        if (!post.summary) {
          missingSummaryCount++;
          // This is handled by fallback in renderPosts, but good to be aware of data quality.
          // console.log(`INFO: Post ID '${post.id}' (Title: '${post.title}') is missing a 'summary'.`);
        }
      });
      if (missingDateCount > 0) {
        console.error(`CRITICAL DATA ISSUE: ${missingDateCount} post(s) are missing valid date information.`);
      }
       if (missingSummaryCount > 0) {
        console.info (`INFO: ${missingSummaryCount} post(s) are missing a 'summary' field. Summaries will be auto-generated from content where possible.`);
      }


      // Check parse-ability of the first valid date found
      const firstValidPostWithDate = allPosts.find(p => p.date && p.date.trim() !== "");
      if (firstValidPostWithDate) {
        const testDate = new Date(firstValidPostWithDate.date);
        if (isNaN(testDate.getTime())) {
          console.error(`CRITICAL DATE PARSING ISSUE: The date format for post '${firstValidPostWithDate.title}' ('${firstValidPostWithDate.date}') might be unparseable by 'new Date()'. Resulting Date object: ${testDate}. Ensure dates are 'YYYY-MM-DD'.`);
        } else {
          console.log(`Date parsing check for first valid date ('${firstValidPostWithDate.date}') successful. Parsed as: ${testDate}`);
        }
      } else if (allPosts.length > 0 && missingDateCount === allPosts.length) {
          console.error("CRITICAL DATA ISSUE: No posts have valid date information. Date sorting will not function.");
      }


      // Initial sort and render.
      // The default selected option in HTML (e.g., "date-desc") will be used.
      sortAndRenderPosts();
    })
    .catch(error => {
      console.error('Failed to load or parse posts.json:', error);
      if (postsContainer) { // Check if postsContainer exists before trying to set its innerHTML
        postsContainer.innerHTML = `<p style="color: orange;">Sorry, something went wrong while loading the articles: ${error.message}. Please try again later.</p>`;
      }
    });

  // Add event listener to the sort select dropdown, only if it exists
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      console.log('Sort dropdown changed!');
      sortAndRenderPosts();
    });
  } else {
      console.warn("Sort select dropdown not found; sort change listener not attached.")
  }
});
// Date Formatting Function (for display)
function formatDate(dateString) {
  if (!dateString) return 'Date not available';
  const parts = String(dateString).split('-'); // Ensure dateString is treated as a string
  if (parts.length !== 3) return 'Invalid Date';

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
  const day = parseInt(parts[2], 10);

  // Create date as UTC to avoid timezone shifts during parsing for display
  const date = new Date(Date.UTC(year, month, day));

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
  return date.toLocaleDateString('en-US', options);
}

document.addEventListener('DOMContentLoaded', () => {
  const postsContainer = document.getElementById('all-posts-container');
  const sortSelect = document.getElementById('sort-by');
  let allPosts = [];

  if (!postsContainer) {
    console.error('CRITICAL ERROR: The posts container (#all-posts-container) was not found in the HTML.');
    return;
  }
  if (!sortSelect) {
    console.error('CRITICAL ERROR: The sort select dropdown (#sort-by) was not found in the HTML.');
    if (postsContainer) postsContainer.innerHTML = "<p>Sorting functionality is unavailable. Loading posts with default order...</p>";
    // Proceeding without sortSelect means sortAndRenderPosts will use default order if posts load
  }

  function renderPosts(postsToRender) {
    postsContainer.innerHTML = ''; 

    if (!postsToRender || postsToRender.length === 0) {
      postsContainer.innerHTML = '<p>No articles found matching your criteria.</p>';
      return;
    }

    postsToRender.forEach(post => {
      const postCard = document.createElement('article');
      postCard.classList.add('post-card');

      let summaryText = 'No summary available.';
      if (post.summary) {
        summaryText = post.summary;
      } else if (post.content) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = post.content;
        const textContent = tempDiv.textContent || tempDiv.innerText || "";
        summaryText = textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
      }

      postCard.innerHTML = `
        <h2>${post.title || 'Untitled Post'}</h2>
        <p class="post-date">${formatDate(post.date)}</p>
        <p>${summaryText}</p>
        <a href="/post.html?id=${post.id}">Read More →</a>
      `;
      postsContainer.appendChild(postCard);
    });
  }

  function sortAndRenderPosts() {
    // Helper to parse date string as UTC Date object for reliable sorting
    const parseDateAsUTC = (dateString) => {
      if (!dateString) return null;
      const parts = String(dateString).split('-'); // Ensure dateString is treated as a string
      if (parts.length !== 3) return null;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; 
      const day = parseInt(parts[2], 10);
      // Create date as UTC
      const d = new Date(Date.UTC(year, month, day));
      return isNaN(d.getTime()) ? null : d; // Return null if invalid
    };

    if (!sortSelect && allPosts.length > 0) {
        console.log('Sort select UI not found, rendering posts in fetched order.');
        renderPosts(allPosts); 
        return;
    }
    if (!sortSelect) {
        console.log('Sort select UI not found, and no posts to render yet.');
        return; 
    }

    const sortBy = sortSelect.value;
    console.log('Attempting to sort by:', sortBy); // Log selected sort criteria
    let sortedPosts = [...allPosts]; 

    // Log the state of posts *before* sorting attempt for diagnostics
    // console.log('Posts before sorting:', JSON.parse(JSON.stringify(sortedPosts.map(p => ({id: p.id, title: p.title, date: p.date})))));


    switch (sortBy) {
      case 'date-desc': 
        sortedPosts.sort((a, b) => {
          const dateA_Obj = parseDateAsUTC(a.date);
          const dateB_Obj = parseDateAsUTC(b.date);
          const timeA = dateA_Obj ? dateA_Obj.getTime() : NaN;
          const timeB = dateB_Obj ? dateB_Obj.getTime() : NaN;
          if (isNaN(timeA) && isNaN(timeB)) return 0;
          if (isNaN(timeA)) return 1;  
          if (isNaN(timeB)) return -1; 
          return timeB - timeA; // Newest first
        });
        break;
      case 'date-asc': 
        sortedPosts.sort((a, b) => {
          const dateA_Obj = parseDateAsUTC(a.date);
          const dateB_Obj = parseDateAsUTC(b.date);
          const timeA = dateA_Obj ? dateA_Obj.getTime() : NaN;
          const timeB = dateB_Obj ? dateB_Obj.getTime() : NaN;
          if (isNaN(timeA) && isNaN(timeB)) return 0;
          if (isNaN(timeA)) return 1;
          if (isNaN(timeB)) return -1;
          return timeA - timeB; // Oldest first
        });
        break;
      case 'title-asc': 
        sortedPosts.sort((a, b) => {
          const titleA = String(a.title || '').toLowerCase(); 
          const titleB = String(b.title || '').toLowerCase();
          return titleA.localeCompare(titleB);
        });
        break;
      case 'title-desc': 
        sortedPosts.sort((a, b) => {
          const titleA = String(a.title || '').toLowerCase();
          const titleB = String(b.title || '').toLowerCase();
          return titleB.localeCompare(titleA);
        });
        break;
      default:
        console.warn('Unknown sort criteria or no explicit default sort in switch:', sortBy);
    }
    
    // Log the state of posts *after* sorting attempt for diagnostics
    // console.log('Posts after sorting:', JSON.parse(JSON.stringify(sortedPosts.map(p => ({id: p.id, title: p.title, date: p.date})))));
    renderPosts(sortedPosts);
  }

  fetch('/posts.json') 
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText} (status: ${response.status})`);
      }
      return response.json();
    })
    .then(posts => {
      console.log('Fetched posts from posts.json:', posts);
      // Ensure all post objects have a 'date' property, even if undefined, for consistency.
      // And ensure 'title' is present.
      allPosts = Array.isArray(posts) ? posts.map(p => ({
          ...p,
          date: p.date, // Keep original date string
          title: p.title || "Untitled Post" // Ensure title exists
      })) : [];

      // Initial check of dates for parsing
      allPosts.forEach(post => {
          if (!post.date) {
              console.warn(`DATA WARNING: Post ID '${post.id}' (Title: '${post.title}') is missing a 'date'. Sorting by date will place it as invalid.`);
          } else {
              const d = parseDateAsUTC(post.date); // Using the same parsing logic for check
              if (!d) {
                  console.warn(`DATA WARNING: Post ID '${post.id}' (Title: '${post.title}') has a date ('${post.date}') that could not be parsed correctly. Sorting by date will place it as invalid.`);
              }
          }
      });
      
      if (sortSelect) { // Only call sortAndRenderPosts if sortSelect is available
          sortAndRenderPosts(); // Initial sort and render
      } else if (allPosts.length > 0) { // If sortSelect is missing but we have posts
          console.log("Sort select UI missing, rendering posts in default order.");
          renderPosts(allPosts); // Render without sorting
      }
    })
    .catch(error => {
      console.error('Failed to load or parse posts.json:', error);
      if (postsContainer) { 
        postsContainer.innerHTML = `<p style="color: orange;">Sorry, something went wrong while loading the articles: ${error.message}. Please try again later.</p>`;
      }
    });

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
        console.log('Sort dropdown changed!'); // Check if event listener is firing
        sortAndRenderPosts();
    });
  } else {
    console.warn("Sort select dropdown not found; sort change listener not attached. Sorting will not be interactive.");
  }
});