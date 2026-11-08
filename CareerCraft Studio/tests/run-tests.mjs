import { build } from 'vite';
import { run } from 'node:test';
import { spec } from 'node:test/reporters';

console.log('Compiling test suite with Vite...');

await build({
  build: {
    ssr: './tests/core-logic.test.mjs',
    outDir: './dist-test',
    emptyOutDir: true
  }
});

console.log('Running test bundle...');
const testStream = run({ files: ['./dist-test/core-logic.test.js'] });
testStream.compose(new spec()).pipe(process.stdout);
