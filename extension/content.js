const links = document.getElementsByClassName("artdeco-toast-item__cta"); //links is an HTMLCollection
const linksArray = Array.from(links).map(link => link.outerHTML); //convert links to linksArray
console.log(links);
chrome.runtime.sendMessage({
    type: 'elements',
    data: linksArray
});

