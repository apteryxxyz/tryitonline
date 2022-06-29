const tio = require('..');
const assert = require('node:assert');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
    let languages = await tio.languages();
    languages = languages.filter((l) => l.categories.includes('practical') && l.id !== 'wasm');
    const testCount = languages.reduce((c, l) => c + l.examples.length, 0);
    let failCount = 0;

    for (const language of languages) {
        if (!language.categories.includes('practical')) continue;
        for (const test of language.examples) {
            let result = null;
            try {
                result = await tio.evaluate(test, 30000);
                assert(result.output.includes(test.expected));
                console.error('\x1b[32m%s\x1b[0m', `${language.id} passed its test`);
            } catch (error) {
                console.log(JSON.stringify([test.expected, result.output]));
                console.error('\x1b[31m%s\x1b[0m', `${language.id} failed its test`);
                console.info(result.debug);
                failCount++;
            }
        }
        await wait(1000);
    }

    if (failCount === 0) {
        console.log('\x1b[32m%s\x1b[0m', `\nAll ${testCount} tests have passed!`);
    } else {
        console.error('\x1b[31m%s\x1b[0m', `\n${failCount} of the ${testCount} tests have failed!`);
        process.exit(1);
    }
})();
