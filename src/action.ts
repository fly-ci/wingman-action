import assert from "node:assert";

import { info, setFailed, setSecret } from "@actions/core";

import { WingmanClient } from "./wingman";
import { getAccessToken } from "./utils";
import { generateSuggestions } from "./suggestions";

export const run = async (): Promise<void> => {
  try {
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
