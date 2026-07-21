const fs = require('fs');
const path = require('path');

/**
 * Logger Utility
 * Handles logging to both console and files
 */
class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../../logs');
        this.createLogDirectory();
    }

    /**
     * Create logs directory if it doesn't exist
     */
    createLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    /**
     * Get current timestamp
     */
    getTimestamp() {
        return new Date().toISOString();
    }

    /**
     * Write log entry
     */
    async writeLog(level, message, data = null) {
        const timestamp = this.getTimestamp();
        const logEntry = {
            timestamp,
            level,
            message,
            data: data || undefined
        };

        // Log to console with colors
        const consoleMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        if (level === 'error') {
            console.error('\x1b[31m%s\x1b[0m', consoleMessage, data || '');
        } else if (level === 'warn') {
            console.warn('\x1b[33m%s\x1b[0m', consoleMessage);
        } else if (level === 'info') {
            console.log('\x1b[36m%s\x1b[0m', consoleMessage);
        } else {
            console.log(consoleMessage);
        }

        // Log to file
        try {
            const date = new Date().toISOString().split('T')[0];
            const logFile = path.join(this.logDir, `${date}.log`);
            const logLine = JSON.stringify(logEntry) + '\n';
            fs.appendFileSync(logFile, logLine);
        } catch (error) {
            console.error('Failed to write log file:', error.message);
        }
    }

    /**
     * Log info level message
     */
    info(message, data = null) {
        this.writeLog('info', message, data);
    }

    /**
     * Log error level message
     */
    error(message, data = null) {
        this.writeLog('error', message, data);
    }

    /**
     * Log warn level message
     */
    warn(message, data = null) {
        this.writeLog('warn', message, data);
    }

    /**
     * Log debug level message (only in development)
     */
    debug(message, data = null) {
        if (process.env.NODE_ENV === 'development') {
            this.writeLog('debug', message, data);
        }
    }
}

module.exports = new Logger();