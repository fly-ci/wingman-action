import esbuild from "esbuild";

/**
 * @type {import("esbuild").BuildOptions}
 */
const config = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/index.js",
  platform: "node",
  target: "node20",
  logLevel: "info",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
};

await esbuild.build(config);
