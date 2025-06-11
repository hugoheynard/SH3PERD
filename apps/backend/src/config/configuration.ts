export default () => ({
  atlasUri: process.env.ATLAS_URI,
  dbName: process.env.DB_NAME,
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET,
});