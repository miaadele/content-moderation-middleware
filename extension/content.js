// preventing overloading with multiple requests
if (!window.hasRunAscertion) {
    window.hasRunAscertion = true; 

    let lastRightClickedPost = null;
    let likesCount = "0"; 

    console.log("First line of content.js"); 

    document.addEventListener("contextmenu", (event) => {
        // traverse up the DOM to find the closest post container
        //const post = event.target.closest(".update-components-text");
        const post = event.target.closest(".update-components-text"); 
        //const post = event.target.closest('[data-urn^="urn:li:activity:"]');

        if (post) {
            lastRightClickedPost = post;
            console.log("Right-clicked post found!");

           // const likesof = postL.querySelector('.social-details-social-counts__reactions-count'); 
           // const likesCount = likesof ? likesof.innerText : "0"; 
            //console.log(likesCount)
        } else {
            lastRightClickedPost = null;
            console.log("No post container found"); 
        }
    });



    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "verify-post") {
            if (!lastRightClickedPost) {
                console.error("No post was right-clicked.");
                window.hasRunAscertion = false; 
                return;
            }
            const likesElem = document.querySelector(".social-details-social-counts__reactions-count");
            const likesCount = likesElem.innerText ? likesElem.innerText : "0"; 
            const postText = lastRightClickedPost.innerText;
            if (!postText) {
                console.error("Post content is empty.");
           //     window.hasRunAscertion = false; 
                return;
            }

            console.log("Extracted post text:", postText);
            console.log("number of likes: ", likesCount);
            //console.log("Extracted page source:", pageSource); 

            fetch("http://localhost:8080/run-python", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    postUrl: request.postUrl,
                    postText: postText,
                    likes: likesCount
                })
            })
            .then(response => response.text())
            .then(data => console.log("Server response:", data))
            .catch(err => console.error("Error sending to server:", err));
        }
    });


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

    function callbackfn(response) {
        console.log(response);
    }

    //postData('data');

    // Use MutationObserver to detect when new posts are added dynamically
    /*const observer1 = new MutationObserver(() => {
        var posts = document.querySelectorAll('.fie-impression-container'); // LinkedIn post container
        
        // posts.forEach(post => {
        //     post.addEventListener('contextmenu', function() {
        //     console.log('Right-click detected on post');
        //     chrome.runtime.sendMessage({ action: 'showContextMenu' }); // Send message to background script to show context menu
        //     });
        // });
    });*/
        
    //observer1.observe(document.body, { childList: true, subtree: true });

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
}