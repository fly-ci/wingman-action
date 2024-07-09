import { setupServer } from "msw/node";

import type { RequestHandler } from "msw";

export const startServer = (...handlers: Array<RequestHandler>) => {
  const server = setupServer(...handlers);

  server.listen();

  return {
    [Symbol.dispose]() {
      server.close();
    },
  };
};
