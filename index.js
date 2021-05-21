const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const {
  getInfo,
  getHash,
  addRotation,
  deleteHash,
  reset,
  addToQueue,
  insertValue,
} = require("./redis");
const { mineAndInsertValue, mineTriple } = require("./miner");
const { sha256 } = require("./utils");
const logger = require("./logger");
const jsonld = require("jsonld");
const RedisSMQ = require("rsmq");
const rsmq = new RedisSMQ({ host: "127.0.0.1", port: 6379, ns: "rsmq" });

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true }));

app.post("/mine", async (req, res) => {
  // console.log(`request received:`, req.body);
  try {
    const { target, source, data, username } = req.body;

    if (typeof data === "object") {
      for (let line of data) {
        const datahash = sha256(JSON.stringify(line));
        const source1 = "";
        const url = `http://localhost:3000/${datahash}.json`;
        const urlHash = sha256(url);
        const rotation1 = sha256(source1 + urlHash + 51);
        const newData = JSON.stringify({ "@id": url, ...line });
        await addRotation(sha256(source1), {
          rotation: rotation1,
          data: url,
          source: source1,
          datahash: urlHash,
          n: 51,
          target: rotation1.substr(0, 4),
          username: "anonymous",
        });

        const rotation2 = sha256(url + datahash + 51);
        const body = {
          rotation: rotation2,
          data: newData,
          source: url,
          datahash: datahash,
          n: 51,
          target: rotation2.substr(0, 4),
          username: "anonymous",
        };
        await addRotation(datahash, body);
        await addRotation(rotation2, body);

        // console.log(datahash);

        // await insertValue(line["id"], JSON.toString(line));

        await addToQueue(url);

        // const rdf = await jsonld.toRDF(data);
        // console.log(rdf);

        // let i = 0;
        // for (const line of rdf) {
        //   await addToWorkQueue(line.subject.value, line.predicate.value, line.object.value);
        //   // await mineTriple(line.subject.value, line.predicate.value, line.object.value);
        //   i++;
        // }
      }
    } else if (typeof data === "string") {
      await mineAndInsertValue(source, data, username);
    }
  } catch (e) {
    console.log(e);
  }
  res.send("ok");
});

app.post("/destroy", async (req, res) => {
  await reset();
  res.send("ok");
});

app.get("/info", async (req, res) => {
  res.send(await getInfo());
});

app.get("/:hashFilename", async (req, res) => {
  const [hash, fileType] = req.params.hashFilename.split(".");
  const { limit } = req.query;
  try {
    const result = await getHash(hash, limit);
    if (result.length > 0) {
      res.send([...result]);
    } else {
      res.status(404).send("Not found");
    }
  } catch (e) {
    res.status(404).send("Sorry can't find that!");
  }
});

app.post("/:hashFilename", async (req, res) => {
  const [hash, fileType] = req.params.hashFilename.split(".");
  const isNew = await addRotation(hash, req.body);
  return res.send("ok");
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
