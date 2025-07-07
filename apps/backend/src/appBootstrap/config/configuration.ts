export default (): {
  ATLAS_URI: string | undefined;
  CORE_DB_NAME: string | undefined;
  port: number;
  jwtSecret: string | undefined;
} => ({
  ATLAS_URI: process.env['ATLAS_URI'],
  CORE_DB_NAME: process.env['CORE_DB_NAME'],
  port: parseInt(process.env['PORT'] || '3000', 10),
  jwtSecret: process.env['JWT_SECRET'],
});
