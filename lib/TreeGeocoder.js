const TreeBrowser = require('rdf_tree_browser');
const config = require('../config/config');
const namespaces = require('../config/namespaces');

class TreeGeocoder {

    async * geocode(opts) {
        if (!opts.query || opts.query === '') {
            throw new Error('Please provide a non-empty query string');
        }

        // Return all results by default
        if (!opts.maxResults) {
            opts.maxResults = Infinity;
        }

        // Query clients
        const prefixClient = new TreeBrowser.AutocompleteClient(false);
        const suffixClient = new TreeBrowser.FuzzyAutocompleteClient(100, 2, opts.minScore || 0);

        // Set of all tree:path that will be evaluated
        const pathSet = new Set();
        // Set to prevent duplicated results
        const unique = new Set();

        // Start query process
        let queries = [];
        if (opts.mode === 'prefix') {
            for (const s of config.source.prefix) {
                pathSet.add(s.path);
                const q = await prefixClient.query(opts.query.trim(), TreeBrowser.PrefixQuery, [s.path], s.tree);
                queries.push(q[2]);
            }
        } else {
            for (const s of config.source.suffix) {
                const q = await suffixClient.query(opts.query.trim(), TreeBrowser.SubstringQuery, [s.path], s.tree);
                queries.push(q[2]);
                pathSet.add(s.path);
            }
        }

        // Capture and sort (if possible) results
        try {
            let results = [];
            let resolve = null;
            let promise = new Promise(r => resolve = r);
            let counter = 0;

            prefixClient.on('data', res => {
                const data = this.extractAndFilterResults([res], pathSet, opts.filter, opts.minScore || 0, unique);
                if (opts.streaming) {
                    if (data.length > 0) {
                        results = results.concat(data);
                        resolve();
                        promise = new Promise(r => resolve = r);
                    }
                } else {
                    results = results.concat(data);
                }
            });

            suffixClient.on('topn', res => {
                const data = this.extractAndFilterResults(res, pathSet, opts.filter, opts.minScore || 0, unique);
                if (opts.streaming) {
                    if (data.length > 0) {
                        results = results.concat(data);
                        resolve();
                        promise = new Promise(r => resolve = r);
                    }
                } else {
                    results = results.concat(data);
                }
            });

            if (!opts.streaming) {
                await Promise.all(queries);
                // Sort results by string similarity score
                yield this.sortResults(opts, results);
            } else {
                while (counter < opts.maxResults) {
                    await promise;
                    for(const r of results) {
                        if(counter >= opts.maxResults) break;
                        yield r;
                        counter++;
                    }
                    results = [];
                }

                // Terminate query clients
                prefixClient.interrupt();
                suffixClient.interrupt();
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    extractAndFilterResults(res, paths, filter, minScore, unique) {
        let entities = new Map();
        let ids = [];
        let results = [];

        // Extract entity from RDF quads
        for (const r of res) {
            for (const quad of r.object.quads) {
                const s = quad.subject.value;
                const p = quad.predicate.value;
                const o = quad.object.value;

                if (paths.has(p)) {
                    ids.push(s);
                }

                if (entities.has(s)) {
                    entities.get(s)[p] = o;
                } else {
                    entities.set(s, {
                        '@id': s,
                        [p]: o,
                        score: r.score
                    });
                }
            }
        }

        // Filter based on given constraints
        for (const id of ids) {
            // Prevent duplicates
            if (!unique.has(id)) {
                unique.add(id);
                const entity = entities.get(id);

                if (filter) {
                    const nss = Object.keys(filter);
                    let filtered = false;

                    for (const ns of nss) {
                        const fks = Object.keys(filter[ns]);
                        let flag = false;

                        for (const fk of fks) {
                            if (entity[fk]) {
                                filtered = true;
                                flag = (entity[fk] === filter[ns][fk] || filter[ns][fk] === '*');
                                if (!flag) break;
                            } else if (entity[`${namespaces.rdf}type`].includes(ns)) {
                                flag = false;
                                filtered = true;
                                break;
                            } else {
                                break;
                            }
                        }

                        if (flag && entity.score >= minScore) {
                            results.push(entity);
                            break;
                        }
                    }

                    // There are no filters for this entity
                    if (!filtered && entity.score >= minScore) results.push(entity);
                } else {
                    if (entity.score >= minScore) results.push(entity);
                }
            }
        }

        return results;
    }

    sortResults(opts, results) {
        const sorted = results.sort((a, b) => {
            return b.score - a.score;
        });

        if (sorted.length > opts.maxResults) {
            return sorted.slice(0, opts.maxResults);
        } else {
            return sorted;
        }
    }
}

module.exports = TreeGeocoder;