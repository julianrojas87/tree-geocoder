# tree-geocoder

[![npm](https://img.shields.io/npm/v/tree-geocoder.svg?style=popout)](https://npmjs.com/package/tree-geocoder)

A command line tool and library for geocoding based on [GeoNames](https://www.geonames.org/) data and the [TREE](https://github.com/TREEcg/specification#%E1%B4%9B%CA%80%E1%B4%87%E1%B4%87) traversal approach. The tool matches GeoNames entities using either prefix or suffix-based approaches. 

Prefix-based geocoding means that, querying for `gent` will result in entities like [`Gent`](https://sws.geonames.org/2797657/), [`Gentinnes`](https://sws.geonames.org/2797650/), [`Gentbrugge`](https://sws.geonames.org/2797652/), etc. 

On the other hand, suffix-based geocoding for `terdam` will results in entities such as [`Rotterdam`](https://sws.geonames.org/2747891), [`Amsterdam`](https://sws.geonames.org/2759794) and also fuzzy matched results like [`Overdam`](https://sws.geonames.org/2789433).

By default the tool will use the suffix-based approach. The prefix-based geocoding can be selected using the `prefixSearch` flag. See below for an example.

## Requirements

This tool requires [Node.js](https://nodejs.org/en/) v10.x or superior.

## Command line interface

Install it:

```bash
npm install -g tree-geocoder
```

Use it for a prefix-based geocoding query:

```bash
tree-geocoder --prefixSearch --maxResults 5 your_query
```

Use it for a suffix-based geocoding query:

```bash
tree-geocoder --maxResults your_query
```

For example this query:

```bash
tree-geocoder --maxResults 1 entbru 
```

Will give this result:

```json
[
  {
    '@id': 'https://sws.geonames.org/2797652',
    'http://www.geonames.org/ontology#countryCode': 'http://www.geonames.org/ontology#BE',
    'http://www.geonames.org/ontology#featureClass': 'http://www.geonames.org/ontology#P',
    'http://www.geonames.org/ontology#featureCode': 'http://www.geonames.org/ontology#P.PPL',
    'http://www.geonames.org/ontology#name': 'Gentbrugge',
    'http://www.opengis.net/ont/geosparql#asWKT': 'POINT (3.76509 51.03692)',
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 'http://www.geonames.org/ontology#Feature',
    'http://www.w3.org/2000/01/rdf-schema#isDefinedBy': 'https://sws.geonames.org/2797652/about.rdf',
    'http://www.w3.org/2003/01/geo/wgs84_pos#lat': '5.103692E1',
    'http://www.w3.org/2003/01/geo/wgs84_pos#long': '3.76509E0'
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
        maxResults: 10, // Optional
        prefixOnly: true // Set true for prefix. Suffix is default
    });

    console.log(results);
}

runQuery();
```
