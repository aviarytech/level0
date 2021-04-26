const chokidar = require("chokidar");
const axios = require("axios");
const fs = require("fs");

// Initialize watcher.
const watcher = chokidar.watch("/Users/brian/Downloads/[a-z0-9]**.json", {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
});
// Something to use when events are received.
const log = console.log.bind(console);
// Add event listeners.
watcher.on("add", async (path) => {
  log(`File ${path} has been added`);
  // Use fs.readFile() method to read the file
  fs.readFile(path, "utf8", async (err, data) => {
    const id = path.split("/").pop().split(".")[0];
    try {
      JSON.parse(data).forEach(async (obj) => {
        await axios.post(`https://0.aviary.one/${id}.json`, { ...obj });
      });
      fs.unlinkSync(path);
    } catch (e) {
      console.log(JSON.stringify(e));
    }
  });
});
