const builder = require("electron-builder");
const process = require("process");
const dotenv = require("dotenv");

dotenv.config();

const identityName = process.env.IDENTITY_NAME;
const applicationId = process.env.APPLICATION_ID;
const publisherDisplayName = process.env.PUBLISHER_DISPLAY_NAME;
const publisher = process.env.PUBLISHER;
const languages = ["JA-JP", "EN-US"];

if (!(identityName && applicationId && publisherDisplayName && publisher)) {
  console.error(
    "env is missing. required: IDENTITY_NAME, APPLICATION_ID, PUBLISHER_DISPLAY_NAME, and PUBLISHER"
  );
  process.exit();
}

builder.build({
  config: {
    appId: "portablerg",
    productName: "portablerg",
    icon: "public/favicon.png",
    appx: {
      identityName,
      applicationId,
      publisherDisplayName,
      publisher,
      languages,
    },
    win: { target: "appx" },
  },
});
