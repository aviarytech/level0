const chokidar = require("chokidar");
const axios = require("axios");
const fs = require("fs");
const path = require('path');

// Initialize watcher.
const watcher = chokidar.watch("C:/Users/brian/Downloads/[a-z0-9]**.json", {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
});
// Something to use when events are received.
const log = console.log.bind(console);
// Add event listeners.
watcher.on("add", async (filepath) => {
  log(`File ${filepath} has been added`);
  // Use fs.readFile() method to read the file
  fs.readFile(filepath, "utf8", async (err, data) => {
    const id = path.parse(filepath).name;
    try {
      JSON.parse(data).forEach(async (obj) => {
        console.log("sending!");
        try {
          await axios.post(`https://0.a51.io/${id}.json`, { ...obj });
        } catch (e) {
          console.log(e);
        }
      });
      fs.unlinkSync(filepath);
    } catch (e) {
      console.log(JSON.stringify(e));
      fs.unlinkSync(filepath);
    }
  });
});
