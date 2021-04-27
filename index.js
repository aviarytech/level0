const express = require("express");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const cors = require("cors");
const { getInfo, getHash, addRotation, deleteHash } = require("./database");
const logger = require("./logger");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/mine", async (req, res) => {
  const { target, source, data, username } = req.body;

  const datahash = crypto.createHash("sha256").update(data).digest("hex");
  let n = 0;
  let rotation = crypto
    .createHash("sha256")
    .update(source + datahash + n)
    .digest("hex");

  while (rotation.substr(0, target.length) !== target) {
    n++;
    rotation = crypto
      .createHash("sha256")
      .update(source + datahash + n)
      .digest("hex");
  }

  await addRotation(source, {
    source,
    data,
    datahash,
    n,
    target,
    username: username ?? "anonymous",
    rotation,
  });

  res.append("Content-Type", "application/json; charset=UTF-8");
  res.send({ rotation });
});

app.get("/info", async (req, res) => {
  res.send(await getInfo());
});

app.get("/:hashFilename", async (req, res) => {
  const [hash, fileType] = req.params.hashFilename.split(".");
  try {
    const result = await getHash(hash);
    res.send([...result]);
  } catch (e) {
    res.status(404).send("Sorry can't find that!");
  }
});

app.post("/:hashFilename", async (req, res) => {
  const [hash, fileType] = req.params.hashFilename.split(".");
  return res.send(await addRotation(hash, req.body));
});

app.delete("/:hashFilename", async (req, res) => {
  const [hash, fileType] = req.params.hashFilename.split(".");
  try {
    res.send(await deleteHash(hash));
  } catch (e) {
    console.log(e);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
