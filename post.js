function getPostIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function loadPost() {
  const postId = getPostIdFromURL();

  try {
    const response = await fetch('posts.json');
    if (!response.ok) throw new Error('Network response was not ok');
    const posts = await response.json();
    const post = posts.find(p => p.id === postId);

    const titleEl = document.getElementById('post-title');
    const subtextEl = document.getElementById('post-subtext');
    const contentEl = document.getElementById('post-content');

    if (post) {
      titleEl.textContent = post.title;
      subtextEl.style.display = 'none';
      contentEl.innerHTML = post.content;
    } else {
      titleEl.textContent = 'Post Not Found';
      subtextEl.style.display = 'none';
      contentEl.innerHTML = '<p>The post you are looking for does not exist.</p>';
    }
  } catch (err) {
    console.error('Error loading post:', err);
    document.getElementById('post-content').innerHTML = '<p>Failed to load the post.</p>';
  }
}

loadPost();
