/**
 * TypeScript declaration for SVG imports.
 *
 * Angular's esbuild builder is configured (in `angular.json` via
 * `"loader": { ".svg": "text" }`) to treat SVG files as text — importing
 * `./foo.svg` returns the file contents as a string.
 */
declare module '*.svg' {
  const content: string;
  export default content;
}
