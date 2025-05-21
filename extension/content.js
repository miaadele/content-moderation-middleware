/* Content Script
Created by Vani Aggarwal and Mia Lassiter
April 2025 */

let lastRightClickedPost = null;

// Capture the last right-clicked post container
document.addEventListener('contextmenu', event => {
   const post = event.target.closest('[data-urn^="urn:li:activity:"]') ||
                event.target.closest('.update-components-text');
  if (post) {
    lastRightClickedPost = post;
    console.log('Stored lastRightClickedPost:', lastRightClickedPost);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('content.js received message:', request);

  if (request.action === 'verify-post') {
    if (!lastRightClickedPost) {
      console.error('No post was right-clicked.');
      return;
    }
    const likesElem = lastRightClickedPost.querySelector(
        '.social-details-social-counts__social-proof-fallback-number');
    const likesCount = likesElem ? likesElem.innerText.trim() : '0';
    
    // try parsing the following in-order until we find a content node
    const contentSelectors = [
        '.update-components-text',
        '.feed-shared-inline-show-more-text',
        '.feed-shared-text__text-view',
        '.feed-shared-text span.break-words'
    ];
    
    let postText = '';
    for (let sel of contentSelectors) {
        const el = lastRightClickedPost.querySelector(sel);
        if (el && el.innerText.trim()) {
        postText = el.innerText.trim();
        break;
        }
    }
    
    // return to main container if none of the above matched
    if (!postText) {
        postText = lastRightClickedPost.innerText.trim();
    }
    
    fetch('http://localhost:8080/run-python', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postUrl: request.postUrl, postText, likes: likesCount })
    })
    .then(res => {
        if (!res.ok) {
            return res.text().then(t => { throw new Error(t || res.statusText); }); 
        }
        return res.text(); 
    })

    .then(data => { 
        console.log('run-python response:', data); 
        alert('Post hashed, encrypted, and saved to the database!'); 
    })
    .catch(err => {
        console.error('Error sending to /run-python:', err); 
        alert('Failed to save post: \n' + err.message); 
    });

  } else if (request.action === 'verify-signature') {
    if (!request.pageUrl) {
      console.error('No pageUrl provided');
      return;
    }
    const idMatch = request.pageUrl.match(/\d{19}/);
    if (!idMatch) {
      console.error('No LinkedIn post ID found in URL');
      return;
    }
    const uniqueID = idMatch[0];
    console.log('verify-signature -> uniqueID:', uniqueID);

    fetch('http://localhost:8080/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uniqueID })
    })
    .then(res => res.json())
    .then(result => {
      console.log('verify-signature result:', result);
      if (result.verified) {
        alert('Signature valid and verified!');
      } else {
        alert('Signature invalid: ' + (result.error || 'unknown error'));
      }
    })
    .catch(err => console.error('Error calling /verify:', err));
  } else if (request.action === 'view-metadata') {
        const match = request.pageUrl.match(/\d{19}/); 
        if (!match) return console.error('No post ID in URL'); 

        const uniqueID = match[0]; 
        console.log('view-metadata -> uniqueID:', uniqueID); 

        fetch(`http://localhost:8080/metadata/${uniqueID}`)
            .then(res => res.json())
            .then(data => {
                // sidebar container
                let sidebar = document.getElementById('content-sidebar'); 
                if (!sidebar) {
                    sidebar = document.createElement('div'); 
                    sidebar.id = 'content-sidebar'; 
                    Object.assign(sidebar.style, {
                        position: 'fixed', 
                        top: '0', 
                        right: '0', 
                        width: '320px', 
                        height: '100%', 
                        background: '#fff', 
                        overflowY: 'auto', 
                        boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.2)', 
                        padding: '12px', 
                        zIndex: '999999'
                    }); 
                    document.body.appendChild(sidebar); 
                }

                // get metadata
                sidebar.innerHTML = `
                    <button id="sidebar-close" 
                        style="position:absolute; top: 8px; right: 8px; 
                        background: none; border: none; font-size:16px; cursor:pointer;">
                    X</button>
                    <h2>Post Metadata</h2>
                    <p><strong>Post Text:</strong> ${data.post_text}</p>
                    <p><strong>Likes:</strong> ${data.likes}</p>
                    <p><strong>Posted:</strong> ${data.post_date}</p>
                    <p><strong>Signed At:</strong> ${data.signed_at}</p>
                    <p><strong>Text Hashed:</strong> ${data.post_text_hash}</p>
                `; 

                const closeBtn = sidebar.querySelector('#sidebar-close'); 
                if (closeBtn) {
                    closeBtn.addEventListener('click', () => {
                        sidebar.remove(); 
                    }); 
                }
            })
            .catch(err => console.error('Metadata fetch error:', err)); 
  }
});