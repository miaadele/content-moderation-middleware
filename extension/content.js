// preventing overloading with multiple requests
if (!window.hasRunAscertion) {
    window.hasRunAscertion = true; 

    console.log("First line of content.js"); 

    let lastRightClickedPost = null;

    document.addEventListener("contextmenu", (event) => {
        // traverse up the DOM to find the closest post container
        const post = event.target.closest(".update-components-text");
        if (post) {
            lastRightClickedPost = post;
            console.log("Right-clicked post found!");
        } else {
            lastRightClickedPost = null;
            console.log("No post found"); 
        }
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "verify-post") {
            if (!lastRightClickedPost) {
                console.error("No post was right-clicked.");
                window.hasRunAscertion = false; 
                return;
            }

            const postText = lastRightClickedPost.innerText;

            if (!postText) {
                console.error("Post content is empty.");
           //     window.hasRunAscertion = false; 
                return;
            }

            console.log("Extracted post text:", postText);

            fetch("http://localhost:8080/run-python", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    postUrl: request.postUrl,
                    postText: postText
                })
            })
            .then(response => response.text())
            .then(data => console.log("Server response:", data))
            .catch(err => console.error("Error sending to server:", err));
        }
    });


    function callbackfn(response) {
        console.log(response);
    }

    // Use MutationObserver to detect when new posts are added dynamically
    const observer1 = new MutationObserver(() => {
        var posts = document.querySelectorAll('.fie-impression-container'); // LinkedIn post container
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
}