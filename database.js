const level = require("level");

// 1) Create our store
const logger = require("./logger");
const db = level("./db", { valueEncoding: "json" });

const getInfo = async () => {
  let keys = [];
  const stream = db.createReadStream({ keys: true, values: false });
  for await (const key of stream) {
    keys = [...keys, key];
  }
  return { keys: keys.length };
};

const addRotation = async (hash, body) => {
  try {
    const stream = db.createReadStream({ lt: hash + 1, gt: hash - 1 });
    let values = [];
    for await (const value of stream) {
      values = value.value.filter((h) => h.rotation !== body.rotation);
    }
    return await db.put(hash, [...values, body]);
  } catch (e) {
    console.log("err:", e.message.substr(0, 75));
  }
};

const getHash = async (hash) => {
  try {
    return await db.get(hash);
  } catch (e) {
    return null;
  }
};

const deleteHash = async (hash) => {
  return await db.del(hash);
};

const reset = async () => {
  return await db.clear();
};

module.exports = { addRotation, getHash, deleteHash, getInfo, reset };
