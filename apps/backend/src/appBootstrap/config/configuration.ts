export default (): {
  ATLAS_URI: string | undefined;
  CORE_DB_NAME: string | undefined;
  port: number;
  jwtSecret: string | undefined;
  slackClientId: string | undefined;
  slackClientSecret: string | undefined;
  slackRedirectUri: string | undefined;
  frontendUrl: string;
} => ({
  ATLAS_URI: process.env['ATLAS_URI'],
  CORE_DB_NAME: process.env['CORE_DB_NAME'],
  port: parseInt(process.env['PORT'] || '3000', 10),
  jwtSecret: process.env['JWT_SECRET'],
  slackClientId: process.env['SLACK_CLIENT_ID'],
  slackClientSecret: process.env['SLACK_CLIENT_SECRET'],
  slackRedirectUri: process.env['SLACK_REDIRECT_URI'],
  frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:4200',
});
