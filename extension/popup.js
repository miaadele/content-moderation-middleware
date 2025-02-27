document.getElementById("verify").addEventListener("click", () => {
    document.getElementById("inputFields").style.display = "block"; 

    // request local server to trigger Python script
  /*  fetch("http://localhost:3000/run-python")
        .then(response => response.text())
        .then(data => {
            console.log(data); // please respond correctly
            alert("Success with Script!"); 
        })
        .catch(error => {
            console.error("Error: ", error); // sigh
            alert("Error executing script."); 
        }); */
}); 

document.getElementById("submit").addEventListener("click", () => {
    const username = document.getElementById("username").value.trim(); 
    const password = document.getElementById("password").value.trim(); 
    const postUrl = document.getElementById("postUrl").value.trim(); 

    if (!username || !password || !postUrl) {
        alert("Fill in all fields to continue!"); 
        return; 
    }

    alert("verification"); 

    // send data over
    fetch("http://localhost:3000/run-python", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        }, 
        body: JSON.stringify({ username, password, postUrl })
    })
    .then(response => response.text())
    .then(data => {
        console.log(data); 
        alert("success!"); // please work 
    })
    .catch(error => {
        console.error("Error: ", error); 
        alert("error!"); 
    }); 
}); 