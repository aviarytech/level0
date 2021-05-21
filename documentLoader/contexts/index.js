const SCHEMA_ORG_JSON = require("./schema-org.json");
const W3ID_SECURITY_BBS_JSON = require("./bbs-v1.json");
const W3ID_TRACEABILITY_JSON = require("./traceability-v1.json");
const VC_JSON = require("./vcs-v1.json");
const DID_JSON = require("./did-v1.json");
const SEC_V1_JSON = require("./sec-v1.json");
const SEC_V2_JSON = require("./sec-v2.json");
// import * as SEC_V3_JSON from './sec-v3.json';

const SCHEMA_ORG_URL = "http://schema.org/";
const BBS_URL = "https://w3id.org/security/bbs/v1";
const TRACEABILITY_URL = "https://w3id.org/traceability/v1";
const VC_URL = "https://www.w3.org/2018/credentials/v1";
const DID_URL = "https://www.w3.org/ns/did/v1";
// const SEC_URL = 'https://w3id.org/security';
const SEC_URL_V1 = "https://w3id.org/security/v1";
const SEC_URL_V2 = "https://w3id.org/security/v2";
// const SEC_URL_V3 = 'https://w3id.org/security/v3';

const CONTEXT_MAP = {
  [SCHEMA_ORG_URL]: SCHEMA_ORG_JSON,
  [BBS_URL]: W3ID_SECURITY_BBS_JSON,
  [TRACEABILITY_URL]: W3ID_TRACEABILITY_JSON,
  [VC_URL]: VC_JSON,
  [DID_URL]: DID_JSON,
  // [SEC_URL]: SEC_V3_JSON,
  [SEC_URL_V1]: SEC_V1_JSON,
  [SEC_URL_V2]: SEC_V2_JSON,
  // [SEC_URL_V3]: SEC_V3_JSON,
};

module.exports = { map: CONTEXT_MAP };
