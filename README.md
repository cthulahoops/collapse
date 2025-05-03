A playground for experimenting with the [Wave Function Collapse Algorithm](https://en.wikipedia.org/wiki/Model_synthesis). You can try it out at [https://collapse.cthulahoops.org](https://collapse.cthulahoops.org/).

## How to use:

+ Draw a pattern in the editor.
+ Right click to clear a pixel.
+ Double click in the editor to flood fill a region.
+ Double click in the color picker to edit the palette.
+ The edges of both the editor and the generated pattern are wrapped - there is no edge.
+ Use flip for left-right symmetry, rotate to make rotationally symmetric patterns.
+ Click "Generate" to generate a new pattern based on the one you drew.

## How it works:

The algorithm ensures that every 3x3 tile in the generated pattern matches a 3x3 region
drawn in the editor. A preview of all valid tiles is shown on the right hand side. The
algorithm "collapses the wave function" by randomly selecting a tile from the set of valid tiles and assigning it, and then pruning the set of valid tiles. It is possible that it
will fail and get stuck in state where no valid tiles are left. (Currently the screen
will turn red!)

## Tips:

+ Certain patterns are more likely to get stuck than others.
+ Keep the pattern simple, if there are too many tiles the algorithm will be much, much slower.
+ Use the pondiverse button to share your creations on [the pondiverse](https://pondiverse.com).
