#! /usr/bin/env node
const yargs = require("yargs");
const usage = "\nUsage: cldi <lang_name> sentence to be translated";
const options = yargs.usage(usage).option("l", {
    alias: "languages", 
    describe:"List all supported languages.",
    type: "boolean",
    demandOption: false
}).help(true).argv;

console.log("Hello world");