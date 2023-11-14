import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import env from 'env';

const transportFile = new DailyRotateFile({
  filename: 'logs/app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '500m', // Optional: Maximum log file size before rotation
  maxFiles: '30d', // Optional: Maximum number of days to keep log files
});

const transports: any[] = [
  new winston.transports.Console(),
]

if (!env.PM2_HOME) {
  transports.push(transportFile);
}

const Logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    }),
  ),
  transports,
});

export { Logger };
