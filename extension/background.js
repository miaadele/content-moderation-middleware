//Service worker
console.log("background service worker script loaded");

//service worker
/* console.log("background service worker script loaded");
chrome.runtime.onInstalled.addListener(() => {
    console.log("service worker installed");
}) */

// linkedin API 
let CLIENT_ID = ""; 

// Fetch LinkedIn Client ID from dotenv
fetch("http://localhost:3000/api/linkedin-credentials")
    .then(response => response.json())
    .then(data => {
        CLIENT_ID = data.clientId;
        console.log("LinkedIn Client ID Loaded:", CLIENT_ID);
    })
    .catch(error => console.error("Error fetching LinkedIn Client ID:", error));

const REDIRECT_URI = "https://hfkhhbiomgmepddmfgcogiljmkndeojf.chromiumapp.org/";
const AUTH_URL = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=w_member_social`;



// login for LinkedIn
function loginwithLinkedIn(sendResponse) {
    chrome.identity.launchWebAuthFlow(
        { url: AUTH_URL, interactive: true }, 
        function (redirectUrl) {
            if (chrome.runtime.lastError) {
                console.error("Auth Error: ", chrome.runtime.lastError); 
                sendResponse({ success: false, error: chrome.runtime.lastError }); 
                return; 
            }

            const urlParams = new URLSearchParams(new URL(redirectUrl).search); 
            const authCode = urlParams.get("code"); 

            if (authCode) {
                exchangeAuthCodeForAccessToken(authCode, sendResponse); 
                return true; // need to keep message channel open
            } else {
                console.error("No auth code found"); 
                sendResponse({ success: false, error: "Authorization failed" }); 
            }
        }
    ); 
    return true; 
}

// auth code -> access token
async function exchangeAuthCodeForAccessToken(authCode, sendResponse) {
    try {
        const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: authCode,
                redirect_uri: REDIRECT_URI,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET
            })
        });

        const data = await response.json();
        console.log("LinkedIn API Response:", data); // debug please

        if (data.access_token) {
            chrome.storage.local.set({ linkedinAccessToken: data.access_token }, () => {
                console.log("Access token saved:", data.access_token);
                sendResponse({ success: true, accessToken: data.access_token });
            });
        } else {
            console.error("Token exchange failed:", data);
            sendResponse({ success: false, error: data });
        }
    } catch (error) {
        console.error("Token exchange error:", error);
        sendResponse({ success: false, error });
    }
}


// listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "loginwithLinkedIn") {
        loginwithLinkedIn(sendResponse); 
        return true; 
    }
}); 


//Context menu creation
chrome.runtime.onInstalled.addListener(() => {
    console.log("Service worker installed"); 

    chrome.contextMenus.removeAll(() => {
        if (chrome.runtime.lastError) {
            console.log("Error removing context menus: ", chrome.runtime.lastError); 
        } else {
            console.log("Removed old context menus. new ones being created..."); 
        }
         
        // create new context menus after previous removed
        createContextMenus(); 

    }); 
}); 

function createContextMenus() {
        // parent menu
        chrome.contextMenus.create({
            id: 'ContextMenu',
            title: 'Ascertion',
            type: "normal",
            contexts: ['all'],
            //visible: false //initially hidden
        }, function() {
            if (chrome.runtime.lastError) {
                console.error("Error creating context menu: ", chrome.runtime.lastError);
            } else {
                console.log("Parent menu created successfully");
            }
        });
        chrome.contextMenus.create({
            id: 'ca',
            title: 'Content Authorities',
            parentId: "ContextMenu",
            type: "normal"
        });
        chrome.contextMenus.create({
            id: 'verify',
            title: 'Verify Post',
            parentId: "ContextMenu",
            type: "normal"
        });
        chrome.contextMenus.create({
            id: 'metadata',
            title: 'View Metadata',
            parentId: "ContextMenu",
            type: "normal"
        }); 
        chrome.contextMenus.create({
            id: 'radio1',
            title: 'CA Option 1',
            parentId: "ca",
            type: "radio"
        });
        chrome.contextMenus.create({
            id: 'radio2',
            title: 'CA Option 2',
            parentId: "ca",
            type: "radio"
        });
        
        console.log("Context menus created successfully."); 
}

 function createContextMenuItem(id, title, parentId, type) {
    chrome.contextMenus.create({
        id: id, 
        title: title, 
        parentId: parentId, 
        type: type
    }, function() {
        if (chrome.runtime.lastError) {
            console.error(`Error creating context menu item with id ${id}: `, chrome.runtime.lastError); 
        } else {
            console.log(`Context menu item with id ${id} created successfully`); 
        }
    }); 
 }


/*
chrome.runtime.onInstalled.addListener((message, sender, sendResponse) => {
    console.log("service worker installed");
    if(message.action === 'showContextMenu') {
        console.log('Action from content script received');

        //Context menu creation
        chrome.contextMenus.create({
            id: 'ContextMenu',
            title: 'Ascertion',
            type: "normal",
            contexts: ['all'],
            //visible: false //initially hidden
        }, function() {
            if (chrome.runtime.lastError) {
                console.error("Error creating context menu: ", chrome.runtime.lastError);
            }
            else {
                console.log("Parent menu created successfully");
            }
        });
        chrome.contextMenus.create({
            id: 'ca',
            title: 'Content Authorities',
            parentId: "ContextMenu",
            type: "normal"
        });
        chrome.contextMenus.create({
            id: 'verify',
            title: 'Verify Post',
            parentId: "ContextMenu",
        type: "normal"
        });
        chrome.contextMenus.create({
            id: 'metadata',
            title: 'View Metadata',
            parentId: "ContextMenu",
            type: "normal"
        }); 
        chrome.contextMenus.create({
            id: 'radio1',
            title: 'CA Option 1',
            type: "radio",
            parentId: "ca"
        });
        chrome.contextMenus.create({
            id: 'radio2',
            title: 'CA Option 2',
            type: "radio",
            parentId: "ca"
        });
    }//end if
});
*/

/* const extensionId = 'hfkhhbiomgmepddmfgcogiljmkndeojf';
if(chrome && chrome.runtime) {
    //create a runtime.Port object that's connected to native messaging host
    var port = chrome.runtime.connectNative('com.google.drive.nativeproxy');
    port.onMessage.addListener(function(msg) {
        console.log('Received ' + msg);
    });
    port.onDisconnect.addListener(function() {
        console.log('Disconnected from native port')
    }) ;
    port.postMessage({text: 'Hello, this is a message from the native port.'});
}    */

//handle contextMenu clicks
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if(info.menuItemId === 'verify') {
        console.log('Verify post');

        // const { exec } = require('child_process');
        // exec('../scraper/LI/test.py', (error, stdout, stderr) => {
        //     console.log(stdout);
        // });

        // linkedin API stuff here
        chrome.storage.local.get("linkedinAccessToken", (data) => {
            if (data.linkedinAccessToken) {
                fetch("https.//api.linkedin.com/v2/me", {
                    headers: { Authorization: 'Bearer ${data.linkedinAccessToken}' }
                })
                .then(response => response.json())
                .then(profile => console.log("Linkedin Profile:", profile))
                .catch(error => console.error("Error fetching profiles:", error)); 
            } else {
                console.log("User not logged in, prompting login..."); 
                chrome.runtime.sendMessage({ action: "loginWithLinkedIn" }); 
            }
        }); 
    }//end if
    else if(info.menuItemId === 'metadata') {
        console.log('View metadata');
    }
});

//listen for messages from content script to show the context menu
// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//     console.log('Received message in background: ', message);
//     if(message.action === 'showContextMenu') {
//         chrome.contextMenus.update('ContextMenu', {visible: true});
//     }
// });

// chrome.browserAction.onClicked.addListener(function() {
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//         chrome.tabs.sendMessage(tabs[0].id, {command: "click"}, function(response) {
//             console.log(response.result);
//         });
//     });
// });