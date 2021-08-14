import { Logger, TLogLevelName } from "tslog"

export class Log {

    private log: Logger;

    constructor() {
        //console.log(process.env.TWITCH_LOG_LEVEL);
        this.log = new Logger({ name: "TwitchLog", minLevel: "debug" } );
    }

    trace(msg: string): void {
        this.log.trace(msg);
    }

    debug(msg: string): void {
        this.log.debug(msg);
    }

    info(msg: string): void {
        this.log.info(msg);
    }

    warn(msg: string): void {
        this.log.warn(msg);
    }

    error(msg: string): void {
        this.log.error(msg);
    }

    fatal(msg: string): void {
        this.log.fatal(msg);
    }
}