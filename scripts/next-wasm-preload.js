try {
  Object.defineProperty(process.versions, 'webcontainer', {
    value: '1',
    configurable: true,
    enumerable: true,
  });
} catch (error) {
  process.stderr.write(`Failed to enable Next.js wasm fallback: ${String(error)}\n`);
}
