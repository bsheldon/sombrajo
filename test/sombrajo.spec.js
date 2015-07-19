// test helpers

var setContent = function(html) {
  var sandbox = document.getElementById('sandbox');
  sandbox.innerHTML = html;
  return sandbox;
}
var getPlotted = function(nodes) {
  var count = 0;
  for (var n = 0; n < nodes.length; n++) {
    if (typeof nodes[n].shadowRoot !== 'undefined' && nodes[n].shadowRoot !== null &&
      nodes[n].shadowRoot.querySelectorAll('.sombrajo').length === 1) { count += 1; }
  }
  return count;
}

// lib specs

describe("Sombrajo Heatmap Library", function() {

  beforeEach(function() {
    // setup sandbox
    var sandbox = document.createElement('section');
    sandbox.setAttribute('id', 'sandbox');
    document.querySelector('body').appendChild(sandbox);
  });

  afterEach(function() {
    // clear sandbox
    var sandbox = document.getElementById('sandbox');
    document.querySelector('body').removeChild(sandbox);
  });

  it("should be able to instantiate a new heatmap", function() {
    var heatmap = new Sombrajo();
    expect(heatmap).toBeDefined();
    expect(heatmap instanceof Sombrajo).toBeTruthy();
  });

  it("should be able to draw heatmap from explicit data IDs present in DOM", function() {
    // setup template
    var content = '<div data-entry-id="1"></div><div data-entry-id="2"></div><div data-entry-id="3"></div>';
    var sandbox = setContent(content);
    // populate data with new heatmap instance
    var data_set = [{ id: 1, value: 90 }, { id: 2, value: 259 }, { id: 3, value: 950 }];
    var heatmap = new Sombrajo({ collection: data_set });
    var entries = sandbox.querySelectorAll('[data-entry-id]');
    var plotted = getPlotted(entries);
    expect(plotted).toEqual(3);
  });

  it("should be able to draw heatmap from explicit data IDs/values present in DOM", function() {
    var content = '<div class="story" data-entry-id="1" data-entry-value="20"></div>' +
      '<div class="story" data-entry-id="2" data-entry-value="90"></div>';
    var sandbox = setContent(content);
    var heatmap = new Sombrajo();
    var entries = sandbox.querySelectorAll('[data-entry-id]');
    expect(getPlotted(entries)).toEqual(2);
  });

  it("should be able to draw heatmap when passed collection of elements/values", function() {
    var content = '<div class="story"></div><div class="story"></div>';
    var sandbox = setContent(content);
    var heatmap_elems = sandbox.querySelectorAll('.story');
    var data_set = [{ element: heatmap_elems[0], value: 200 }, { element: heatmap_elems[1], value: 105 }];
    var heatmap = new Sombrajo({ collection: data_set });
    var plotted = getPlotted(heatmap_elems);
    expect(plotted).toEqual(2);
  });

  it("should be able to fetch the value of a particular entry from the collection", function() {
    // lookup by entry id
    var data_set = [{ id: 1001, value: 90 }, { id: 1002, value: 259 }];
    var heatmap = new Sombrajo({ collection: data_set });
    expect(heatmap.getEntryValue(1002)).toEqual(259);
    // lookup by entry element
    var sandbox = setContent('<div data-id="region-1"></div>');
    var entries = sandbox.querySelector('[data-id]');
    var heatmap_two = new Sombrajo({ collection: [{ element: entries, value: 100 }] });
    expect(heatmap_two.getEntryValue(entries)).toEqual(100);
  });

  it("should be able to update a heatmap with a new data collection", function() {
    var data_set = [{ id: 1001, value: 90 }, { id: 1002, value: 259 }, { id: 10003, value: 452 }];
    var heatmap = new Sombrajo();
    var map_data = heatmap.setCollection(data_set);
    expect(map_data.length).toEqual(3)
    expect(heatmap.getEntryValue(1002)).toEqual(259);
    var new_data = [{ id: 1001, value: 400 }, { id: 1002, value: 978 }];
    map_data = heatmap.setCollection(new_data);
    expect(map_data.length).toEqual(2)
    expect(heatmap.getEntryValue(1002)).toEqual(978);
  });

  it("should be able to update a single entry value on the collection", function() {
    var data_set = [{ id: 1001, value: 90 }, { id: 1002, value: 259 }];
    var heatmap = new Sombrajo({ collection: data_set });
    heatmap.updateEntryValue(1002, 2000);
    expect(heatmap.getEntryValue(1002)).toEqual(2000);
    expect(heatmap.setCollection().length).toEqual(2);
  });

  it("should be able to remove a single entry from the collection", function() {
    var content = '<div data-entry-id="1"></div><div data-entry-id="2"></div><div data-entry-id="3"></div>';
    var sandbox = setContent(content);
    var data_set = [{ id: 1, value: 90 }, { id: 2, value: 259 }, { id: 3, value: 950 }];
    var heatmap = new Sombrajo({ collection: data_set });
    heatmap.removeEntry(3);
    var entries = sandbox.querySelectorAll('[data-entry-id]');
    expect(getPlotted(entries)).toEqual(2);
    expect(heatmap.setCollection().length).toEqual(2);
  });

  it("should be able to repaint for any new elements that appear on a page", function() {
    var content = '<div data-entry-id="1"></div>';
    var sandbox = setContent(content);
    var data_set = [{ id: 1, value: 90 }, { id: 2, value: 259 }];
    var heatmap = new Sombrajo({ collection: data_set });
    // introduce a dynamically loaded entry plot that already has collection data present
    sandbox.innerHTML += '<div data-entry-id="2"></div>';
    heatmap.refreshMap();
    var fresh_entry = sandbox.querySelectorAll('[data-entry-id="2"]');
    expect(getPlotted(fresh_entry)).toEqual(1);
    // also, make sure it can draw another duplicate plot if it appears
    sandbox.innerHTML += '<div data-entry-id="1"></div>';
    var dupped_entries = sandbox.querySelectorAll('[data-entry-id="1"]');
    heatmap.refreshMap();
    expect(getPlotted(dupped_entries)).toEqual(2);
  });

  it("should be able to toggle visiblity of heatmap", function() {
    var content = '<div data-entry-id="1"></div>';
    var sandbox = setContent(content);
    var heatmap = new Sombrajo({ collection: [{ id: 1, value: 90 }] });
    var plot = sandbox.querySelector('[data-entry-id="1"]');
    expect(plot.shadowRoot.querySelector('.sombrajo').style.display).not.toBe('none');
    heatmap.hide();
    expect(plot.shadowRoot.querySelector('.sombrajo').style.display).toBe('none');
    heatmap.show();
    expect(plot.shadowRoot.querySelector('.sombrajo').style.display).not.toBe('none');
  });

  it("should be able to set/update heatmap config", function() {
    var content = '<div data-entry-id="1"></div>';
    var sandbox = setContent(content);
    var heatmap = new Sombrajo({ collection: [{ id: 1, value: 20 }] });
    var spot = sandbox.querySelector('[data-entry-id="1"]').shadowRoot.querySelector('.sombrajo');
    var opacity = window.getComputedStyle(spot).getPropertyValue('opacity');
    expect(opacity).toBe('0.7'); // default opacity
    heatmap.updateConfig({ opacity: 0.2, glow: 20 });
    // should have redrawn map with updated render values
    spot = sandbox.querySelector('[data-entry-id="1"]').shadowRoot.querySelector('.sombrajo');
    opacity = window.getComputedStyle(spot).getPropertyValue('opacity');
    glow = spot.style.boxShadow;
    expect(opacity).toBe('0.2');
    expect(glow.indexOf('20px') > 0).toBeTruthy();
  });

  it("should be able to destroy a heatmap", function() {
    var content = '<div data-entry-id="1"></div><div data-entry-id="2"></div><div data-entry-id="3"></div>';
    var sandbox = setContent(content);
    var heatmap = new Sombrajo();
    heatmap.setCollection([{ id: 1, value: 90 }, { id: 2, value: 259 }, { id: 3, value: 950 }]);
    var entries = sandbox.querySelectorAll('[data-entry-id]');
    expect(getPlotted(entries)).toEqual(3);
    heatmap.destroy();
    expect(getPlotted(entries)).toEqual(0);
    expect(heatmap.getEntryValue(1)).not.toBeDefined();
  });

});