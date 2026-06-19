# Meteorite Atlas — Product Documentation

## The one-line pitch

An interactive map of NASA's 45,716 recorded meteorites that does something
most visualizations of this dataset don't: it tells you the truth about where
the data comes from.

## The problem with the obvious product

The natural thing to build with this dataset is a world map with a dot for every
meteorite. Almost everyone does exactly that. The trouble is that such a map is
quietly misleading. It *looks* like a map of where meteorites land, but it's
really a map of **where humans went looking and could actually see them.**

The numbers make this undeniable. Of 45,716 records, only **1,107 (2.4%) were
witnessed falling.** The other 97.6% were *found* — sometimes thousands of years
after they landed. And of all those finds, **49.5% come from Antarctica alone.**
Meteorites don't preferentially land on Antarctica; they land roughly uniformly.
But on an endless white ice sheet a dark rock is unmistakable, and glacial flow
sweeps fallen meteorites into concentrated "stranding zones" where search teams
collect them by the thousand. Add the hot deserts of Northwest Africa and you've
explained most of the map.

So the product's point of view is: **this is a dataset about human attention as
much as about space.** Meteorite Atlas lets you explore the falls freely, but it
foregrounds that collection bias instead of hiding it. That honesty is the
feature.

## Who it's for

- **Educators and students (primary).** A science teacher covering meteorites,
  sampling bias, or data literacy gets a single interactive surface: explore the
  map, then read the Insights tab that explains *why* the map looks the way it
  does. The bias story is a genuinely good lesson in how observational data can
  mislead — useful well beyond astronomy.
- **Science-curious public (secondary).** Anyone who finds space interesting can
  search for meteorites near a place they know, filter to the rare planetary and
  iron types, and watch the recovery boom unfold over time.

## What it does (features)

1. **Explore** — a full-world map of all 32,186 mappable meteorites, rendered
   with clustering so 32K points stay smooth. Click any point for its class,
   mass, year, and whether it was seen falling or found later.
2. **Filter** — by composition (eight meteorite families), fall type
   (seen-falling vs found), year range, minimum mass, and name search. Filtering
   is instant; the counter shows how many of the mapped total are visible.
3. **Insights** — the analytical heart. The headline bias stat, observed-falls
   vs finds, the recovery boom by decade, the composition breakdown, and a
   **Data Honesty** section that openly reports what was cleaned and what's
   missing (13,530 records with no usable coordinates, 131 with no mass, one
   impossible year).
4. **API** — the cleaned data is also served as a small REST API
   (`/api/meteorites`, `/api/stats`) so the product is usable as a data source,
   not just a web page.

## Why I chose this

A take-home is a chance to show judgment, not just execution. Plenty of
candidates can plot dots on a map. Choosing to *interrogate* the dataset —
noticing the 49.5% Antarctica figure and building the whole product around
explaining it — is the part that shows I think about what data actually means
before I ship it. The map makes it engaging; the bias narrative makes it
memorable; the clean pipeline and API make it real software.

## What I'd build next

- Reverse-geocode to true country/locality (currently coarse bounding boxes).
- "Near me" geolocation entry point for the public audience.
- Cross-reference Antarctic stranding-zone polygons to visualize the lens
  literally.
- A density/heatmap layer toggle alongside the point view.
