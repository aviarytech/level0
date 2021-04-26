const level = require("level");
const express = require("express");

const bodyParser = require("body-parser");
const cors = require("cors");

const db = level("./db", { valueEncoding: "json" });
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/:hashFilename", async (req, res) => {
  const [hash, fileType] = req.params.hashFilename.split(".");
  try {
    const hashFile = await db.get(hash);
    res.send([...hashFile]);
  } catch (e) {
    res.status(404).send("Sorry can't find that!");
  }
});

app.post("/:hashFilename", async (req, res) => {
  const [hash, fileType] = req.params.hashFilename.split(".");
  try {
    const currFile = (await db.get(hash)).filter((h) => h.rotation !== req.body.rotation);
    res.send(await db.put(hash, [...currFile, req.body]));
  } catch (e) {
    res.send(await db.put(hash, [req.body]));
  }
});

app.delete("/:hashFilename", async (req, res) => {
  const [hash, fileType] = req.params.hashFilename.split(".");
  try {
    res.send(await db.del(hash));
  } catch (e) {
    console.log(e);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
