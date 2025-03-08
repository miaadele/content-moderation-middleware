console.log("First line of content.js");
//The MutationObserver listens for dynamic changes to the DOM

// Use MutationObserver to detect when new posts are added dynamically
const observer1 = new MutationObserver(() => {
    const posts = document.querySelectorAll('.fie-impression-container'); // LinkedIn post container
    console.log('Posts detected:', posts); // Log detected posts
    
    posts.forEach(post => {
        post.addEventListener('contextmenu', function(event) {
        console.log('Right-click detected on post');
        event.preventDefault(); // Prevent the default context menu
        // Send a message to the background script to show the custom context menu
        chrome.runtime.sendMessage({ action: 'showContextMenu' });
        });
    });
});
    
observer1.observe(document.body, { childList: true, subtree: true });

const observer = new MutationObserver(() => {
    const links = document.getElementsByClassName("artdeco-toast-item__cta"); //links is an HTMLCollection
    const linksArray = Array.from(links).map(link => link.outerHTML); //convert links to linksArray
    console.log(linksArray);
    chrome.runtime.sendMessage({
        type: 'elements',
        data: linksArray
    });
});

