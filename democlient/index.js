import { nostrclient } from "./nostreclient.js";

const config = {
    signer_iframe_uri: "../signer.html",
    form_uri: "./forms/schemas/nip52-calendar.json",
    // Beispiele:
    // form_uri: "./forms/schemas/kind1.json",
    // form_uri: "./forms/schemas/kind30023.json",
    // form_uri: "./forms/schemas/nip52-calendar.json",
    relays: [],
    allow_nip07: false
};

nostrclient.init({ config }).catch((error) => {
    console.error("nostrclient init failed:", error);
});
