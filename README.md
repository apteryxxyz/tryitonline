<div align="center">
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="32" fill="#C0C0C0">
		<rect width="64" height="4" rx="2" ry="2"/>
		<rect width="4" height="30" x="12" y="2" rx="2" ry="2"/>
		<rect width="4" height="24" x="28" y="8" rx="2" ry="2"/>
		<circle cx="52" cy="20" r="10" class="stroke" stroke-width="4"/>
	</svg><br>
    <i>Evaluate any code in any language</i><br>
    <code>npm install tryitonline</code>
</div>

<div align="center">
    <img alt="package version" src="https://img.shields.io/npm/v/tryitonline?label=version">
    <img alt="total downloads" src="https://img.shields.io/npm/dt/tryitonline">
    <br>
    <a href="https://github.com/apteryxxyz"><img alt="apteryxxyz followers" src="https://img.shields.io/github/followers/apteryxxyz?style=social"></a>
    <a href="https://github.com/apteryxxyz/tryitonline"><img alt="tryitonline repo stars" src="https://img.shields.io/github/stars/apteryxxyz/tryitonline?style=social"></a>
</div>

# 🤔 What is `tryitonline`?

[Try It Online](https://tio.run) is a family of online interpreters for an evergrowing list of practical and recreational programming languages. This module - `tryitonline` - is an API wrapper for it.

You can view some examples [here](https://github.com/apteryxxyz/tryitonline/tree/main/examples).

# 🏓 Table Of Contents

- [🤔 What is `tryitonline`?](#-what-is-tryitonline)
- [🏓 Table Of Contents](#-table-of-contents)
- [📩 Installation](#-installation)
- [🍕 API](#-api)
  - [🟢 Node < 17.5](#-node--175)
  - [`<tio>.languages`](#tiolanguages)
  - [`<tio>.evaluate`](#tioevaluate)
  - [`<tio>.constants`](#tioconstants)

# 📩 Installation

```bash
npm install tryitonline
yarn add tryitonline
pnpm add tryitonline
```

# 🍕 API

```js
const tio = require('tryitonline');
// OR
import tio from 'tryitonline';
```

## 🟢 Node < 17.5

`tryitonline` uses the new Node.js `fetch`, in order to use this in older versions of Node.js, you must polyfill the fetch API.

For example using [cross-fetch](https://github.com/lquixada/cross-fetch):

```js
require('cross-fetch/polyfill');
```

## `<tio>.languages`

Use the `languages` method to get a list of programming languages that Try It Online provides.

```ts
tio.languages(): Promise<Language[]>;
```

**TypeScript Interfaces**

```ts
interface Language {
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
    examples: EvaluateOptions & { expected: string }[];
    /** Unmask */
    unmask: Unmask[];
    /** The language this language piggybacks */
    piggyback?: string;
    /** Short ID for this language */
    prettify?: string;
    /** Tab */
    tab?: string;
}
```

## `<tio>.evaluate`

The `evaluate` method is used to evaluate a piece of code, by sending a request to Try It Online.

```ts
tio.evaluate(options: EvaluateOptions, timeout?: number): Promise<EvaluateResult>
```

**TypeScript Interfaces**

```ts
interface EvaluateOptions {
    /** Language ID */
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
```

```ts
interface EvaluateResult {
    /** Evaluation status */
    status: ResultStatus.Passed | ResultStatus.TimedOut;
    /** Language */
    language: Language;
    /** Output */
    output: string;
    /** Debug log */
    debug: string;
    /** Warnings */
    warnings: string;
}
```

## `<tio>.constants`

The `constants` function is used to change things such as the TIO url and default timeout.

```ts
tio.constants(options: Constants): void
```

**TypeScript Interfaces**

```ts
interface Constants {
    /** The TIO url to use */
    baseUrl?: string;
    /** The default max time to evaluate */
    defaultTimeout?: number;
    /** How often to reprepare */
    refreshInterval?: number;
}
```
