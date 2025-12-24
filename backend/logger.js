const fs = require('fs');
const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');

// Create logs folder if it doesn't exist
const logDir = path.join(__dirname, './logs'); // adjust path if needed
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Info transport
const infoTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'info-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxFiles: '14d',
  level: 'info'
});

// Error transport
const errorTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxFiles: '14d',
  level: 'error'
});

const logger = winston.createLogger({
  level: 'info',
  transports: [infoTransport, errorTransport],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
});

module.exports = logger;
