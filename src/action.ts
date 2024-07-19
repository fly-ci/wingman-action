import assert from "node:assert";

import { info, setFailed, setSecret, notice } from "@actions/core";

import { WingmanClient } from "./wingman";
import { getAccessToken } from "./utils";
import { generateSuggestions } from "./suggestions";

const DISCORD_CHANNEL_URL = "https://discord.com/invite/JyCjh439da";
const FLYCI_SUPPORT_EMAIL = "support@flyci.net";

export const run = async (): Promise<void> => {
  try {
    notice(
      `FlyCI Wingman Action uses a generative AI to fix your build errors by creating suggestions to your pull requests. Join our Discord Community at ${DISCORD_CHANNEL_URL} to get help, request features, and share feedback. Alternatively, send us an email at ${FLYCI_SUPPORT_EMAIL}.`,
      {
        title: "FlyCI Wingman Notice",
      },
    );
    info("Obtaining Wingman access token...");
    const accessToken = await getAccessToken();

    assert(accessToken, "Unable to obtain Wingman access token");

    setSecret(accessToken);

    info(`Downloading Wingman...`);
    const wingman = await WingmanClient.download(accessToken);

    info("Running Wingman...");
    const resultFilePath = await wingman.run();

    info("Generating suggestions...");
    await generateSuggestions(accessToken, resultFilePath);

    info("Success!");
  } catch (error) {
    setFailed(
      `Wingman: Encountered an expected error "${(error as Error).message}"`,
    );
  }
};
