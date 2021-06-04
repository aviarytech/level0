const Redis = require("ioredis");
const jsonld = require("jsonld");
const { sha256 } = require("./utils");

const host = process.env.REDIS_HOST || "127.0.0.1";
const password = process.env.PASSWORD || "";
// const { DocumentLoader } = require("./documentLoader/documentLoader");

const client =
  host === "127.0.0.1"
    ? new Redis({
        host,
        password,
      })
    : new Redis.Cluster(
        [
          {
            host,
          },
        ],
        { scaleReads: "slave", redisOptions: { password } }
      );

client.on("error", function (error) {
  console.error(error);
});

const getInfo = async () => {
  const keys = await client.keys("*");
  return { count: keys.length, keys: keys };
};

const addRotation = async (hash, body) => {
  try {
    const rotation = body.rotation;

    if (Object.keys(body).length > 1) {
      const resp = await client.hset(hash, rotation, JSON.stringify(body));
      return resp === 0;
    } else {
      console.log("no body to add");
      return null;
    }
  } catch (e) {
    console.log(e);
    return null;
  }
};

const getHash = async (hash) => {
  try {
    const hashes = await client.hgetall(hash);
    let vals = [];
    if (hashes) {
      for (const [key, value] of Object.entries(hashes)) {
        vals.push(JSON.parse(value));
      }
    }
    return vals;
  } catch (e) {
    console.log(e);
    return null;
  }
};

const deleteHash = async (hash) => {
  return await client.del(hash);
};

const reset = async () => {
  return await client.flushall();
};

const addToQueue = async (url) => {
  return await client.rpush("url-work", url);
};

const insertValue = async (hash, val) => {
  return await client.set(hash, val);
};

const mineWork = async (source, datahash, target) => {
  let n = 0;
  let rotation = sha256(source + datahash + n);
  let max = 500;

  while (rotation.substr(0, target.length) !== target) {
    n++;
    rotation = sha256(source + datahash + n);
    if (max > 500)
      return { n: 0, rotation: "a510000000000000000000000000000000000000000000000000000000000000" };
  }

  return { n, rotation };
};

const mineAndInsertValue = async (source, data, username = "anonymous", target = TARGET) => {
  if (!source || !data) {
    throw Error("no source or data found to mine");
  }
  const datahash = sha256(data);
  const { n, rotation } = await mineWork(source, datahash, target);
  const newRotation = {
    source,
    data,
    datahash,
    n,
    target,
    rotation,
    username,
  };
  try {
    console.log(`source: ${source}, rotation: ${JSON.stringify(newRotation)}`);
    await addRotation(source, newRotation);
    await addRotation(sha256(source), newRotation);
    return true;
  } catch (e) {
    console.log(e);
    throw Error(`Failed to mine on ${source}`);
  }
};

const mineTriple = async (subject, predicate, obj) => {
  let subjHash = sha256(subject);
  let predHash = sha256(predicate);
  const predicateSource = await getHash(predHash);
  if (!predicateSource) {
    console.log(`mining new predicate: ${predicate}`);
    return await mineAndInsertValue(predHash, predicate, "anonymous", "21e8");
  }
  return await mineAndInsertValue(subject, obj, "anonymous", predHash.substr(0, 5));
};

const startWorkQueue = async (documentLoader) => {
  for (;;) {
    const item = await client.blpop("url-work", 0);
    try {
      const result = await documentLoader(item[1]);

      const rdf = await jsonld.toRDF(result.document);
      for (const line of rdf) {
        const mined = await mineTriple(line.subject.value, line.predicate.value, line.object.value);
      }
    } catch (e) {
      console.log(e);
    }
  }
};

module.exports = {
  addRotation,
  getHash,
  deleteHash,
  getInfo,
  reset,
  addToQueue,
  startWorkQueue,
  insertValue,
};
