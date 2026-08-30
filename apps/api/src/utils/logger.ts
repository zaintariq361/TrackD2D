import winston from 'winston';
import path from 'path';
import fs from 'fs';

const isDev = process.env.NODE_ENV !== 'production';

// Ensure logs directory exists in production
if (!isDev) {
  const logsDir = path.resolve(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

const { combine, timestamp, colorize, printf, json, errors } = winston.format;

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${ts} [${level}]: ${stack || message}${metaStr}`;
  }),
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const transports: winston.transport[] = [];

if (isDev) {
  transports.push(new winston.transports.Console({ format: devFormat }));
} else {
  transports.push(
    new winston.transports.Console({ format: prodFormat }),
    new winston.transports.File({
      filename: path.resolve(process.cwd(), 'logs/error.log'),
      level: 'error',
      format: prodFormat,
    }),
    new winston.transports.File({
      filename: path.resolve(process.cwd(), 'logs/combined.log'),
      format: prodFormat,
    }),
  );
}

export const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  transports,
  exitOnError: false,
});

export default logger;
