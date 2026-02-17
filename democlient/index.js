import { nostreclient } from "./nostreclient.js";

const config = {
    signer_iframe_uri: "../signer.html",
    relays: [],
    allow_nip07: false
};

nostreclient.init({ config }).catch((error) => {
    console.error("nostreclient init failed:", error);
});
