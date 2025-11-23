/**
 * Centralized logging system with configurable log levels
 */

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    SILENT = 4,
}

class Logger {
    private level: LogLevel;

    constructor(level?: LogLevel) {
        // Check environment variable first, then use provided level, default to INFO
        const envLevel = process.env.LOG_LEVEL;
        if (envLevel !== undefined) {
            const parsed = parseInt(envLevel, 10);
            this.level = isNaN(parsed) ? LogLevel.INFO : parsed;
        } else {
            this.level = level ?? LogLevel.INFO;
        }
    }

    /**
     * Set the log level
     */
    setLevel(level: LogLevel): void {
        this.level = level;
    }

    /**
     * Get current log level
     */
    getLevel(): LogLevel {
        return this.level;
    }

    /**
     * Debug level logging - for detailed troubleshooting
     */
    debug(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.DEBUG) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }

    /**
     * Info level logging - for general information
     */
    info(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.INFO) {
            console.log(`[INFO] ${message}`, ...args);
        }
    }

    /**
     * Warning level logging - for potential issues
     */
    warn(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.WARN) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    }

    /**
     * Error level logging - for errors
     */
    error(message: string, ...args: any[]): void {
        if (this.level <= LogLevel.ERROR) {
            console.error(`[ERROR] ${message}`, ...args);
        }
    }

    /**
     * Always log, regardless of level (for critical messages)
     */
    always(message: string, ...args: any[]): void {
        console.log(message, ...args);
    }
}

// Export singleton instance
export const logger = new Logger();

// Export class for testing
export { Logger };
