import log4js from "log4js";

// Configure log4js
log4js.configure({
  appenders: {
    console: { type: "console" },
    file: { type: "file", filename: "logs/app.log" },
  },
  categories: {
    default: { appenders: ["console", "file"], level: "debug" },
    service: { appenders: ["console", "file"], level: "debug" },
  },
});

// Create a logger
export const logger = log4js.getLogger("service");

// Ensure shutdown is handled
process.on("exit", () => {
  log4js.shutdown();
});
