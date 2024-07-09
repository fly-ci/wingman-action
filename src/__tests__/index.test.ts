import * as a from "../action";

describe("index", () => {
  it("should run action", () => {
    const actionRunSpy = jest.spyOn(a, "run").mockImplementationOnce(jest.fn());

    jest.requireActual("../");

    expect(actionRunSpy).toHaveBeenCalledOnce();
  });
});
