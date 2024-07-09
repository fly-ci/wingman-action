import { HttpResponse, http } from "msw";

import { FLYCI_URL, getAccessToken, getFlyCIUrl, getTempDir } from "../utils";
import { startServer } from "../tests/msw";

const mockGetInput = jest.fn();
const mockGetIDToken = jest.fn();

jest.mock("@actions/core", () => ({
  getIDToken: jest.fn((aud) => mockGetIDToken(aud)),
  getInput: jest.fn((name) => mockGetInput(name)),
}));

describe("getFlyCIUrl", () => {
  it("when NO flyci-url input should return default FlyCI API URL", () => {
    expect(getFlyCIUrl()).toBe(FLYCI_URL);
  });

  it("when flyci-url input exists should use the input URL", () => {
    const flyciUrl = "https://test.flyci";
    mockGetInput.mockReturnValueOnce(flyciUrl);

    expect(getFlyCIUrl("/api")).toBe(`${flyciUrl}/api`);
  });
});

describe("getTempDir", () => {
  const runnerTempOrig: string | undefined = process.env["RUNNER_TEMP"];

  afterAll(() => {
    process.env["RUNNER_TEMP"] = runnerTempOrig;
  });

  it("when RUNNER_TEMP environment variable is NOT set should throw an error", () => {
    delete process.env["RUNNER_TEMP"];

    expect(() => getTempDir()).toThrow();
  });

  it("when RUNNER_TEMP environment variable is set should return the value", () => {
    process.env["RUNNER_TEMP"] = "/tmp/dir/123";

    expect(getTempDir()).toBe("/tmp/dir/123");
  });
});

describe("getAccessToken", () => {
  it("should use GitHub OIDC Token to retrieve a FlyCI access token", async () => {
    const oidcToken = "oidc-token";
    const expectedAccessToken = "expected-access-token";

    mockGetIDToken.mockResolvedValueOnce(oidcToken);

    const interceptor = http.get(getFlyCIUrl("/oidc-auth"), ({ request }) => {
      expect(request.headers.get("Authorization")).toEqual(
        `Bearer ${oidcToken}`,
      );

      return HttpResponse.json({ token: expectedAccessToken });
    });

    using _ = startServer(interceptor);

    const accessToken = await getAccessToken();

    expect(mockGetIDToken).toHaveBeenCalledExactlyOnceWith(FLYCI_URL);

    expect(accessToken).toBe(expectedAccessToken);
  });
});
