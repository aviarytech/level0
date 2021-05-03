const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { getInfo, getHash, addRotation, deleteHash, reset, explainDB } = require("./database");
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
  try {
    const { target, source, data, username } = req.body;

    if (typeof data === "object") {
      const rdf = await jsonld.toRDF(data);

      let i = 0;
      for (const line of rdf) {
        console.log(`mining something new`);
        rsmq.sendMessage(
          {
            qname: "workqueue",
            message: JSON.stringify({
              subject: line.subject.value,
              predicate: line.predicate.value,
              object: line.object.value,
            }),
          },
          function (err, resp) {
            if (err) {
              console.error(err);
              return;
            }

            console.log("Message sent. ID:", resp);
          }
        );
        i++;
      }

      res.send(`mined ${i} triples`);
    } else if (typeof data === "string") {
      await mineAndInsertValue(source, data, username);
      res.send("ok");
    }
  } catch {
    res.send(400);
  }
});

app.post("/destroy", async (req, res) => {
  await reset();
  res.send("ok");
});

app.get("/info", async (req, res) => {
  res.send(await getInfo());
});

app.get("/explain", async (req, res) => {
  res.send(await explainDB());
});

app.get("/:hashFilename", async (req, res) => {
  const [hash, fileType] = req.params.hashFilename.split(".");
  const { limit } = req.query;
  try {
    const result = await getHash(hash, limit);
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
