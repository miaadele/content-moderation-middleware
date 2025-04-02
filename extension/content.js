console.log("First line of content.js"); 

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