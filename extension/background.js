chrome.runtime.onStartup.addListener( () => {
    console.log('onStartup()');
})

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
}, function() {
    if (chrome.runtime.lastError) {
        console.error("Error creating context menu: ", chrome.runtime.lastError);
    } else {
        console.log("Parent menu created successfully");
    }
});

//Child menu creation
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

chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener(async(tabId, info, tab) => {
    if(!tab.url) return;
    const url = new URL(tab.url);
    if(url.origin === 'https.//www.google.com') {
        await chrome.sidePanel.setOptions({
            tabId,
            path: 'sidepanel.html',
            enabled: true
        });
    } else {
        await chrome.sidePanel.setOptions({
            tabId,
            enabled: false
        });
    }
});

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

    }//end if
    if(info.menuItemId === 'metadata') {
        console.log('View metadata');
        chrome.sidePanel.open({ windowId: tab.windowId });
    }
});

/*chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id }, 
        files: ["content.js"]
    }).catch(error => console.error("Script injection failed:", error)); 
}); */

chrome.runtime.onMessage.addListener(function(message, sender) {
    console.log('Received message in background: ', message);
    (async() => {
        if(message.action === 'showContextMenu') {
            chrome.contextMenus.update('ContextMenu', {visible: true});
        } 
        if(message.type === 'open_side_panel') {
            await chrome.sidePanel.open({ tabId: sender.tab.id });
            await chrome.sidePanel.setOptions({
                tabId: sender.tab.id,
                path: 'sidepanel.html',
                enabled: true
            });
        }
    })();
});

chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {command: "click"}, function(response) {
            console.log(response.result);
        });
    });
});