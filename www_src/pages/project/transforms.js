var assign = require('react/lib/Object.assign');
var calculateSwipe = require('../../lib/swipe.js');

var MAX_ZOOM = 0.8;
var MIN_ZOOM = 0.18;
var ZOOM_SENSITIVITY = 300;

/**
 * Directly manipulate an element's style, rather than changing it through render()
 */
function dangerouslySetStyle(element, style) {
  assign(element.style, style);
}

/**
 * utility function for constraining a value
 */
function constrain(v,min,max) {
  return v<min ? min : v>max ? max : v;
}

/**
 * Touch handler for projects
 */
var handleTouches = function(component) {
  var node = component.getDOMNode();
  var master = component.refs.bounding.getDOMNode();

  // administrative values:
  var didMove = false,
      startX,
      startY,
      startDX = 0,
      startDY = 0,
      startDistance,
      endX,
      endY,
      currentX,
      currentY,
      currentZoom;

  // partial reset, used by handleTouchEnd
  var resetValues = function() {
    startX = undefined;
    startY = undefined;
    startDX = 0;
    startDY = 0;
    startDistance = undefined;
    currentX = undefined;
    currentY = undefined;
    currentZoom = undefined;
  };

  // Swipe handling is supposed to kick in for... something...
  var handleSwipe = () => {
    // FIXME: TODO: turned off for now, in part because of Laura's comments, in
    //              part because it makes reimplementing transform handling easier.
    return;

    // --- original code ---
    var swipeDirection = calculateSwipe(startX, startY, endX, endY);
    if (swipeDirection) {
      var coords = component.state.zoomedPageCoords,
          cx = coords.x,
          cy = coords.y;
      var panTargets = {
        LEFT:  { x: cx + 1, y: cy     },
        RIGHT: { x: cx - 1, y: cy     },
        UP:    { x: cx,     y: cy + 1 },
        DOWN:  { x: cx,     y: cy - 1 }
      };
      var target = panTargets[swipeDirection];
      // Determine if the desired adjacent page exists
      var pages = component.state.pages;
      if (pages.some(p => p.coords.x === target.x && p.coords.y === target.y)) {
        component.zoomToPage(target);
      }
    }
  };


  /**
   * [description]
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  var handleTouchStart = (event) => {
    didMove = false;
    var touches = event.touches,
        t0 = { x: touches[0].clientX, y: touches[0].clientY };
    // multiple fingers
    if (touches.length > 1) {
      startDX = touches[1].clientX - t0.x;
      startDY = touches[1].clientY - t0.y;
      startDistance = Math.sqrt(startDX*startDX + startDY*startDY);
    }
    // single finger
    else {
      startX = t0.x;
      startY = t0.y;
      dangerouslySetStyle(master, { transition: "none" });
    }
    // interaction continues in handleTouchMove
  };

  /**
   * [description]
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  var handleTouchMove = (event) => {
    didMove = true;
    var touches = event.touches,
        t0 = { x: touches[0].clientX, y: touches[0].clientY },
        zoom = component.state.zoom,
        camera = component.state.camera,
        cx = camera.x,
        cy = camera.y,
        dx = 0, dy = 0, d = false;

    // update scale, due to multiple finger input
    if (touches.length > 1) {
      dx = touches[1].clientX - t0.x;
      dy = touches[1].clientY - t0.y;

      d  = Math.sqrt(dx*dx + dy*dy);
      currentZoom = constrain( zoom + (d-startDistance)/ZOOM_SENSITIVITY, MIN_ZOOM, MAX_ZOOM);
      zoom = currentZoom
    }

    // update translation, corrected for our zoom center
    currentX = cx + (t0.x - startX) + (dx - startDX);
    currentY = cy + (t0.y - startY) + (dy - startDY);

    // update tracking value
    endX = t0.x;
    endY = t0.y;

    // and finally, bind the transform
    var translation = 'translate(' + currentX + 'px, ' + currentY + 'px)',
        scale = 'scale(' + zoom + ')',
        transform = [translation, scale].join(' ');
    dangerouslySetStyle(master, { transform: transform });
  };

  /**
   * [description]
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  var handleTouchEnd = (event) => {
    var touches = event.touches;

    // there are no more fingers on the screen
    if (touches.length === 0) {
      dangerouslySetStyle(master, { transition: "" });
      if (!didMove) { return; }
      if (!component.state.isPageZoomed) {
        var cameraUpdate = {
          camera: {
            x: currentX,
            y: currentY
          },
          zoom: currentZoom ? currentZoom : component.state.zoom
        };
        component.setState(cameraUpdate);
        resetValues();
      }
      // This kicks in when we're at the zoomest level of zoom.
      // On a phone: page view. On a Nexus 7: nothing like page view.
      else { handleSwipe(); }
    }
    // there fingers left on the screen
    else {
      startX = touches[0].clientX;
      startY = touches[0].clientY;
      startDX = 0;
      startDY = 0;
      // FIXME: TODO: we should not do this. We cannot modify "state" unless we intend
      //              for that to immediately cause a render(), which means setting them
      //              through setState() instead. The following code overloads state
      //              as a local variable, even though anything can at anytime invalidate
      //              its content because of an async render() trigger from somewhere else.
      component.state.camera.x = currentX;
      component.state.camera.y = currentY;
      component.state.zoom = currentZoom;
    }
  };

  node.addEventListener('touchstart', handleTouchStart);
  node.addEventListener('touchmove', handleTouchMove);
  node.addEventListener('touchend', handleTouchEnd);
};


module.exports = {
  componentDidMount: function () {
    handleTouches(this);
  }
};
