import { nostrclient } from "./nostreclient.js";

window.nostrclient = nostrclient;

const config = {
    signer_iframe_uri: "../signer.html",
    // Ohne form_uri wird kein Formular gerendert.
    // Custom Events dann per API senden:
    // const signed = await nostrclient.signEvent(unsignedEvent);
    // await nostrclient.publishSignedEvent(signed);
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
