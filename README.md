# Sombrajo
> Sombrajo is an experimental, performant heatmap library for painting collections of dynamic web content.

![sombrajo_heatmap](https://cloud.githubusercontent.com/assets/532350/11411614/a1af0e72-939f-11e5-8c40-fdd6f06ca696.jpg)

Several client heatmaps work well for rendering fixed hotspots from x/y coordinates atop static pages (eg. where people are clicking on a page design). However, if you're goal is to paint fluid, content-centric web pages that approach poses a few practical challenges:

* Heat ascribed to featured content blocks (say a news story) occupies variable space, with dynamic styling rules handled in the document
* The same unit of content may appear several times on the same page, but in distinct positions
* For user-driven interfaces with animated carousels, responsive placements, fixed scrolling, or toggled visibility - layout changes typically require cpu-intensive redraws with an unwieldy full-page canvas or webgl element

**Sombrajo** boasts all the speed and flexibility of mapping elements inline, coupled with the ability to paint elements individually and seamlessly atop the page. It does this by rendering heatmap components from the Shadow DOM.

## Usage

#### Dependencies
Sombrajo depends on the excellent [D3.js](http://d3js.org/) utility library (d3.core, d3.scale) to scale heatmap color schemes. You'll need to bundle with / include this library to render properly.

#### Build basic heatmap

Heatmap collections - elements and their respective data values - can be set a few different ways.

First, in a very simple case, each participating content element will have custom data attributes to set an `id` and `value` for the entry:

```html
<div data-entry-id="1001" data-entry-value="2200"><a href="/story/1001.html">A great headline here</a></div>
<div data-entry-id="1002" data-entry-value="1535"><a href="/story/1002.html">Another headline here</a></div>

<script type="text/javascript"> var heatmap = new Sombrajo(); </script>
```

When using more dynamic datasets, its also convenient to seed entry `id` for each entry in the DOM, then assign them explicit values as follows:

```html
<div data-entry-id="1001"><a href="/story/1001.html">A great headline here</a></div>
<div data-entry-id="1002"><a href="/story/1002.html">Another headline here</a></div>

<script type="text/javascript">
  var data_set = [{ id: 1001, value: 2200 }, { id: 1002, value: 1535 }];
  var heatmap = new Sombrajo({ collection: data_set });
  // OR alternatively, set it after having fetched data remotely
  var heatmap = new Sombrajo();
  heatmap.setCollection(data_set);
</script>
```
If you already have a working index of elements and their ascribed values, you can also pass Sombrajo the `element` reference, instead of specifying an `id`:

```html
<div class="lead-story"><a href="/story/1001.html">A great headline here</a></div>
<div class="lead-story"><a href="/story/1002.html">Another headline here</a></div>

<script type="text/javascript">
  var heatmap_elems = document.querySelectorAll('.lead-story');
  var data_set = [{ element: heatmap_elems[0], value: 2200 }, { element: heatmap_elems[1], value: 1535 }];
  var heatmap = new Sombrajo({ collection: data_set });
</script>
```

#### Configure settings

Sombrajo allows configuring of the following settings when instantiating a new heatmap, and also via `updateConfig` method:

```javascript
  var heatmap = new Sombrajo({
    container: document, // parent element heatmap instance should scope to (optional)
    collection: [{ id: 1, value: 22 }], // array of hashes (optional - can be set subsequently)
    content_selector: 'data-entry-id', // data attribute to pull entry id (optional)
    value_selector: 'data-entry-value', // data attribute to pull entry value (optional)
    opacity: 0.7, // sets opacity of heatmap overlay (optional)
    glow: 0, // sets glow on heatspots to give the appearance of a thermal heatmap (optional)
    scale: 'linear' // sets color scale to linear based on values input (any d3 scale, such as `log`)
  })
```
#### Sombrajo API

**updateConfig** (*updated_config*)
> Updates heatmap with new settings and re-renders the map accordingly. Accepts the same parameters.

**setCollection** (*new_collection*)
> Sets / resets heatmap data, and repaints it where needed. Returns current collection details

**refreshMap** (*entry_id_or_element = null, reset = false*)
> Repaints heamtap if there are new elements present, or if reset flag set to true. Otherwise, if an element argument is passed, it will limit repainting to that id/element

**getEntryValue** (*entry_id_or_element*)
> Returns value for a particular entry in the heatmap collection

**updateEntryValue** (*entry_id_or_element, new value*)
> Updates individual entry's value and refreshes map accordingly


**addEntry** (*new_entry = { id: null, element: null, value: null }*)
> Adds a new entry to heatmap collection, re-renders accordingly

**removeEntry** (*entry_id_or_element*)
> Removes an existing entry from heatmap collection, re-renders map accordingly

**hide**
> Hides heatmap from view, setting display to none

**show**
> Re-shows heatmap if it was previously hidden

**destroy**
> Deletes existing heatmap collection and removes heatmap components from DOM for said instance


## Browser Support
**Note:** Shadow DOM spec is currently in-flux, thus Google Chrome and Opera are the only browsers to offically support the currrent spec by default. Firefox does support the Shadow DOM with the [webcomponents flag enabled](https://developer.mozilla.org/en-US/docs/Web/Web_Components#Enabling_Web_Components_in_Firefox). At this stage, this library is limited to use in these browsers. Check out some work that is being done on the [W3C Working Draft](http://w3c.github.io/webcomponents/spec/shadow/) to standardize this approach in short order across most major browsers.

## Development

#### Install requisite node project packages

```javascript
$ npm install
```

#### Run tests
```javascript
$ gulp test
```

#### Contribute
Several Gulp tasks are available for sane development. Please submit additonal test coverage / updated examples with any feature PR's, cheers!

## Eh, what's with the name of this library?
[Sombrajo](http://www.spanishdict.com/translate/sombrajo) (in Spanish) refers to a typical rustic awning that stilts above the ground, absorbing the sun's heat to keep everything cool in the shade below. Or, building a heatmap from the shadow DOM. See what I did there? 
