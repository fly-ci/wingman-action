import { setSecret, info, setFailed, notice } from "@actions/core";

import { getAccessToken } from "../utils";
import { generateSuggestions } from "../suggestions";
import { WingmanClient } from "../wingman";
import { run } from "../action";

jest.mock("@actions/core", () => ({
  info: jest.fn(),
  setFailed: jest.fn(),
  setSecret: jest.fn(),
  notice: jest.fn(),
}));

jest.mock("../wingman", () => ({
  WingmanClient: {
    download: jest.fn(),
  },
}));

jest.mock("../utils", () => ({
  getAccessToken: jest.fn(),
}));

jest.mock("../suggestions", () => ({
  generateSuggestions: jest.fn(),
}));

describe("wingman action run", () => {
  const mockGetAccessToken = getAccessToken as jest.Mock;
  const mockDownloadWingmanClient = WingmanClient.download as jest.Mock;

  const mockWingmanRun = jest.fn();

  mockDownloadWingmanClient.mockResolvedValue({ run: mockWingmanRun });

  beforeEach(() => jest.clearAllMocks());

  it("when Wingman successfully executed should generate suggestions", async () => {
    const accessToken = "my-token";
    const resultFilePath = "/wingman/result/file";

    mockGetAccessToken.mockResolvedValueOnce(accessToken);

    mockWingmanRun.mockResolvedValueOnce(resultFilePath);

    await run();

    expect(notice).toHaveBeenCalledExactlyOnceWith(
      "FlyCI Wingman Action uses a generative AI to fix your build errors by creating suggestions to your pull requests. Join our Discord Community at https://discord.com/invite/JyCjh439da to get help, request features, and share feedback. Alternatively, send us an email at support@flyci.net.",
      {
        title: "FlyCI Wingman Notice",
      },
    );

    expect(mockGetAccessToken).toHaveBeenCalledOnce();

    expect(setSecret).toHaveBeenCalledAfter(mockGetAccessToken);
    expect(setSecret).toHaveBeenCalledExactlyOnceWith(accessToken);

    expect(mockDownloadWingmanClient).toHaveBeenCalledExactlyOnceWith(
      accessToken,
    );

    expect(generateSuggestions).toHaveBeenCalledExactlyOnceWith(
      accessToken,
      resultFilePath,
    );

    expect(info).toHaveBeenLastCalledWith("Success!");
  });

  it("when unable to obtain access token  should set action as failed", async () => {
    mockGetAccessToken.mockResolvedValueOnce(undefined);

    await run();

    expect(setFailed).toHaveBeenCalledExactlyOnceWith(
      'Wingman: Encountered an expected error "Unable to obtain Wingman access token"',
    );
  });
});
