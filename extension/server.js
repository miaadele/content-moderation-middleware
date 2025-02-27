const express = require('express');
const { exec } = require('child_process');

const app = express();
const port = 3000;

app.get("/run-python", (req, res) => {
    const pythonScript = "scraper\LI\scrape_lipost.py";
    
    // Run the Python script using child_process
    exec("python ${pythonScript}", (err, stdout, stderr) => {
        if (err) {
            console.error("exec error: ${err}");
            res.status(500).send("Error running Python script");
            return;
        }
        console.log("stdout: ${stdout}");
        console.error("stderr: ${stderr}");
        res.send("Python script executed successfully");
    });
});

app.listen(port, () => {
    console.log("Server listening at http://localhost:${port}");
});
