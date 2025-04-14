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


//handle contextMenu clicks
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if(info.menuItemId === 'verify') {
        console.log('Verify post');

        const dummyPostUrl = "https://www.linkedin.com/posts/santa-clara-university_scubeauty-activity-7314768387736227840-ewf0"; 

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
    else if(info.menuItemId === 'metadata') {
        console.log('View metadata');
        chrome.sidePanel.open( {windowId: tab.windowId });
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

// });