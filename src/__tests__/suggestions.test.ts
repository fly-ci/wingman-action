import * as fs from "node:fs/promises";

import { http, HttpResponse } from "msw";

import { getFlyCIUrl } from "../utils";
import { startServer } from "../tests/msw";
import { generateSuggestions } from "../suggestions";

jest.mock("node:fs/promises");

const startFlyCIServer = (accessToken: string, response: HttpResponse) => {
  const interceptor = http.post(
    getFlyCIUrl("/wingman/patch"),
    ({ request }) => {
      expect(request.headers.get("Authorization")).toEqual(
        `Bearer ${accessToken}`,
      );

      return response;
    },
    { once: true },
  );

  return startServer(interceptor);
};

describe("generateSuggestions", () => {
  (fs.readFile as jest.Mock).mockResolvedValue(
    JSON.stringify({ message: "ping" }),
  );

  beforeEach(() => jest.clearAllMocks());

  it("when /wingman/patch response is OK should now throw", async () => {
    const expectedAccessToken = "token-123";
    const filePath = "/test/file";
    using _ = startFlyCIServer(
      expectedAccessToken,
      HttpResponse.json({ message: "pong" }),
    );

    await expect(
      generateSuggestions(expectedAccessToken, filePath),
    ).toResolve();
  });

  it("when /wingman/patch response is NOT OK should throw", async () => {
    const expectedAccessToken = "token-123";
    const filePath = "/test/file";

    using _ = startFlyCIServer(expectedAccessToken, HttpResponse.error());

    await expect(generateSuggestions(expectedAccessToken, filePath)).toReject();
  });
});
