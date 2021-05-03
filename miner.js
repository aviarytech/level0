const { addRotation, getHash } = require("./database");
const { sha256 } = require("./utils");

const TARGET = "21e8";

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
    console.log(`rotation: ${JSON.stringify(newRotation)}`);
    return await addRotation(source, newRotation);
  } catch {
    throw Error(`Failed to mine on ${source}`);
  }
};

const mineTriple = async (subject, predicate, obj) => {
  let subjHash = sha256(subject);
  let predHash = sha256(predicate);
  const predicateSource = await getHash(predHash);
  if (!predicateSource) {
    console.log(`mining new predicate: ${predicate}`);
    await mineAndInsertValue(predHash, predicate, "anonymous", "21e8");
  }

  await mineAndInsertValue(subjHash, obj, "anonymous", predHash.substr(0, 5));
};

const mineJson = async (source, inputDoc) => {
  if (Array.isArray(inputDoc)) {
    inputDoc.forEach(async (d, i) => {
      await mineJson(source, d);
    });
  } else {
    console.log("test");

    console.log(canonized);
  }
};

const mineObj = async (source, obj) => {
  for (const key of Object.keys(obj)) {
    let hashes = await getHash(sha256(key), 1);
    if (!hashes) {
      hashes = await mineAndInsertValue(source, key);
    }
    const rotation = hashes[0];
    let val;
    if (typeof obj[key] === "object") {
      await mineObj(rotation.rotation, obj[key]);
    } else if (typeof obj[key] === "string") {
      await mineAndInsertValue(rotation.rotation, obj[key]);
    }
  }
};

module.exports = { mineWork, mineJson, mineAndInsertValue, mineTriple };
