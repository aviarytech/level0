const { JsonLdDocumentLoader } = require("jsonld-document-loader");
const { map } = require("./contexts");
const axios = require("axios");

const jdl = new JsonLdDocumentLoader();

for (const key of Object.keys(map)) {
  // console.log(map[key]);
  jdl.addStatic(key, map[key]);
}

jdl.setProtocolHandler({
  protocol: "http",
  handler: {
    async get({ url }) {
      try {
        const resp = await axios.get(url);
        // return await axios.get(url);
        if (resp.data.length > 0) {
          return JSON.parse(resp.data[0].data);
        }
        return null;
      } catch {
        return null;
      }
    },
  },
});
// jdl.addStatic(ed25519Ctx.CONTEXT_URL, ed25519Ctx.CONTEXT);

const documentLoader = jdl.build();

module.exports = {
  documentLoader: documentLoader,
};
