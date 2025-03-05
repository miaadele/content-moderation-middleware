//Service worker


//Context menu creation
chrome.contextMenus.create({
    id: 'ContextMenu',
    title: 'Ascertion',
    type: "normal",
    contexts: ['all'] // change later to click on a post
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


chrome.runtime.onInstalled.addListener(() => {
    console.log('Background.js is running');
});

// chrome.action.onClicked.addListener((tab) => {
//     console.log('Extension clicked');

//     chrome.scripting.executeScript({
//         target: {tabId: tab.id},
//         files: ['content.js']
//     });
// });

// //listen for message from content.js
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.type === 'links') {
//         console.log('Received links: ', message.data);
//     }
// })