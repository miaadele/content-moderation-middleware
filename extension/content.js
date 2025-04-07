console.log("First line of content.js"); 

const button = new DOMParser().parseFromString(
    '<button>View metadata</button>',
    'text/html'
).body.firstElementChild;

button.addEventListener('click', function (){
    chrome.runtime.sendMessage({ type: 'open_side_panel' });
});

document.body.append(button);

const observer1 = new MutationObserver(() => {
    var posts = document.querySelectorAll('.fie-impression-container'); // LinkedIn post container
    // Use MutationObserver to detect when new posts are added dynamically
    posts.forEach(post => {
        post.addEventListener('contextmenu', function() {
        console.log('Right-click detected on post');
        chrome.runtime.sendMessage({ action: 'showContextMenu' });
        });
    });
});
    
observer1.observe(document.body, { childList: true, subtree: true });

//Use MutationObserver listens for dynamic changes to the DOM
const observer2 = new MutationObserver(() => {
    const links = document.getElementsByClassName("artdeco-toast-item__cta"); //links is an HTMLCollection
    console.log(links);
    var linksArray = new Map();
    linksArray.set("link", links[0].href);
    chrome.runtime.sendMessage({
        type: 'elements',
        data: linksArray
    });
});

observer2.observe(document.body, { childList: true, subtree: true });