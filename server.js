require('dotenv').config(); 

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

//  get LinkedIn API credentials
app.get("/api/linkedin-credentials", (req, res) => {
    res.json({
        clientId: process.env.LINKEDIN_CLIENT_ID
    });
});

// Endpoint to exchange auth code for access token
app.post("/api/exchange-token", async (req, res) => {
    const { authCode } = req.body;
    
    if (!authCode) {
        return res.status(400).json({ error: "Missing authorization code" });
    }

    try {
        const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: authCode,
                redirect_uri: "https://hfkhhbiomgmepddmfgcogiljmkndeojf.chromiumapp.org/", // change based on extension id
                client_id: process.env.LINKEDIN_CLIENT_ID,
                client_secret: process.env.LINKEDIN_CLIENT_SECRET
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Token exchange error:", error);
        res.status(500).json({ error: "Failed to exchange token" });
    }
});


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
