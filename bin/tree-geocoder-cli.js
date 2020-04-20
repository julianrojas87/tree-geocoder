#!/usr/bin/env node

const TreeGeocoder = require('../lib/TreeGeocoder');
var program = require('commander');

program
    .option('--maxResults, <maxResults>', 'Maximum amount of desired results')
    .arguments('<query>', 'Input query string for the geocoding process')
    .action(query => {
        program.query = query;
    })
    .parse(process.argv);


async function run() {
    if(!program.query) {
        console.error('Please provide a non-empty query string');
    }

    const result = await new TreeGeocoder().geocode({
        query: program.query,
        maxResults: program.maxResults
    });

    logger(result);
}

// Silence annoying logging from dependencies
const logger = console.log;
console.log = () => {};

run();

