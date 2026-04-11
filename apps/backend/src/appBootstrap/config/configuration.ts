export default (): {
  ATLAS_URI: string | undefined;
  CORE_DB_NAME: string | undefined;
  port: number;
  slackClientId: string | undefined;
  slackClientSecret: string | undefined;
  slackRedirectUri: string | undefined;
  frontendUrl: string;
  print: {
    secret: string;
    chromiumPath: string | undefined;
    poolSize: number;
    pageTimeoutMs: number;
    readySignalTimeoutMs: number;
  };
} => ({
  ATLAS_URI: process.env['ATLAS_URI'],
  CORE_DB_NAME: process.env['CORE_DB_NAME'],
  port: parseInt(process.env['PORT'] || '3000', 10),
  slackClientId: process.env['SLACK_CLIENT_ID'],
  slackClientSecret: process.env['SLACK_CLIENT_SECRET'],
  slackRedirectUri: process.env['SLACK_REDIRECT_URI'],
  frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:4200',
  print: {
    // Dedicated HMAC secret for single-use print JWTs.
    // Falls back to JWT_PRIVATE_KEY so dev setups work out of the box; set PRINT_SECRET
    // in production to decouple the print token surface from the main auth keys.
    secret: process.env['PRINT_SECRET'] ?? process.env['JWT_PRIVATE_KEY'] ?? 'dev-print-secret-change-me',
    // Override the Chromium binary — useful for Alpine/Lambda/slim containers
    // where you mount a layer or a system package instead of the bundled Chromium.
    chromiumPath: process.env['CHROMIUM_EXECUTABLE_PATH'],
    poolSize: parseInt(process.env['PRINT_POOL_SIZE'] ?? '2', 10),
    pageTimeoutMs: parseInt(process.env['PRINT_PAGE_TIMEOUT_MS'] ?? '30000', 10),
    readySignalTimeoutMs: parseInt(process.env['PRINT_READY_TIMEOUT_MS'] ?? '20000', 10),
  },
});
