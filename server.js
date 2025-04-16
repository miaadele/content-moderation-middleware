/*require('dotenv').config(); 

const express = require('express');
//const { exec } = require('child_process');
//const connectDB = require('./config/db'); 
const fs = require('fs'); 
const path = require('path'); 
const cors = require("cors"); 
const bodyParser = require("body-parser"); 
const app = express();
const port = 8080;
const verifyRoute = require('./routes/verify'); 
require('dotenv').config(); */

require('dotenv').config();

const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8080;

// middleware 
app.use(cors()); 
app.use(bodyParser.json()); // to parse json
app.use(bodyParser.urlencoded({ extended: true })); 

// verify route
const verifyRoute = require(`./routes/verify`);
app.use(`/routes/verify`, verifyRoute);

// route to public RSA key
app.get('/keys/public-key', (req, res) => {
    const keyPath = path.join(__dirname, 'keys', 'public.pem');
    fs.readFile(keyPath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading public key:`, err);
            return res.status(500).send(`Failed to load public key.`);
        }
        res.type('text/plain').send(data);
    });
});

const connectDB = require('./config/db');
connectDB();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`); 
}); 

const { spawn } = require('child_process');

// to run python file
app.post("/run-python", (req, res) => {
    const { postUrl, postText, likes } = req.body; 

    if ( !postUrl || !postText || !likes) {
        return res.status(400).send("Missing required fields."); 
    }

    //const { exec } = require("child_process");
    const pythonProcess = spawn('python', ['scraper/LI/scrape_lipost.py']); 

    const jsonData = JSON.stringify({
        postUrl, 
        postText, 
        likesCount: likes 
    }); 

    pythonProcess.stdin.write(jsonData); 
    pythonProcess.stdin.end(); 

    pythonProcess.stdout.on('data', (data) => {
        console.log('stdout: ${data}'); 
    }); 

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`python script exited with code ${code}`);
        res.send("python script executed successfully");
    });

    /*console.log(`Post URL: ${postUrl}, Post Text: ${postText}, Likes: ${likes}`);
    exec(`python scraper/LI/scrape_lipost.py "${postUrl}" "${postText}" "${likes}"`, (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            return res.status(500).send("Error running Python script");
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        res.send("Python script executed successfully");
    });*/

});
/*// Connect to the database
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
});*/
