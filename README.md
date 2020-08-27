# tree-geocoder

[![npm](https://img.shields.io/npm/v/tree-geocoder.svg?style=popout)](https://npmjs.com/package/tree-geocoder)

A command line tool and library for geocoding based on the [TREE](https://github.com/TREEcg/specification#%E1%B4%9B%CA%80%E1%B4%87%E1%B4%87) traversal approach over [GeoNames](https://www.geonames.org/) and [OSMNames](https://osmnames.org/download/) data. The tool matches GeoNames and OSMNames entities using either **prefix** or **suffix-based** approaches. To foster interoperability, data entities are modeled using a [JSON-LD](https://www.w3.org/TR/json-ld11/) seralization based on the [GeoNames Ontology](http://www.geonames.org/ontology/ontology_v3.2.rdf) and the [OpenStreetMap Vocabulary](https://w3id.org/openstreetmap/terms#) respectively.

Prefix-based geocoding means that, querying for `gent` will result in entities like Geonames's [`Gent`](https://sws.geonames.org/2797657/), [`Gentinnes`](https://sws.geonames.org/2797650/), [`Gentbrugge`](https://sws.geonames.org/2797652/) and OSM's [`Gent`](http://www.openstreetmap.org/relation/2524008), [`Genté`](http://www.openstreetmap.org/relation/111318), [`Gentil`](http://www.openstreetmap.org/node/702808885)  etc. On the other hand, suffix-based geocoding for `terdam` will result in entities such as [`Rotterdam`](https://sws.geonames.org/2747891), [`Amsterdam`](https://sws.geonames.org/2759794), [`Achterdam`](http://www.openstreetmap.org/way/6601361) and also fuzzy matched results like [`Overdam`](https://sws.geonames.org/2789433) and [`Veerdam`](http://www.openstreetmap.org/way/7098952). 

The tool assigns a `score` to every matched entity based on the [Sørensen–Dice coefficient](https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient), which is calculated using the [`string-similarity`](https://www.npmjs.com/package/string-similarity) library. 

Results can be obtained as soon as possible in a streaming and unsorted way using the `--streaming` option (see example below) or can be awaited for a complete answer that will be sorted by `score`.

 Furthermore, this tool supports filtering options based on the minimum accepted score (e.g., `--minScore 0.7`) and entity properties (e.g., only entities that represent administrative regions:  `--filter "geonames:featureClass geonames:A, osm:boundary osm:Administrative"` ) .

## Requirements

This tool requires [Node.js](https://nodejs.org/en/) v12.x or superior.

## Geographic coverage

Up until now, we support the following countries to perform geocoding queries:

* **Prefix queries**: Austria, Belgium, Denmark, France, Germany, Great Britain, Greece, Italy, Luxembourg, Spain, Switzerland, The Netherlands and USA.
* **Suffix queries**: Belgium, France and The Netherlands.

## Command line interface

Install it:

```bash
npm install -g tree-geocoder
```

Use the help option `-h` to see what are the possible uses:

```bash
tree-geocoder -h
Usage: tree-geocoder [options] <query>

Options:
  --maxResults, <maxResults>  Maximum amount of desired results
  --minScore <minScore>       Minimum accepted score (based on Dice's coefficient) for matched results (value between 0 and 1)
  --mode, <mode>              Select "prefix" or "suffix" for specific matching mode. Suffix-based matching will be done by default
  --filter, <filter>          Enter "predicate object" pairs (within double quotes and separated by comma) that would be matched over found entities. E.g., "geonames:featureClass geonames:A, osm:boundary osm:Administrative, osm:hasTag 'addr:country=BE'"
  --streaming                 Get streaming results. Sorting by string similarity cannot be guaranteed with streaming results
  -h, --help                  display help for command
```

Use it for a **prefix-based** geocoding query:

```bash
tree-geocoder --mode prefix --maxResults 5 your_query
```

Use it for a **suffix-based** geocoding query:

```bash
tree-geocoder --maxResults 10 your_query
```

Get results in a **streaming** way and pipe them into other applications:

```bash
tree-geocoder --streaming your_query | other_awesome_application
```

**Filter results** based on entity properties and string similarity. In this example we filter to have only streets and roads (of all kinds) having a `score` of 0.6 or higher:

```bash
tree-geocoder --minScore 0.6 --filter "geonames:featureClass geonames:R, osm:highway '*'" your_query
```

A **more specific filter** for only GeoNames water streams and OSM residential roads in France:

```bash
tree-geocoder --filter "geonames:featureCode geonames:H.STM, geonames:countryCode geonames:FR, osm:highway osm:Residential, osm:hasTag 'addr:country=FR'" your_query
```

Refer to the documentation of [Geonames classes](https://www.geonames.org/export/codes.html) and [OSM tags](https://wiki.openstreetmap.org/wiki/Map_Features) for more information on what is possible in the filtering option.

As an example on how the **results** of a query look see the following query for `entbru` which will include the following:

```bash
tree-geocoder entbru
[
  {
      "@id": "http://www.openstreetmap.org/way/7523153",
      "https://w3id.org/openstreetmap/terms#name": "Meentbrug",
      "score": 0.7692307692307693,
      "https://w3id.org/openstreetmap/terms#highway": "https://w3id.org/openstreetmap/terms#Unclassified",
      "http://www.w3.org/2003/01/geo/wgs84_pos#lat": 5.19221665E1,
      "http://www.w3.org/2003/01/geo/wgs84_pos#long": 4.4825865E0,
      "http://www.opengis.net/ont/geosparql#asWKT": "POINT (4.4825865 51.9221665)",
      "https://w3id.org/openstreetmap/terms#hasTag": "addr:country=NL",
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "https://w3id.org/openstreetmap/terms#Way"
  },
  {
      "@id": "https://sws.geonames.org/2797652",
      "http://www.geonames.org/ontology#countryCode": "http://www.geonames.org/ontology#BE",
      "score": 0.7142857142857143,
      "http://www.geonames.org/ontology#featureClass": "http://www.geonames.org/ontology#P",
      "http://www.geonames.org/ontology#featureCode": "http://www.geonames.org/ontology#P.PPL",
      "http://www.geonames.org/ontology#name": "Gentbrugge",
      "http://www.opengis.net/ont/geosparql#asWKT": "POINT (3.76509 51.03692)",
      "http://www.w3.org/2000/01/rdf-schema#isDefinedBy": "https://sws.geonames.org/2797652/about.rdf",
      "http://www.w3.org/2003/01/geo/wgs84_pos#lat": 5.103692E1,
      "http://www.w3.org/2003/01/geo/wgs84_pos#long": 3.76509E0,
      "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": "http://www.geonames.org/ontology#Feature"
  }
  ...
]
```

## Library

This tool can be used both in the backend (Node.js) and in the browser by means of a tool such as Webpack.

Install it in your project `npm install tree-geocoder`.

The `TreeGeocoder` class exposes the [AsyncGenerator](https://tc39.es/ecma262/#sec-async-generator-function-definitions) function `geocode()`, which can be used as follows:

Use it **synchronously** and get **sorted** (by `score`) results:

```js
const TreeGeocoder = require("tree-geocoder");

async function runQuery() {
    const tgc = new TreeGeocoder();
    const opts = {
        query: "your_query",
        minScore: 0.6 // Optional. Values between 0 and 1 (higher means more similar)
        maxResults: 10, // Optional
        mode: "prefix", // Or don't define to get suffix-based results
        filter: { // Optional. Define the predicate-object pairs that will be matched against each type of entity
            "https://w3id.org/openstreetmap/terms#": { // Rules for OSM entities
                "https://w3id.org/openstreetmap/terms#highway": "https://w3id.org/openstreetmap/terms#Motorway",
                "https://w3id.org/openstreetmap/terms#hasTag": "addr:country=BE"
            },
            "http://www.geonames.org/ontology#": { // Rules for GeoNames entities
                "http://www.geonames.org/ontology#featureClass": "http://www.geonames.org/ontology#P",
                "http://www.geonames.org/ontology#countryCode": "http://www.geonames.org/ontology#BE"
            }
        }
    };

    const results = (await tgc.geocode(opts).next()).value;
    console.log(results);
}

runQuery();
```

Or consume it as a **stream** and get (unsorted) results as soon as possible:

```js
const TreeGeocoder = require("tree-geocoder");

async function runQuery() {
    const tgc = new TreeGeocoder();
    const opts = {
        query: "your_query",
        minScore: 0.6, // Optional. Values between 0 and 1 (higher means more similar)
        maxResults: 100, // Optional
        streaming: true,
        filter: { // Optional. Define the predicate-object pairs that will be matched against each type of entity
            "https://w3id.org/openstreetmap/terms#": { // Rules for OSM entities
                "https://w3id.org/openstreetmap/terms#highway": "https://w3id.org/openstreetmap/terms#Motorway",
                "https://w3id.org/openstreetmap/terms#hasTag": "addr:country=BE"
            },
            "http://www.geonames.org/ontology#": { // Rules for GeoNames entities
                "http://www.geonames.org/ontology#featureClass": "http://www.geonames.org/ontology#P",
                "http://www.geonames.org/ontology#countryCode": "http://www.geonames.org/ontology#BE"
            }
        }
    };

    for await (const result of tgc.geocode(opts)) {
        console.log(result);
    }
}

runQuery();
```
