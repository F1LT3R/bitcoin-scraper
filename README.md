bitcoin-scraper
===============

scrapes bitcoin data to json

##Le Scrape...

```shell
git clone https://github.com/F1LT3R/bitcoin-scraper.git
cd bitcoin-scraper
npm install
node index.js
```

Output be like...

```shell
2014-12-17 was saved!
2014-12-18 was saved!
2014-12-20 was saved!
2014-12-19 was saved!
```

Data be all...

```json
[
  [
    1419033600,
    318.58,
    318.58,
    318.58,
    318.58,
    0.01719605,
    5.478317609,
    318.58
  ],
  ...
```

##Columns

| Timestamp  |  Open  |  High  |  Low   | Close  | Volume (BTC) | Volume (Currency) | Weighted Price (USD) |
|------------|--------|--------|--------|--------|--------------|-------------------|----------------------|
| 1419033600 | 318.58 | 318.58 | 318.58 | 318.58 |   0.01719605 |       5.478317609 |               318.58 |