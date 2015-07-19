// Sombrajo 0.1
// Source: http://github.com/bsheldon/sombrajo by @bsheldon
// Sombrajo may be freely distributed under the MIT license.

// Uses AMD or browser globals to create a module.
// Grabbed from https://github.com/umdjs/umd/blob/master/amdWeb.js.

(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['d3'], factory);
  } else if (typeof exports !== 'undefined') {
    // CommonJS modules
    module.exports = factory(require('d3'), exports);
  } else {
    // Browser globals
    root.Sombrajo = factory(root.d3);
  }
}(this, function (d3) {
  'use strict';

  var _config, _map, _range;

  function Sombrajo(settings) {
    // build default configuration
    settings = settings || {};
    _config = {};
    _config.container = settings.container || document;
    _config.content_selector = settings.content_selector || 'data-entry-id';
    _config.value_selector = settings.value_selector || 'data-entry-value';
    _config.opacity = settings.opacity || 0.7;
    _config.glow = settings.glow || 0;
    _config.scale = settings.scale || 'linear'; // maps to d3 scale distribution
    // setup collection and draw heatmap
    _map = settings.collection || [];
    this.setCollection();
  }

  Sombrajo.prototype = {

    // public api

    updateConfig: function(settings) {
      for (var setting in settings) {
        _config[setting] = settings[setting];
      }
      // rebuild after any config change
      this.setCollection();
    },

    setCollection: function(updated_collection) {
      // if map collection already exists, we just want to repaint it
      // but, if collection exists and updated collection is passed, we need to delete all first
      if (typeof updated_collection !== 'undefined' && updated_collection !== null) {
        for (var i = 0; i < _map.length; i++) {
          deleteMapEntry(_map[i]);
        }
        _map = updated_collection;
      }
      buildMap();
      _range = calibrateScale();
      paintMap();
      return _map;
    },

    refreshMap : function(e, reset) {
      e = findMapEntry(e) || {};
      reset = reset || false;
      var total_curr_plots = _config.container.querySelectorAll('[' + _config.content_selector + ']').length;
      var total_set_plots = 0;
      for (var i = 0; i < _map.length; i++) { total_set_plots += _map[i].plots.length; }
      // re-render whole map if collection scale needs reset
      if (e.value > _range.max || reset || total_curr_plots > total_set_plots) {
        this.setCollection();
      // otherwise repaint updated plots where necessary
      } else {
        paintMap(e);
      }
    },

    getEntryValue: function(e) {
      var entry = findMapEntry(e);
      if (typeof entry !== 'undefined' && entry !== null) {
        return entry.value;
      }
    },

    updateEntryValue: function(e, new_value) {
      var entry = findMapEntry(e);
      if (entry === null) { return; }
      var reset = (entry.value === _range.max);
      entry.value = new_value;
      // repaint plots with updated data
      this.refreshMap(e, reset);
    },

    addEntry: function(e) {
      // do not add if entry already exists in collection
      var exists = findMapEntry(e);
      if (exists !== null) { return; }
      // create entry
      buildMap(e);
      // repaint plots with updated data
      this.refreshMap(e);
    },

    removeEntry: function(e) {
      var entry = findMapEntry(e);
      if (entry === null) { return; }
      deleteMapEntry(entry);
      if (entry.value === _range.max) {
        this.setCollection();
      }
    },

    hide: function() {
      var plots = pullPlots();
      for (var p = 0; p < plots.length; p++) {
        plots[p].shadow.querySelector('.sombrajo').style.display = 'none';
      }
    },

    show: function() {
      var plots = pullPlots();
      for (var p = 0; p < plots.length; p++) {
        plots[p].shadow.querySelector('.sombrajo').style.display = 'block';
      }
    },

    destroy: function() {
      var plots = pullPlots();
      for (var p = 0; p < plots.length; p++) {
        plots[p].shadow.innerHTML = '<content></content>';
      }
      _map = [];
      _config = {};
      _range = {};
    }

  };

  // internal api

  var buildMap, buildMapEntry, indexMapEntries, paintMap, findMapEntry, deleteMapEntry, pullPlots, mapElement,
    fetchElements, updateElement, setStyles, calibrateScale, colorize;

  buildMap = function(e) {
    // build specific map plot
    if (typeof e !== 'undefined' && e !== null) {
      buildMapEntry(e);
      _map.push(e);
    // otherwise build entire map
    } else {
      if (_map.length === 0) { _map = indexMapEntries(); }
      for (var i = 0; i < _map.length; i++) {
        var entry = _map[i];
        buildMapEntry(entry);
      }
    }
  };

  indexMapEntries = function() {
    // when no collection passed, need to cull eligible elems/data from DOM
    var ids = [];
    var collection = [];
    var id_field = _config.content_selector;
    var value_field = _config.value_selector;
    var plots = _config.container.querySelectorAll('[' + id_field + ']');
    for (var p = 0; p < plots.length; p++) {
      var id = plots[p].getAttribute(id_field);
      var value = plots[p].getAttribute(value_field);
      if (ids.indexOf(id) < 0) {
        collection.push({ id: id, value: value });
        ids.push(id);
      }
    }
    return collection;
  };

  buildMapEntry = function(entry) {
    var elems = entry.element ? [entry.element] : fetchElements(entry.id);
    entry.plots = [];
    if (typeof entry.value === 'undefined' || entry.value === null) {
      entry.value = elems[0].getAttribute(_config.value_selector);
    }
    for (var p = 0; p < elems.length; p++) {
      entry.plots.push({ host: elems[p] });
    }
  };

  paintMap = function(e) {
    // paint plot
    var _paint = function(entry) {
      var score = entry.value;
      var rank = _range.rank.indexOf(score) + 1;
      for (var p = 0; p < entry.plots.length; p++) {
        var plot = entry.plots[p];
        if (typeof plot.shadow === 'undefined' || plot.shadow === null) {
          plot.shadow = mapElement(plot.host, entry.value, rank);
        } else {
          updateElement(plot, entry.value, rank);
        }
        colorize(plot.shadow, score, _range.max);
      }
    };
    // paint specific entry
    if (typeof e !== 'undefined' && e !== null && Object.keys(e).length > 0) {
      _paint(e);
    // otherwise paint entire map
    } else {
      for (var i = 0; i < _map.length; i++) {
        _paint(_map[i]);
      }
    }
  };

  // accepts entry hash or explicit entry id
  findMapEntry = function(match) {
    match = (typeof match === 'object') ? (match.id || match.element) : match;
    for (var e = 0; e < _map.length; e++) {
      var current = _map[e];
      if (current.id == match || current.element === match) { return current; } // jshint ignore:line
    }
    return null;
  };

  deleteMapEntry = function(entry) {
    // remove any ids and replace shadow nodes
    for (var i = 0; i < entry.plots.length; i++) {
      //entry.plots[i].host.removeAttribute(_config.content_selector);
      entry.plots[i].shadow.innerHTML = '<content></content>';
    }
    // remove from collection list
    for (var e = 0; e < _map.length; e++) {
      var current = _map[e];
      if (current.id == entry.id && current.element === entry.element) { _map.splice(e, 1); } // jshint ignore:line
    }
  };

  pullPlots = function() {
    var plots = [];
    for (var i = 0; i < _map.length; i++) {
      plots = plots.concat(_map[i].plots);
    }
    return plots;
  };

  mapElement = function(host, score, rank) {
    var root = host.shadowRoot || host.createShadowRoot();
    var position = window.getComputedStyle(host).getPropertyValue('position');
    if (position === '' || position === 'static') { host.style.position = 'relative'; }
    root.innerHTML = setStyles(root);
    root.innerHTML += '<figure class="sombrajo" data-rank="' + rank + '" data-score="' + score +
      '"></figure><content></content>';
    return root;
  };

  fetchElements = function(target) {
    return _config.container.querySelectorAll('[' + _config.content_selector + '="' + target + '"]');
  };

  updateElement = function(plot, score, rank) {
    var cover = plot.shadow.querySelector('.sombrajo');
    cover.setAttribute('data-score', score);
    cover.setAttribute('data-rank', rank);
  };

  // inline styles are lame, but chrome has deprecated any shadow selectors
  setStyles = function() {
    var opacity = _config.opacity;
    var radius = _config.glow ? _config.glow * 0.2 : 0;
    var style_tag = '<style>figure.sombrajo { display: block; width: 100%; height: 100%; opacity: ' + opacity +
      '; position: absolute; z-index: 20; border-radius: ' + radius + '%; border-color: none; margin: 0; left: 0; top: 0;' +
      'pointer-events: none; }</style>';
    return style_tag;
  };

  calibrateScale = function() {
    var values = _map.map(function(entry) { return entry.value; });
    var index = values.sort().reverse();
    return { max: d3.max(values), min: d3.min(values), rank: index };
  };

  colorize = function(shadow, score, max) {
    // defaults to linear but can also set log
    var scale = (['linear', 'log'].indexOf(_config.scale) > -1) ? _config.scale : 'linear';
    var setColor = d3.scale[scale].call()
      .range(['blue', 'turquoise', 'green', 'yellow', 'red'])
      .domain([0, 0.25, 0.50, 0.75, 1])
      .interpolate(d3.interpolateLab);
    var rate = ((score || 1) / max);
    var color = setColor(rate);
    var glow = _config.glow || 0;
    var cover = shadow.querySelector('.sombrajo');
    cover.style.backgroundColor = color;
    cover.style.boxShadow = '0px 0px ' + glow + 'px ' + glow + 'px ' + color;
  };

  return Sombrajo;
}));
