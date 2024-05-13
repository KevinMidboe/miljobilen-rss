# Miljøbilen RSS

![generate-rss workflow](https://github.com/kevinmidboe/miljobilen-rss/actions/workflows/main.yml/badge.svg)

Generates RSS file for next pick up date & time for Miljøbilen from FolloRen webpage. 

Requires a location name to search for on website as input.

## Features

Runs every day and checks for and updates RSS with next pickup date relative to current day.

## TODO

This is such a shitshow.

Smaller tasks:
 - [x] Connect to Google bucket, SA, etc.
 - [ ] Updates RSS generation
 - [ ] Compare existing dates in RSS to fetched
 - [ ] alert on failing urn

### Handle rollover of date list

New years to start: 30.12 04.01 30.01
End to new years: 21.12 31.12 03.01 14.01

Create function that takes a list of dates and creates
real date objects. It should include logic for look-ahead
to adress rollover.


