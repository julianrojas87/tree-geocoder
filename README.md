# tree-geocoder

[![npm](https://img.shields.io/npm/v/tree-geocoder.svg?style=popout)](https://npmjs.com/package/tree-geocoder)

A command line tool and library for geocoding based on GeoNames data and the [TREE](https://github.com/TREEcg/specification#%E1%B4%9B%CA%80%E1%B4%87%E1%B4%87) traversal approach.

## Requirements

This tool requires [Node.js](https://nodejs.org/en/) v10.x or superior.

## Command line interface

Install it:

```bash
npm install -g tree-geocoder
```

Use it:

```bash
tree-geocoder --maxResults 5 your_query
```

For example this query:

```bash
tree-geocoder --maxResults 1 volkegem
```

Will give this result:

```json
[
  {
    '@id': 'https://sws.geonames.org/2784423/',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://www.geonames.org/ontology#Feature',
    'http://www.geonames.org/ontology#countryCode': 'https://www.geonames.org/ontology#BE',
    'http://www.geonames.org/ontology#featureClass': 'https://www.geonames.org/ontology#P',
    'http://www.geonames.org/ontology#featureCode': 'https://www.geonames.org/ontology#P.PPL',
    'http://www.geonames.org/ontology#name': 'Volkegem',
    'http://www.opengis.net/ont/geosparql#asWKT': 'POINT (3.64024 50.84106)',
    'http://www.w3.org/2000/01/rdf-schema#isDefinedBy': 'https://sws.geonames.org/2784423/about.rdf',
    'http://www.w3.org/2003/01/geo/wgs84_pos#lat': '50.84106',
    'http://www.w3.org/2003/01/geo/wgs84_pos#long': '3.64024'
  }
]
```

## Library

Install it in your project `npm install tree-geocoder`. Then use it as follows:

```js
const TreeGeocoder = require('tree-geocoder');

async function runQuery() {
    const tgc = new TreeGeocoder();
    let results = await tgc.geocode({
        query: 'your_query',
        maxResults: 10 // Optional
    });

    console.log(results);
}

runQuery();
```
