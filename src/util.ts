import { randomBytes } from 'crypto';
import { deflateRawSync, gunzipSync } from 'zlib';
import { EvaluateOptions, Example, F, StateData, V } from './types';

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
export function stateToOptions(state: StateData) {
    const options: Partial<EvaluateOptions> = {};
    options.language = state.lang.values.at(0);
    options.flags = state['TIO_CFLAGS'].values;
    options.code = state['.code.tio'].value;
    options.input = state['.input.tio'].value;
    options.args = state.args.values;
    return options as EvaluateOptions;
}

/**
 * Convert an options object into a tio.run state object.
 * @param options Options object to convert
 */
export function optionsToState(options: EvaluateOptions) {
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
export function stateToByteString(state: StateData) {
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

/**
 * Convert a tio.run test object into an example object.
 * @param lang Language to get the example for
 * @param test Test object from tio.run
 */
export function testToExample(lang: string, test: Record<string, any>) {
    const payload = (test['request'] as any[])
        .map(a => a.payload)
        .reduce((a, c) => (a = { ...a, ...c }), {});

    const example: Partial<Example> = {};
    example.language = lang;
    example.flags = payload['TIO_CFLAGS'];
    example.options = payload['TIO_OPTIONS'];
    example.driver = payload['TIO_DRIVER'];
    example.code = payload['.code.tio'];
    example.input = payload['.input.tio'];
    example.args = payload.args;
    example.expected = test['response'];
    return example;
}
