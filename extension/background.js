//Service worker

chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
        text: "OFF",
    });
    //Context menu creation
    chrome.contextMenus.create({
        id: 'ContextMenu',
        title: 'Ascertion',
        type: "normal",
        contexts: ['all'], // change later to click on a post
        visible: false //initially hidden
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