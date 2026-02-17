import { nostrclient } from "./nostreclient.js";

const config = {
    signer_iframe_uri: "../signer.html",
    relays: [],
    allow_nip07: false
};

nostrclient.init({ config }).catch((error) => {
    console.error("nostrclient init failed:", error);
});