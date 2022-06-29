import { randomBytes } from 'crypto';
import { deflateRawSync, gunzipSync } from 'zlib';
import type { Example, ExecuteOptions, F, Optional, StateData, V } from './types';

export const SCRIPT_URL_REGEX = /<script src="(\/static\/[0-9a-f]+-frontend\.js)" defer><\/script>/;
export const RUN_URL_REGEX = /^var runURL = "\/cgi-bin\/static\/([^"]+)";$/m;
export const LANGUAGES_URL_REGEX = /^languageFileRequest\.open\("GET", "\/static\/([^"]+)"\);$/m;

/**
 * Compress a outgoing string using zlib.deflateRawSync.
 * @param data String to compress
 */
export function compress(data: string): Buffer {
    return deflateRawSync(Buffer.from(data, 'binary'), { level: 9 });
}

/**
 * Decompress a incoming buffer using zlib.gunzipSync.
 * @param data Buffer to decompress
 */
export function decompress(data: ArrayBuffer): string {
    return gunzipSync(data).toString();
}

/**
 * Generate a random string of bytes a given minimum.
 * @param minBits Minimum number of bits to generate
 */
export function generateRandomBits(minBits: number): string {
    return randomBytes((minBits + 7) >> 3).toString('hex');
}

/**
 * Convert a string to its byte string representation.
 * @param string String to convert
 */
export function stringToByteString(string: string): string {
    return unescape(encodeURIComponent(string));
}

/**
 * Create a V command payload object.
 * @param values Values to set
 */
export function createV(...values: string[]): V {
    return { type: 'V', disabled: !values.length, values };
}

/**
 * Create a F command payload object.
 * @param value File content
 */
export function createF(value: string): F {
    return { type: 'F', disabled: !value, value };
}

/**
 * Convert a tio.run state object into a options object.
 * @param state State object to convert
 */
export function stateToOptions(state: StateData): ExecuteOptions {
    const options: Partial<ExecuteOptions> = {};
    options.language = state.lang.values.at(0);
    options.flags = state['TIO_CFLAGS'].values;
    options.code = state['.code.tio'].value;
    options.input = state['.input.tio'].value;
    options.args = state.args.values;
    return options as ExecuteOptions;
}

/**
 * Convert an options object into a tio.run state object.
 * @param options Options object to convert
 */
export function optionsToState(options: ExecuteOptions): StateData {
    const state: Partial<StateData> = {};
    state.lang = createV(options.language);
    state['TIO_CFLAGS'] = createV(...(options.flags ?? []));
    state['TIO_OPTIONS'] = createV(...(options.options ?? []));
    state['TIO_DRIVER'] = createV(...(options.driver ?? []));
    state['.code.tio'] = createF(options.code);
    state['.input.tio'] = createF(options.input ?? '');
    state.args = createV(...(options.args ?? []));
    return state as StateData;
}

/**
 * Convert a tio.run state object into a string that can be sent to tio.run.
 * @param state State object to convert
 */
export function stateToByteString(state: StateData): string {
    const resultArray = [];

    for (const [name, field] of Object.entries<F | V>(state as any)) {
        if (field.disabled) continue;
        resultArray.push(field.type);
        resultArray.push(`${name}\0`);

        if (field.type === 'F') {
            const value = stringToByteString(field.value);
            resultArray.push(`${value.length}\0${value}`);
        } else {
            resultArray.push(`${field.values.length}\0`);
            for (const value of field.values) {
                resultArray.push(`${stringToByteString(value)}\0`);
            }
        }
    }

    resultArray.push('R');
    return resultArray.join('');
}

export function testToExample(
    lang: string,
    example: Record<string, any>,
): Optional<Partial<Example>> {
    const payload = (example.request as any[])
        .map((a) => a.payload)
        .reduce((a, c) => (a = { ...a, ...c }), {});

    const options: Partial<Example> = {};
    options.language = lang;
    options.flags = payload['TIO_CFLAGS'];
    options.options = payload['TIO_OPTIONS'];
    options.driver = payload['TIO_DRIVER'];
    options.code = payload['.code.tio'];
    options.input = payload['.input.tio'];
    options.args = payload.args;
    options.expected = example.response;
    return options;
}
