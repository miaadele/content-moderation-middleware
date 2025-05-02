let lastRightClickedPost = null;

// Capture the last right-clicked post container
document.addEventListener('contextmenu', event => {
  const post = event.target.closest('.update-components-text') ||
               event.target.closest('[data-urn^="urn:li:activity:"]');
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
    const likesElem = lastRightClickedPost.querySelector('.social-details-social-counts__reactions-count');
    const likesCount = likesElem ? likesElem.innerText.trim() : '0';
    const postText = lastRightClickedPost.innerText.trim();
    console.log('verify-post -> postText:', postText);
    console.log('verify-post -> likesCount:', likesCount);

    fetch('http://localhost:8080/run-python', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postUrl: request.postUrl, postText, likes: likesCount })
    })
    .then(res => res.text())
    .then(data => console.log('run-python response:', data))
    .catch(err => console.error('Error sending to /run-python:', err));

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
  }
});

// preventing overloading with multiple requests
/*if (!window.hasRunAscertion) {
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

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'verify-signature') {
            // get the 19-digit unique ID from url
            const idMatch = request.pageUrl.match(/\d{19}/); 
            if (!idMatch) {
                console.error('No LinkedIn post id'); 
                return; 
            }
            const uniqueID = idMatch[0]; 
            console.log('Verifying signature for post ID:', uniqueID); 

            // call verify endpoint
            fetch('http://localhost:8080/verify', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ uniqueID })
            })
            .then(r => r.json())
            .then(result => {
                if (result.verified) {
                    alert('Signature valid and verified!'); 
                } else {
                    alert('Signature not valid and verified'); 
                }
            })
            .catch(err => {
                console.error('Error calling verify:', err); 
            })
        }
    })*/

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

    /*function callbackfn(response) {
        console.log(response);
    }
    }*/
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
