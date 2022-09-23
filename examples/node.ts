import tio from '..';
// import tio from 'tryitonline';

async function main() {
    tio.constants({ defaultTimeout: 15000 });

    const languages = await tio.languages();

    const languageWithExample = languages.find(l => l.examples.length > 0);
    const example = languageWithExample!.examples[0];

    const result = await tio.evaluate(example);

    console.log(`
        Language: ${result.language.name}
        Output: ${result.output}
        Debug:
        ${result.debug}
    `.replace(/( {2}| {4})/g, '').trimEnd());
}

main();