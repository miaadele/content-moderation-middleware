const express = require('express');
const { exec } = require('child_process');
const connectDB = require('./config/db'); 
const cors = require("cors"); 
const bodyParser = require("body-parser"); 
const app = express();
const port = 3000;

app.use(cors()); 
app.use(bodyParser.json()); // to parse json

// Connect to the database
connectDB(); 

app.post("/run-python", (req, res) => {
    const { username, password, postUrl } = req.body; 

    if (!username || !password || !postUrl ) {
        return res.status(400).send("Missing required fields."); 
    }

    //console.log("Received data: ", {username, password, postUrl}); 

    // Run the Python script using child_process
    exec(`python3 scraper/LI/scrape_lipost.py "${username}" "${password}" "${postUrl}"`, (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            res.status(500).send("Error running Python script");
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        res.send("Python script executed successfully");
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
