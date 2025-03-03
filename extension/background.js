//Service worker

chrome.contextMenus.create({
    id: 'ContextMenu',
    title: 'Ascertion',
    contexts: ['all'] // change later to click on a post
})

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