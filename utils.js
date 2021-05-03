const crypto = require("crypto");

const sha256 = (val) => {
  return crypto.createHash("sha256").update(val).digest("hex");
};

module.exports = { sha256 };
