function extractText() {

    //get text content and handle null
    function getText(elt) {
        if (!elt) 
            return "";
        const html = elt.innerHTML;
        const withLineBreaks = html.replace(/br\s*\/?>/gi, "\n");
        const temp = document.createElement("div");
        temp.innerHTML = withLineBreaks;

        const pars = temp.querySelectorAll("p, span, div");
        if(pars.length > 0) {
            return Array.from(pars)
            .map((p)=>p.textContent.trim())
            .filter((text)=>text)
            .join("\n");
        }
        return temp.textContent.trim();
    }

    function extractPostData() {
        
    }
}