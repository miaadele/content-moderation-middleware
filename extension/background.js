//Service worker

chrome.contextMenus.create({
    id: 'ContextMenu',
    title: 'Ascertion',
    contexts: ['all'] // change later to click on a post
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log(info)
    console.log(tab)
})