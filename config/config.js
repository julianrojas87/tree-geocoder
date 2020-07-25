module.exports = {
    source: {
        prefix: [
            {
                tree: 'http://193.190.127.152/geonames-prefix-tree/node0.jsonld#Collection',
                path: 'http://www.geonames.org/ontology#name'
            },
            {
                tree: 'http://193.190.127.152/osm-prefix-tree/node0.jsonld#Collection',
                path: 'https://w3id.org/openstreetmap/terms#name'
            }
        ],
        suffix: [
            {
                tree: 'http://193.190.127.152/geonames-suffix-tree/node0.jsonld#Collection',
                path: 'http://www.geonames.org/ontology#name'
            },
            {
                tree: 'http://193.190.127.152/osm-suffix-tree/node0.jsonld#Collection',
                path: 'https://w3id.org/openstreetmap/terms#name'
            }
        ]
    }
};