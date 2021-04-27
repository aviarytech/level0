const winston = require("winston");

const logConfiguration = {
  transports: [
    new winston.transports.Console({
      level: "info",
    }),
    new winston.transports.File({
      level: "info",
      // Create the log directory if it does not exist
      filename: "logs/example.log",
    }),
  ],
};

const logger = winston.createLogger(logConfiguration);

module.exports = logger;
