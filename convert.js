#! /usr/local/bin/node
const fs = require("fs");

const data = fs.readFileSync("media/smiles.txt", "utf-8");

const lines = data.split('\n');
const chemicals = {};
lines.forEach(line => {
    const [name,smile] = line.split('\t');
    //console.log(name);
    //console.log("  is ",smile.trim());
    chemicals[name] = smile.trim();
});

const str = JSON.stringify(chemicals);

writeFile = fs.openSync("media/smiles.json", 'w');
fs.writeSync(writeFile, str);
fs.close(writeFile);
