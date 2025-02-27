#! /usr/bin/env node

const { spawn } = require("child_process");

const pythonScriptPath = "scraper/LI/scrape_lipost.py";
const child = spawn("python3", [pythonScriptPath], {
    stdio: "inherit",
}); //spawn py script and use same input/output as Node.js process

child.on("exit", (code)=>{
    console.log(`Python script exited with code ${code}`);
});
// const app = express();

// const pythonPromise = () => {
//     return new Promise ((resolve, reject) => {
//         const pythonScriptPath = spawn("python", ["scraper/url.py"]);
//         pythonPromise.stdout.on("data", (data) => {
//             resolve(data.toString());
//         });

//         python.stderr.on("data", (data) => {
//             reject(data.toString());
//         });
//     });
// };

// app.get("/:domain", async(requestAnimationFrame, res) => {
//     const domainName = await pythonPromise();
//     res.send(domainName + req.params.name);
// });

// const pythonScriptPath = "scraper/url.py";
// const child = spawn("python3", [pythonScriptPath], {
//     stdio: "inherit",
// });


// child.on("exit", (code)=>{
//     console.log(`Python script exited with code ${code}`);
// });

// const pythonScriptPath = "scraper/LI/scrape_lipost.py";
// const child = spawn("python3", [pythonScriptPath], {
//     stdio: "inherit",
// }); //spawn py script and use same input/output as Node.js process