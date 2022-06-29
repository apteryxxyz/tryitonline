export type Optional<T> = T | undefined;

export interface ExecuteOptions {
    /** Language */
    language: string;
    /** Compiler flags */
    flags?: string[];
    /** Command-line options */
    options?: string[];
    /** Driver */
    driver?: string[];
    /** Code */
    code: string;
    /** Input */
    input?: string;
    /** Arguments */
    args?: string[];
}

export interface F {
    type: 'F';
    disabled: boolean;
    value: string;
}

export interface V {
    type: 'V';
    disabled: boolean;
    values: string[];
}

export interface StateData {
    lang: V;
    TIO_CFLAGS: V;
    TIO_OPTIONS: V;
    TIO_DRIVER: V;
    '.code.tio': F;
    '.input.tio': F;
    args: V;
}

export enum ResultStatus {
    Passed = 'passed',
    TimedOut = 'timed out',
}

export interface PassedResult {
    /** Execution status */
    status: ResultStatus.Passed;
    /** Language */
    language: Language;
    /** Output */
    output: string;
    /** Debug log */
    debug: string;
    /** Warnings */
    warnings: string;
}

export interface TimedOutResult {
    /** Execution status */
    status: ResultStatus.TimedOut;
    /** Language */
    language: Language;
    /** Output */
    output: string;
    /** Debug log */
    debug: undefined;
    /** Warnings */
    warnings: undefined;
}

export type ExecuteResult = PassedResult | TimedOutResult;

export enum Category {
    Practical = 'practical',
    Recreational = 'recreational',
    Unlisted = 'unlisted',
}

export enum Encoding {
    ItsComplicated = "it's complicated",
    Nibbles = 'nibbles',
    SBCS = 'SBCS',
    UTF8 = 'UTF-8',
    XXD = 'xxd',
}

export enum Update {
    CPAN = 'cpan',
    DNF = 'dnf',
    DotNet = 'dotnet',
    Git = 'git',
    GitHubRelease = 'github-release',
    Hg = 'hg',
    Lua = 'lua',
    Manual = 'manual',
    NoVersion = 'no-version',
    NPM = 'npm',
    Piggyback = 'piggyback',
    PIP = 'pip',
    Version = 'version',
}

export enum Unmask {
    CFlags = 'cflags',
    Driver = 'driver',
    Options = 'options',
}

export enum Command {
    /** Clear all created files and variables */
    C = 'C',
    /** Delete file/directory */
    D = 'D',
    /** Create file */
    F = 'F',
    /** Run code */
    R = 'R',
    /** Unset variable */
    U = 'U',
    /** Declare variable */
    V = 'V',
}

export type Example = ExecuteOptions & { expected: string };

export interface Language {
    /** ID */
    id: string;
    /** Name */
    name: string;
    /** Language URL */
    link: string;
    /** Categories */
    categories: Category[];
    /** Encoding */
    encoding: Encoding;
    /** Method of updating */
    update: Update;
    /** Examples for how to use this language */
    examples: Example[];
    /** Unmask */
    unmask: Unmask[];
    /** The language this language piggybacks */
    piggyback?: string;
    /** Short ID for this language */
    prettify?: string;
    /** Tab */
    tab?: string;
}
