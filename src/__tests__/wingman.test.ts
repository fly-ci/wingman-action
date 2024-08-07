import os from "node:os";
import p from "node:path";
import fs from "node:fs/promises";

import { downloadTool } from "@actions/tool-cache";
import { exec } from "@actions/exec";

import { WingmanClient } from "../wingman";
import { getFlyCIUrl, getWingmanUrl } from "../utils";

jest.mock("@actions/tool-cache");
jest.mock("@actions/exec");

jest.mock("node:fs/promises");
jest.mock("node:os");

describe("WingmanClient", () => {
  const wingmanUrlEnv = "INPUT_WINGMAN_URL";
  const tmpPath = "/tmp/path";
  const path = "/path/to/wingman";
  const accessToken = "secret-access-token";
  const mockDownloadTool = downloadTool as jest.Mock;
  const mockExec = exec as jest.Mock;

  const downloadWingman = async () => {
    mockDownloadTool.mockResolvedValueOnce(path);

    return WingmanClient.download(accessToken);
  };

  const runnerTempOrig: string | undefined = process.env["RUNNER_TEMP"];

  beforeEach(() => jest.clearAllMocks());

  beforeAll(() => {
    process.env["RUNNER_TEMP"] = tmpPath;
  });

  afterAll(() => {
    process.env["RUNNER_TEMP"] = runnerTempOrig;
  });

  describe("download", () => {
    it.each`
      platform    | arch       | expectedPath
      ${"win32"}  | ${"x86"}   | ${p.join(tmpPath, "wingman.exe")}
      ${"linux"}  | ${"x86"}   | ${p.join(tmpPath, "wingman")}
      ${"darwin"} | ${"arm64"} | ${p.join(tmpPath, "wingman")}
    `(
      "should download wingman agent and create the client for $platform/$arch",
      async ({ platform, arch, expectedPath }) => {
        (os.platform as jest.Mock).mockReturnValueOnce(platform);
        (os.arch as jest.Mock).mockReturnValueOnce(arch);

        const wingman = await downloadWingman();

        expect(wingman).toBeInstanceOf(WingmanClient);
        expect(mockDownloadTool).toHaveBeenCalledExactlyOnceWith(
          `${getFlyCIUrl("/download-wingman")}?platform=${platform}&arch=${arch}`,
          expectedPath,
          `Bearer ${accessToken}`,
        );

        expect(fs.chmod).toHaveBeenCalledExactlyOnceWith(path, "777");
      },
    );
  });

  describe("run", () => {
    afterEach(() => {
      delete process.env[wingmanUrlEnv];
    });
    it("when wingman execution exits with non-zero exit code should throw error", async () => {
      mockExec.mockResolvedValueOnce(1);

      const wingman = await downloadWingman();

      await expect(wingman.run()).toReject();

      expect(exec).toHaveBeenCalledExactlyOnceWith(path, [], {
        env: expect.objectContaining({
          LLM_SERVER_URL: getWingmanUrl(),
          LLM_API_KEY: accessToken,
          FLYCI_WINGMAN_OUTPUT_FILE: p.join(tmpPath, "wingman.json"),
        }),
      });
    });

    it("when wingman url input is set should use it", async () => {
      process.env[wingmanUrlEnv] = "mock-url";
      mockExec.mockResolvedValueOnce(0);

      const wingman = await downloadWingman();

      await wingman.run();

      expect(exec).toHaveBeenCalledExactlyOnceWith(path, [], {
        env: expect.objectContaining({
          LLM_SERVER_URL: "mock-url",
        }),
      });
    });

    it("when wingman execution exits with 0 exit code should return the output file path", async () => {
      mockExec.mockResolvedValueOnce(0);

      const wingman = await downloadWingman();

      const resultPath = await wingman.run();

      expect(resultPath).toBe(p.join(tmpPath, "wingman.json"));
    });
  });
});
