import type { Optional } from './types';

export class Timeout {
    public readonly promise: Promise<undefined>;
    private timer: Optional<NodeJS.Timeout> = undefined;

    public constructor(timeout: number) {
        this.promise = new Promise((fullfill) => {
            this.timer = setTimeout(() => fullfill(undefined), timeout);
        });
    }

    public cancel(): void {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
    }
}

export class TioError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = 'TioError';
    }
}

export class TioHttpError extends TioError {
    public status: number;
    public statusText: string;

    public constructor(response: Response) {
        super(`[HTTP ${response.status}: ${response.statusText}]`);
        this.status = response.status;
        this.statusText = response.statusText;
    }
}
