document.addEventListener('DOMContentLoaded', function () {
    const colorBtn = document.getElementById('colorButton');
    
    // Check and set the initial button text based on the current background color
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length === 0 || !tabs[0].id) {
            console.error("No active tab found.");
            return;
        }

        chrome.scripting.executeScript(
            {
                target: { tabId: tabs[0].id },
                func: () => document.body.style.backgroundColor,
            },
            (results) => {
                if (results && results[0].result === 'red') {
                    colorBtn.textContent = 'Set Background to Default';
                } else {
                    colorBtn.textContent = 'Set Background to Red';
                }
            }
        );
    });

    // Add event listener for button click
    colorBtn.addEventListener('click', function () {
        changeColor(colorBtn);
    });
});

function changeColor(button) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length === 0 || !tabs[0].id) {
            console.error("No active tab found.");
            return;
        }

        chrome.scripting.executeScript(
            {
                target: { tabId: tabs[0].id },
                func: () => {
                    const currentColor = document.body.style.backgroundColor;
                    if (currentColor === 'red') {
                        document.body.style.backgroundColor = 'unset';
                        return 'unset';
                    } else {
                        document.body.style.backgroundColor = 'red';
                        return 'red';
                    }
                },
            },
            (results) => {
                if (chrome.runtime.lastError) {
                    console.error("Error:", chrome.runtime.lastError.message);
                } else {
                    const newColor = results[0].result;
                    if (newColor === 'red') {
                        button.textContent = 'Set Background to Default';
                    } else {
                        button.textContent = 'Set Background to Red';
                    }
                }
            }
        );
    });
}

function genericOnClick(info) {
    switch(info.menuItemId) {
        default:
        console.log("standard context menu item clicked");
    }
}