document.getElementById("verify").addEventListener("click", () => {
    alert("Verification process started!"); 

    // request local server to trigger Python script
    fetch("http://localhost:3000/run-python")
        .then(response => response.text())
        .then(data => {
            console.log(data); // please respond correctly
            alert("Success with Script!"); 
        })
        .catch(error => {
            console.error("Error: ", error); // sigh
            alert("Error executing script."); 
        }); 
}); 