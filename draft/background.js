chrome.runtime.onInstalled.addListener(function () {
    let parent = chrome.contextMenus.create({
        title: "Change background color",
        id: 'parent',
        contexts: ['all']
    });
    chrome.contextMenus.create({
        title: 'On',
        parentId: parent,
        id: 'child1',
        contexts: ['all']
    });
    chrome.contextMenus.create({
        title: 'Off',
        parentId: parent,
        id: 'child2',
        contexts: ['all']
    });
    console.log("context menus created");
})

//handle menu item clicks
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if(info.menuItemId === 'child1') {
        console.log('change background color to red');
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => (document.body.style.backgroundColor = 'red')
        });
    } else if (info.menuItemId === 'child2') {
        console.log('reset background color');
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => (document.body.style.backgroundColor = '')
        });
    }
})

//enable or disable menu item based on background color
//not working currently
/*
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    if(changeInfo.status === 'complete') {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: checkBackgroundColor
        }, (results) => {
            if(results && results[0]) {
                const isRed = results[0].result === 'red';
                chrome.contextMenus.update("child1", {
                    enabled: !isRed
                });
            }
        });
    }
});

function checkBackgroundColor() {
    return document.body.style.backgroundColor;
}
*/