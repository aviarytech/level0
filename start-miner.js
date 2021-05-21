const { startWorkQueue } = require("./redis");
// import { DocumentLoaderGetter } from "./documentLoader/documentLoader";
const { documentLoader } = require("./documentLoader");

(async () => {
  // const documentLoader = DocumentLoaderGetter.get();
  await startWorkQueue(documentLoader);
})();
