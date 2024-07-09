import assert from "node:assert";
import * as fs from "node:fs/promises";

import { HttpClient } from "@actions/http-client";
import { BearerCredentialHandler } from "@actions/http-client/lib/auth";

import { getFlyCIUrl } from "./utils";

export const generateSuggestions = async (
  accessToken: string,
  wingmanResultPath: string,
) => {
  const suggestions = JSON.parse(await fs.readFile(wingmanResultPath, "utf8"));

  const client = new HttpClient("wingman/patch", [
    new BearerCredentialHandler(accessToken),
  ]);

  const { statusCode } = await client.postJson(
    getFlyCIUrl("/wingman/patch"),
    suggestions,
  );

  assert(statusCode === 200, "Unable to apply suggestions!");
};
