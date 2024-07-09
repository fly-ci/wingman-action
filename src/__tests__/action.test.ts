import { setSecret, info, setFailed } from "@actions/core";

import { getAccessToken } from "../utils";
import { generateSuggestions } from "../suggestions";
import { WingmanClient } from "../wingman";
import { run } from "../action";

jest.mock("@actions/core", () => ({
  info: jest.fn(),
  setFailed: jest.fn(),
  setSecret: jest.fn(),
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
  const mockGenerateSuggestions = generateSuggestions as jest.Mock;
  const mockSetSecret = setSecret as jest.Mock;
  const mockInfo = info as jest.Mock;
  const mockSetFailed = setFailed as jest.Mock;
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

    expect(mockGetAccessToken).toHaveBeenCalledOnce();

    expect(mockSetSecret).toHaveBeenCalledAfter(mockGetAccessToken);
    expect(mockSetSecret).toHaveBeenCalledExactlyOnceWith(accessToken);

    expect(mockDownloadWingmanClient).toHaveBeenCalledExactlyOnceWith(
      accessToken,
    );

    expect(mockGenerateSuggestions).toHaveBeenCalledExactlyOnceWith(
      accessToken,
      resultFilePath,
    );

    expect(mockInfo).toHaveBeenLastCalledWith("Success!");
  });

  it("when unable to obtain access token  should set action as failed", async () => {
    mockGetAccessToken.mockResolvedValueOnce(undefined);

    await run();

    expect(mockSetFailed).toHaveBeenCalledExactlyOnceWith(
      'Wingman: Encountered an expected error "Unable to obtain Wingman access token"',
    );
  });
});
