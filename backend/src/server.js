require("dotenv").config();
const app = require("./app");
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

process.on("unhandledRejection", (reason) => { 
  console.error("Unhandled Rejection:", reason);
  server.close(() => process.exit(1)); 
});

process.on("uncaughtException", (error) => { 
  console.error("Uncaught Exception:", error);
  server.close(() => process.exit(1)); 
});