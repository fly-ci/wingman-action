import assert from "node:assert";
import os from "node:os";
import p from "node:path";
import fs from "node:fs/promises";

import { exec } from "@actions/exec";
import { downloadTool } from "@actions/tool-cache";

import { getFlyCIUrl, getTempDir, getWingmanUrl } from "./utils";

const getWingmanDestinationPath = (platform: string) => {
  return p.format({
    dir: getTempDir(),
    name: "wingman",
    ext: platform === "win32" ? ".exe" : "",
  });
};

export class WingmanClient {
  private constructor(
    private path: string,
    private accessToken: string,
  ) {}

  static async download(accessToken: string): Promise<WingmanClient> {
    const platform = os.platform();
    const searchParams = new URLSearchParams({
      platform: encodeURIComponent(platform),
      arch: encodeURIComponent(os.arch()),
    });

    const path = await downloadTool(
      getFlyCIUrl(`/download-wingman?${searchParams.toString()}`),
      getWingmanDestinationPath(platform),
      `Bearer ${accessToken}`,
    );

    await fs.chmod(path, "777");

    return new WingmanClient(path, accessToken);
  }

  run = async () => {
    console.log("running");
    const env = {
      ...process.env,
      LLM_SERVER_URL: getWingmanUrl(),
      LLM_API_KEY: this.accessToken,
      FLYCI_WINGMAN_OUTPUT_FILE: p.join(getTempDir(), "wingman.json"),
    };

    const exitCode = await exec(this.path, [], {
      env,
    });

    assert(exitCode === 0, "Wingman execution failed");

    return env.FLYCI_WINGMAN_OUTPUT_FILE;
  };
}
