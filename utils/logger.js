/**
 * Enterprise Structured Logger
 * Emits JSON-formatted log lines with timestamps, log levels, and contextual metadata.
 * Ready for log ingestion pipelines (Datadog, AWS CloudWatch, Grafana Loki, ELK).
 */

const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '../logs');
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function formatLog(level, message, meta = {}) {
    return JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        service: 'cruvels-ems',
        message,
        ...meta,
    });
}

function writeLog(level, message, meta) {
    const formatted = formatLog(level, message, meta);
    
    // In development / test, print formatted line
    if (level === 'ERROR') {
        console.error(formatted);
    } else {
        console.log(formatted);
    }

    // Append to daily log file for rotation
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(LOGS_DIR, `application-${today}.log`);
    fs.appendFile(logFile, formatted + '\n', (err) => {
        if (err) console.error('Failed to write to log file:', err);
    });
}

const logger = {
    info: (msg, meta) => writeLog('INFO', msg, meta),
    warn: (msg, meta) => writeLog('WARN', msg, meta),
    error: (msg, meta) => writeLog('ERROR', msg, meta),
    security: (msg, meta) => writeLog('SECURITY', msg, meta),
};

module.exports = logger;
