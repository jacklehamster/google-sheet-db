async function bundle() {
  return await Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    minify: false,
    sourcemap: "external",
    target: "bun",
    format: 'esm', // Explicitly output ESM
  });
}

const result = await bundle();
result?.logs.forEach((log, index) => console.log(index, log));

export { }
