//Service worker
console.log("background service worker script loaded");

//service worker
console.log("background service worker script loaded");
chrome.runtime.onInstalled.addListener(() => {
    console.log("service worker installed");
})

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
            visible: false //initially hidden
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
    

//handle contextMenu clicks
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if(info.menuItemId === 'verify') {
        console.log('Verify post');
    }
    else if(info.menuItemId === 'metadata') {
        console.log('View metadata');
    }
});


//listen for messages from content script to show the context menu
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    console.log('Received message in background: ', message);
    if(message.action === 'showContextMenu') {
        chrome.contextMenus.update('ContextMenu', {visible: true});
    }
});

// chrome.browserAction.onClicked.addListener(function() {
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//         chrome.tabs.sendMessage(tabs[0].id, {command: "click"}, function(response) {
//             console.log(response.result);
//         });
//     });
// });