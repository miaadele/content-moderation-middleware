console.log("First line of content.js"); 
/*
function postData(input) {
    $.ajax({
        type: "POST",
       // url: "../scraper/LI/scrape_lipost.py",
        url: "http://localhost:8080/run-python", // sending to express server
        contentType: 'application/json', 
        data: JSON.stringify({
            username: "username", 
            password: "password",
            postUrl: input
        }),
      //  data: { param: input }, 
        //success: callbackfn
        success: function(response) {
            console.log("AJAX Success: ", response);
        },
        error: function(xhr, status, error) {
            console.log("AJAX Error: ", status, error);
        }
    });
}
*/

<<<<<<< HEAD
// helper fn: Get the visible text of a LinkedIn post from the DOM
function extractPostTextFromUrl(postUrl) {
    const posts = document.querySelectorAll('div.feed-shared-update-v2');

    for (let post of posts) {
        const anchor = post.querySelector('a.app-aware-link');
        if (anchor && anchor.href.includes(postUrl)) {
            const textContainer = post.querySelector('span.break-words');
            if (textContainer) {
                return textContainer.innerText.trim();
            }
        }
    }
    return null;
}

// listen for context menu click from background script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === "verify-post") {
        const postUrl = request.postUrl;
        console.log("Received dummy URL:", postUrl); 
        
        const postText = extractPostTextFromUrl(postUrl);
        if (!postText) {
            alert("Could not extract post text from this URL.");
            return;
        }

        console.log("Extracted Post Text:", postText);

        try {
            // send postText to backend for RSA+Hash processing
            const response = await fetch("http://localhost:8080/routes/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postText })
            });

            const result = await response.json();

            console.log("Server response:", result);

            // visual id: call to function here 

        } catch (error) {
            console.error("Error verifying post:", error);
            alert("Error verifying post.");
        }
    }
});

=======
>>>>>>> parent of 9cac1a9 (Merge branch 'js_fns_scraping' into crypto)
function callbackfn(response) {
    console.log(response);
}

postData('data');

// Use MutationObserver to detect when new posts are added dynamically
const observer1 = new MutationObserver(() => {
    var posts = document.querySelectorAll('.fie-impression-container'); // LinkedIn post container
    
    // posts.forEach(post => {
    //     post.addEventListener('contextmenu', function() {
    //     console.log('Right-click detected on post');
    //     chrome.runtime.sendMessage({ action: 'showContextMenu' }); // Send message to background script to show context menu
    //     });
    // });
});
    
observer1.observe(document.body, { childList: true, subtree: true });

//Use MutationObserver listens for dynamic changes to the DOM
/*
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
*/