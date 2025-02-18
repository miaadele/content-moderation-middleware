#! /usr/bin/env node
const { spawn } = require("child_process");

const pythonScriptPath = "scraper/LI/scrape_lipost.py";
const child = spawn("python3", [pythonScriptPath], {
    stdio: "inherit",
}); //spawn py script and use same input/output as Node.js process

child.on("exit", (code)=>{
    console.log(`Python script exited with code ${code}`);
});