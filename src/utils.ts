import assert from "node:assert";

import * as core from "@actions/core";
import { HttpClient } from "@actions/http-client";
import { BearerCredentialHandler } from "@actions/http-client/lib/auth";

export const FLYCI_URL = "https://api.flyci.net";
export const WINGMAN_URL = "https://wingman.flyci.net";

export const getFlyCIUrl = (path: string = "") => {
  const url = core.getInput("flyci-url") || FLYCI_URL;

  return `${url}${path}`;
};

export const getWingmanUrl = () => core.getInput("wingman-url") || WINGMAN_URL;

const getOidcToken = () => core.getIDToken(getFlyCIUrl());

export const getAccessToken = async () => {
  const oidcToken = await getOidcToken();

  const authClient = new HttpClient("flyci/auth-client", [
    new BearerCredentialHandler(oidcToken),
  ]);

  const { result } = await authClient.getJson<{
    token: string;
  }>(getFlyCIUrl("/oidc-auth"));

  return result?.token;
};

export const getTempDir = () => {
  const tempDirectory = process.env["RUNNER_TEMP"] ?? "";
  assert(tempDirectory, "Expected RUNNER_TEMP to be defined");
  return tempDirectory;
};
