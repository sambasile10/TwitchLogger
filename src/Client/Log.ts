import { Logger } from "tslog"

export class Log {

    private log: Logger;

    constructor() {
        this.log = new Logger({ name: "TwitchLog" } );
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