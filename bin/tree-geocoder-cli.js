#!/usr/bin/env node

const TreeGeocoder = require('../lib/TreeGeocoder');
const Namespaces = require('../config/namespaces');
var program = require('commander');

program
    .option('--maxResults, <maxResults>', 'Maximum amount of desired results')
    .option('--minScore <minScore>', 'Minimum accepted score (based on Dice\'s coefficient) for matched results (value between 0 and 1)')
    .option('--mode, <mode>', 'Select "prefix" or "suffix" for specific matching mode. Suffix-based matching will be done by default')
    .option('--filter, <filter>', 'Enter "predicate object" pairs (within double quotes and separated by comma) that would be matched over found entities. E.g., "geonames:featureClass geonames:A, osm:boundary osm:Administrative, osm:hasTag \'addr:country=BE\'"')
    .option('--streaming', 'Get streaming results. Sorting by string similarity cannot be guaranteed with streaming results')
    .arguments('<query>', 'Input query string for the geocoding process')
    .action(query => {
        program.query = query;
    })
    .parse(process.argv);


async function run() {
    if (!program.query) {
        console.error('Please provide a non-empty query string');
    }

    let filter = null;
    if (program.filter) {
        try {
            filter = {};
            for (const f of program.filter.split(',')) {
                const rawP = f.trim().split(' ')[0];
                const rawO = f.trim().split(' ')[1];
                const ns = Namespaces[rawP.split(':')[0]];
                const p = ns + rawP.split(':')[1];
                let o = /'(.*?)'/.exec(rawO);
                if (!o) {
                    o = rawO.split(':').length > 1 ? Namespaces[rawO.split(':')[0]] + rawO.split(':')[1] : rawO;
                } else {
                    o = o[1];
                }

                if (!filter[ns]) filter[ns] = {};

                filter[ns][p] = o;
            }
        } catch (err) {
            console.error(`Invalid filter provided: ${err}`);
            process.exit(1);
        }
    }

    let minScore = null;
    if (program.minScore) {
        try {
            minScore = parseFloat(program.minScore);
        } catch (err) {
            console.error(`Invalid minScore provided: ${err}`);
            process.exit(1);
        }
    }

    const opts = {
        query: program.query,
        maxResults: program.maxResults,
        minScore: minScore,
        mode: program.mode,
        filter: filter,
        streaming: program.streaming
    };

    const geocoder = new TreeGeocoder();

    for await (const d of geocoder.geocode(opts)) {
        logger(d);
    }
}

// Silence annoying logging from dependencies
const logger = console.log;
console.log = () => { };

run();

