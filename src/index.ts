import { Timeout, TioError, TioHttpError } from './structures';
import {
    Constants,
    EvaluateOptions,
    EvaluateResult,
    Example,
    Language,
    Optional,
    ResultStatus,
} from './types';
import {
    compress,
    decompress,
    generateRandomBits,
    LANGUAGES_URL_REGEX,
    optionsToState,
    RUN_URL_REGEX,
    SCRIPT_URL_REGEX,
    stateToByteString,
    testToExample,
} from './util';

let BASE_URL = 'https://tio.run';
let RUN_URL: Optional<string> = undefined;
let LANGUAGES_URL: Optional<string> = undefined;
let LANGUAGES: Language[] = [];
let DEFAULT_TIMEOUT = 10000;
let REFRESH_INTERVAL = 850000;
let NEXT_REFRESH = 0;

/**
 * Set the global constants.
 * @param constants The constants to modify
 */
export function constants(constants: Constants) {
    if (constants.baseUrl) BASE_URL = constants.baseUrl;
    if (BASE_URL.endsWith('/')) BASE_URL = BASE_URL.slice(0, -1);
    if (constants.defaultTimeout) DEFAULT_TIMEOUT = constants.defaultTimeout;
    if (constants.refreshInterval) REFRESH_INTERVAL = constants.refreshInterval;
}

/**
 * Prepare the languages and run URL.
 */
export async function prepare() {
    if (RUN_URL && Date.now() < NEXT_REFRESH) return;
    NEXT_REFRESH = Date.now() + REFRESH_INTERVAL;
    const me = (p: string) =>
        `An error occurred while trying to scrap the ${p} from 'tryitonline'.`;

    const homeContent = await fetch(BASE_URL).then(r => r.text());
    const scriptUrl = homeContent.match(SCRIPT_URL_REGEX)?.[1];
    if (!scriptUrl) throw new TioError(me('script URL'));

    const scriptContent = await fetch(`${BASE_URL}${scriptUrl}`).then(r => r.text());
    const runUrl = scriptContent.match(RUN_URL_REGEX)?.[1];
    if (!runUrl) throw new TioError(me('run URL'));

    const languagesUrl = scriptContent.match(LANGUAGES_URL_REGEX)?.[1];
    if (!languagesUrl) throw new TioError('languages URL');

    RUN_URL = runUrl;
    LANGUAGES_URL = languagesUrl;
}

/**
 * Get a list of languages.
 * @returns A array of language objects.
 */
export async function languages() {
    if (LANGUAGES.length) return LANGUAGES;
    await prepare();

    const baseUrl = `${BASE_URL}/static`;
    const response = await fetch(`${baseUrl}/${LANGUAGES_URL}`);
    const data = (await response.json()) as { [key: string]: Record<string, any> };

    return (LANGUAGES = Object.entries(data).map(([key, value]) => ({
        id: key,
        name: value['name'],
        link: value['link'],
        categories: value['categories'],
        encoding: value['encoding'],
        update: value['update'],
        examples: Object.values<Record<string, any>>(value['tests'])
            .map(t => testToExample(key, t))
            .filter(t => t !== undefined) as Example[],
        unmask: value['unmask'],
        piggyback: value['piggyback'],
        prettify: value['prettify'],
        tab: value['tab'],
    }))) as Language[];
}

/**
 * Execute an input.
 * @param options The options to execute
 * @param timeout Maximum time to wait for the execution to finish
 * @internal
 */
async function execute(options: EvaluateOptions, timeout = DEFAULT_TIMEOUT) {
    const controller = new AbortController();

    const state = optionsToState(options);
    const string = stateToByteString(state);
    const buffer = compress(string);

    const baseUrl = `${BASE_URL}/cgi-bin/static/`;
    const dymamicUrl = `${RUN_URL}/${generateRandomBits(128)}`;
    const response = await fetch(baseUrl + dymamicUrl, {
        method: 'POST',
        body: buffer,
        signal: controller.signal,
    });

    if (response.status >= 400) throw new TioHttpError(response);

    let data: Optional<ArrayBuffer> = undefined;
    if (timeout) {
        const timer = new Timeout(timeout);
        data = await Promise.race([response.arrayBuffer(), timer.promise]);

        if (data) {
            timer.cancel();
        } else {
            controller.abort();
            return undefined;
        }
    }

    if (!data) return undefined;
    return decompress(data).toString();
}

/**
 * Evaluate a piece of code in any language.
 * @param options The options to execute
 * @param timeout Maximum time to wait for the execution to finish
 */
export async function evaluate(options: EvaluateOptions, timeout: number = DEFAULT_TIMEOUT) {
    // Verify that all options that must exist do exist
    for (const [k, v] of [
        ['language', options.language],
        ['code', options.code],
    ])
        if (!v) throw new TioError(`Option '${k}' is required.`);

    // Verify that all options that must be a string are strings
    for (const [k, v] of [
        ['language', options.language],
        ['code', options.code],
        ['input', options.input],
    ])
        if (v && typeof v !== 'string') throw new TioError(`Option '${k}' must be a string.`);

    // Verify that all options that must arrays of strings are arrays of strings
    for (const [k, v] of [
        ['flags', options.flags],
        ['options', options.options],
        ['driver', options.driver],
        ['args', options.args],
    ]) {
        if (!v) continue;
        if (!Array.isArray(v)) throw new TioError(`Option '${k}' must be an array.`);
        if (v.some(i => typeof i !== 'string'))
            throw new TioError(`Option '${k}' must be an array of strings.`);
    }

    await prepare();
    await languages();

    // Ensure inputted language is valid
    const language = LANGUAGES.find(l => l.id === options.language);
    if (!language) throw new TioError(`Language ${options.language} could not be found.`);

    const result = await execute(options, timeout);
    const object: Partial<EvaluateResult> = {};
    object.language = language;
    object.status = result ? ResultStatus.Passed : ResultStatus.TimedOut;

    if (result) {
        const sections = result.substring(16).split(result.substring(0, 16));
        object.output = sections.shift()?.trim() as string;
        object.debug = sections.shift()?.trim();
        object.warnings = sections.pop()?.trim();
    } else {
        object.output = `Request timed out after ${timeout / 1000} seconds.`;
        object.debug = undefined;
        object.warnings = undefined;
    }

    return object as EvaluateResult;
}

// Support import default in ESM and TS
exports.default = exports;
