# Miljøbilen RSS

![generate-rss workflow](https://github.com/kevinmidboe/miljobilen-rss/actions/workflows/main.yml/badge.svg)

Generates RSS file for next pick up date & time for Miljøbilen from [FolloRen webpage](https://folloren.no/levering-av-avfall/miljobilen/).

## Usage

```bash
node src/node.js 'pentagon' 2
```

Complete list of commands:

```
usage: node src/run.js <name> [<look-ahead>] [-p] [-h | --help]

These are the available arguments:
    name        Name of location to search for
    look-ahead  How many days in future to generate, defaults 2
    print       Prints results
    help        Prints this message
```

## Features

Runs every day and checks for and updates RSS with next pickup date relative to current day.

## TODO

Smaller tasks:
 - [x] Connect to Google bucket, SA, etc.
 - [ ] Updates RSS generation
 - [ ] Compare existing dates in RSS to fetched
 - [x] alert on failing urn
 - [x] handle rollover dates



