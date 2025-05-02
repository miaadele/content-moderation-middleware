require('dotenv').config();

const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8080;
//const ejs = require('ejs');
const { spawn } = require("child_process");

// middleware 
app.use(cors()); 
app.use(bodyParser.json()); // to parse json
app.use(bodyParser.urlencoded({ extended: true })); 
//app.set('view engine', 'ejs');

// verify route
//const verifyRoute = require(`./routes/verify`);
//app.use(`/routes/verify`, verifyRoute);

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
const { uniqueSort } = require('jquery');
connectDB();

// side panel routing
app.get('sidepanel', (req, res) => {
    let id = 'testid'; 
    res.render('sidepanel', {
        uniqid: id // pass dynamic data here 
    }); 
}); 

app.post('/verify', (req, res) => {
    const { uniqueID } = req.body; 
    if (!uniqueID) {
        return res.status(400).json({ error: 'uniqueID required'}); 
    }

    const py = spawn('python', ['scraper/LI/verify_post.py', uniqueID]); 

    let output = ''; 
    py.stdout.on('data', chunk => output += chunk); 
    let err = ''; 
    py.stderr.on('data', chunk => err += chunk); 

    py.on('close', code => {
        if (code !== 0) {
            console.error('verify_post error:', err); 
            return res.status(500).json({ error: 'Verification script failed' }); 
        }
        // parse output
        const ok = /valid/i.test(output); 
        res.json({ verified: ok, details: output }); 
    })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`); 
}); 

//const { execFile } = require("child_process"); 
// to run python file
/*app.post("/run-python", (req, res) => {
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
    //const scriptPath = path.join(__dirname, "scraper", "LI", "scrape_lipost.py");
    //execFile("python", [scriptPath, postUrl, postText], { encoding: "utf8" }, (err, stdout, stderr) => {
    //  if (err) {
    //    console.error("Error executing Python script:", err);
    //    return res.status(500).send("Error executing script");
    //  }
    //  console.log("Python stdout:", stdout);
    //  if (stderr) console.error("Python stderr:", stderr);
    //  res.send("Python script ran successfully.");
    //});
});*/

app.post("/run-python", (req, res) => {
    const { postUrl, postText, likes } = req.body;

    if (!postUrl || !postText || !likes) {
        return res.status(400).send("Missing required fields.");
    }

    const inputData = JSON.stringify({
        postUrl,
        postText,
        likesCount: likes
    });

    const pythonProcess = spawn("python", ["scraper/LI/scrape_lipost.py"]);

    let output = "";
    let errorOutput = "";

    pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
    });

    pythonProcess.on("close", (code) => {
        if (code !== 0) {
            console.error("Python script failed:", errorOutput);
            return res.status(500).send("Python script failed.");
        }
        console.log("Python script output:", output);
        res.status(200).send("Python script executed successfully.");
    });

    // Send JSON data to the script via stdin
    pythonProcess.stdin.write(inputData);
    pythonProcess.stdin.end();
});



/*app.get('/', (req, req) => {
    let id = 'testid';
    res.render('sidepanel', {
        uniqid: id
    });
})*/