const TreeBrowser = require('rdf_tree_browser');
const config = require('../config/config');
const normalize = TreeBrowser.Normalizer.normalize;
const GN_NAME = 'http://www.geonames.org/ontology#name';

class TreeGeocoder {
    constructor() {
        this._prefixClient = new TreeBrowser.AutocompleteClient(false);
        this._suffixClient = new TreeBrowser.FuzzyAutocompleteClient(100);
        this._prefixSource = config.source.prefix;
        this._suffixSource = config.source.suffix;
    }

    async geocode(opts) {
        if (!opts.query || opts.query === '') {
            throw new Error('Please provide a non-empty query string');
        }

        // Return all results by default
        if (!opts.maxResults) {
            opts.maxResults = Infinity;
        }

        // Start query process
        let q = null;
        if (opts.prefixOnly) {
            q = await this.prefixClient.query(opts.query.trim(), TreeBrowser.PrefixQuery, [GN_NAME], this.prefixSource);
        } else {
            q = await this.suffixClient.query(opts.query.trim(), TreeBrowser.SubstringQuery, [GN_NAME], this.suffixSource);
        }

        if (opts.stream) {
            // TODO: give streaming results
        } else {
            try {
                let results = [];
                this.prefixClient.on('data', res => {
                    results = results.concat(this.extractPrefixResults(res, opts.query.trim()));
                });
                this.suffixClient.on('topn', res => {
                    results = results.concat(this.extractSuffixResults(res, opts.query.trim()));
                });

                await q[2];
                return this.sortResults(opts, results);
            } catch (err) {
                console.error(err);
                throw err;
            }
        }
    }

    extractPrefixResults(res, query) {
        // TODO: extract proper RDF as JSON-LD
        let entities = new Map();
        let ids = [];
        let results = [];

        for (const quad of res.quads) {
            const s = quad.subject.value;
            const p = quad.predicate.value;
            const o = quad.object.value;

            if (p === GN_NAME) {
                if (normalize(o).startsWith(normalize(query))) {
                    ids.push(s);
                }
            }

            if (entities.has(s)) {
                entities.get(s)[p] = o;
            } else {
                entities.set(s, { '@id': s, [p]: o });
            }
        }

        for (const id of ids) {
            results.push(entities.get(id));
        }

        return results;
    }

    extractSuffixResults(res) {
        let entities = new Map();
        let ids = [];
        let results = [];

        for (const r of res) {
            for (const quad of r.object.quads) {
                const s = quad.subject.value;
                const p = quad.predicate.value;
                const o = quad.object.value;

                if (p === GN_NAME) {
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

        for (const id of ids) {
            results.push(entities.get(id));
        }

        return results;
    }

    sortResults(opts, results) {
        let sorted = []
        if (opts.prefixOnly) {
            for (const r of results) {
                if (normalize(opts.query) === normalize(r[GN_NAME])) {
                    // Insert exact matches first
                    sorted.unshift(r);
                } else {
                    // TODO: sort non-exact matches by length
                    sorted.push(r);
                }
            }
        } else {
            // We have to filter some duplicated results
            let set = new Set();
            let temp = results.sort((a, b) => {
                return b.score - a.score;
            });
            for (let t of temp) {
                if (set.size >= opts.maxResults) break;
                if (!set.has(t['@id'])) {
                    set.add(t['@id']);
                    delete t.score;
                    sorted.push(t);
                }
            }

        }

        if (sorted.length > opts.maxResults) {
            return sorted.slice(0, opts.maxResults);
        } else {
            return sorted;
        }
    }

    get prefixClient() {
        return this._prefixClient
    }

    get suffixClient() {
        return this._suffixClient;
    }

    get prefixSource() {
        return this._prefixSource;
    }

    get suffixSource() {
        return this._suffixSource;
    }
}

module.exports = TreeGeocoder;