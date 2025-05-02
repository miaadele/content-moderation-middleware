require('dotenv').config();

const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8080;
const ejs = require('ejs');

// middleware 
app.use(cors()); 
app.use(bodyParser.json()); // to parse json
app.use(bodyParser.urlencoded({ extended: true })); 
app.set('view engine', 'ejs');

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

// side panel routing
app.get('sidepanel', (req, res) => {
    let id = 'testid'; 
    res.render('sidepanel', {
        uniqid: id // pass dynamic data here 
    }); 
}); 

app.listen(port, () => {
    console.log(`Server is running on port ${port}`); 
}); 

//const { execFile } = require("child_process"); 
// to run python file
app.post("/run-python", (req, res) => {
    const { postUrl, postText } = req.body; 

    if ( !postUrl || !postText ) {
        return res.status(400).send("Missing required fields."); 
    }

    const { exec } = require("child_process");
    exec(`python scraper/LI/scrape_lipost.py "${postUrl}" "${postText}"`, (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            return res.status(500).send("Error running Python script");
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        res.send("Python script executed successfully");
    });
    /*const scriptPath = path.join(__dirname, "scraper", "LI", "scrape_lipost.py");
    execFile("python", [scriptPath, postUrl, postText], { encoding: "utf8" }, (err, stdout, stderr) => {
      if (err) {
        console.error("Error executing Python script:", err);
        return res.status(500).send("Error executing script");
      }
      console.log("Python stdout:", stdout);
      if (stderr) console.error("Python stderr:", stderr);
      res.send("Python script ran successfully.");
    });*/
});

/*app.get('/', (req, req) => {
    let id = 'testid';
    res.render('sidepanel', {
        uniqid: id
    });
})*/