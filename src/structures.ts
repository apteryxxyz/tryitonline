import { Optional } from './types';

export class Timeout {
    public readonly promise: Promise<undefined>;
    private _timer: Optional<NodeJS.Timeout> = undefined;

    public constructor(timeout: number) {
        this.promise = new Promise(f => (this._timer = setTimeout(() => f(undefined), timeout)));
    }

    public cancel() {
        if (this._timer) {
            clearTimeout(this._timer);
            delete this._timer;
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
