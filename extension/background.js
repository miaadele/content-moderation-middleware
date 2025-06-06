//Service worker
console.log("background service worker script loaded");

//service worker
console.log("background service worker script loaded");
chrome.runtime.onInstalled.addListener(() => {
    console.log("service worker installed");
})

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
    title: 'Hash and Encrypt',
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
    id: 'verify_signature', 
    title: 'Verify Signature', 
    parentId: 'ContextMenu', 
    contexts: ['all']
})
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

/*const extensionId = 'lmjegmlicamnimmfhcmpkclmigmmcbeh';
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
}   */

//handle contextMenu clicks
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if(info.menuItemId === 'verify') {
        console.log('Verify post');

        // const { exec } = require('child_process');
        // exec('../scraper/LI/test.py', (error, stdout, stderr) => {
        //     console.log(stdout);
        // });
       // const dummyPostUrl = "https://www.linkedin.com/posts/santa-clara-university_scubeauty-activity-7314768387736227840-ewf0"; 

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error("Script injection failed:", chrome.runtime.lastError.message);
                return;
            }

            chrome.tabs.sendMessage(tab.id, {
                action: "verify-post", 
                postUrl: info.pageUrl
            }); 
        }); 

    }//end if
    else if (info.menuItemId === 'verify_signature') {
        console.log('Verify Signature clicked'); 
        // put in content.js
        chrome.scripting.executeScript({
            target: { tabId: tab.id }, 
            files: ['content.js']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('Script injection failed:', chrome.runtime.lastError); 
                return; 
            }
            chrome.tabs.sendMessage(tab.id, {
                action: 'verify-signature', 
                pageUrl: info.pageUrl
            }); 
        }); 
    } else if(info.menuItemId === 'metadata') {
        chrome.scripting.executeScript({
            target: { tabId: tab.id }, 
            files: ['content.js']
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('injection failed:', chrome.runtime.lastError); 
                return; 
            }
            chrome.tabs.sendMessage(tab.id, {
                action: 'view-metadata', 
                pageUrl: info.pageUrl
            }); 
        }); 
    }
});

/*chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id }, 
        files: ["content.js"]
    }).catch(error => console.error("Script injection failed:", error)); 
}); */

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