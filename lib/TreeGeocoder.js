const TreeBrowser = require('rdf_tree_browser');
const normalize = TreeBrowser.Normalizer.normalize;
const GN_NAME = 'http://www.geonames.org/ontology#name';

class TreeGeocoder {
    constructor(source) {
        this._client = new TreeBrowser.AutocompleteClient(false);
        this._source = source || 'http://193.190.127.152/geonames/node0.jsonld#Collection';
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
        const q = await this.client.query(opts.query, TreeBrowser.PrefixQuery, GN_NAME, this.source);

        if (opts.stream) {
            // TODO: give streaming results
        } else {
            try {
                let results = [];
                this.client.on('data', res => {
                    results = results.concat(this.extractResults(res));
                });
                await q[2];
                return this.sortResults(opts, results);
            } catch (err) {
                console.error(err);
                throw err;
            }
        }
    }

    extractResults(res) {
        // TODO: extract proper RDF as JSON-LD
        const query = res.searchValue;
        let entities = new Map();
        let ids = [];
        let results = [];

        for (const quad of res.data) {
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

    sortResults(opts, results) {
        let sorted = []
        for (const r of results) {
            if (normalize(opts.query) === normalize(r[GN_NAME])) {
                // Insert exact matches first
                sorted.unshift(r);
            } else {
                // TODO: sort non-exact matches by length
                sorted.push(r);
            }
        }

        if (sorted.length > opts.maxResults) {
            return sorted.slice(0, opts.maxResults);
        } else {
            return sorted;
        }
    }

    get client() {
        return this._client
    }

    set client(c) {
        this._client = c;
    }

    get source() {
        return this._source;
    }
}

module.exports = TreeGeocoder;