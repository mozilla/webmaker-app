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


var handleTouches = function(component) {
  var node = component.getDOMNode();
  var master = component.refs.bounding.getDOMNode();

  var didMove = false,
      startX,
      startY,
      startDistance,
      endX,
      endY,
      currentX,
      currentY,
      currentZoom;

  var resetValues = function() {
    startX = undefined;
    startY = undefined;
    startDistance = undefined;
    currentX = undefined;
    currentY = undefined;
    currentZoom = undefined;
  };

  /**
   * [description]
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  var handleTouchStart = (event) => {
    didMove = false;
    if (event.touches.length > 1) {
      var dx = event.touches[1].clientX - event.touches[0].clientX;
      var dy = event.touches[1].clientY - event.touches[0].clientY;
      startDistance = Math.sqrt(dx*dx + dy*dy);
    } else {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      dangerouslySetStyle(master, {
        transition: "none"
      });
    }
  };

  /**
   * [description]
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  var handleTouchMove = (event) => {
    didMove = true;
    var translateStr = 'translate(' + component.state.camera.x + 'px, ' + component.state.camera.y + 'px)';
    var scaleStr = 'scale(' + component.state.zoom + ')';
    if (event.touches.length > 1) {
      currentZoom = component.state.zoom;
      var dx = event.touches[1].clientX - event.touches[0].clientX;
      var dy = event.touches[1].clientY - event.touches[0].clientY;
      var distance = Math.sqrt(dx*dx + dy*dy);

      currentZoom = currentZoom + ((distance - startDistance) / ZOOM_SENSITIVITY);
      currentZoom = Math.min(Math.max(currentZoom, MIN_ZOOM), MAX_ZOOM);
      scaleStr = 'scale(' + currentZoom + ')';
    }

    var x = component.state.camera.x;
    var y = component.state.camera.y;
    currentX = x + (event.touches[0].clientX - startX);
    currentY = y + (event.touches[0].clientY - startY);
    translateStr = 'translate(' + currentX + 'px, ' + currentY + 'px)';

    endX = event.touches[0].clientX;
    endY = event.touches[0].clientY;

    // Only pan the bounding box if you're not zoomed in on a page
    if (!component.state.isPageZoomed) {
      dangerouslySetStyle(master, {
        transform: translateStr + ' ' + scaleStr
      });
    }
  };

  var handleSwipe = () => {
    var swipeDirection = calculateSwipe(startX, startY, endX, endY);

    if (swipeDirection) {
      var panTargets = {
        LEFT:  { x: component.state.zoomedPageCoords.x + 1, y: component.state.zoomedPageCoords.y     },
        RIGHT: { x: component.state.zoomedPageCoords.x - 1, y: component.state.zoomedPageCoords.y     },
        UP:    { x: component.state.zoomedPageCoords.x,     y: component.state.zoomedPageCoords.y + 1 },
        DOWN:  { x: component.state.zoomedPageCoords.x,     y: component.state.zoomedPageCoords.y - 1 }
      };

      // Determine if an adjacent page exists
      var isAdjacentPage = false;
      var target = panTargets[swipeDirection];

      component.state.pages.forEach(function (page) {
        if (page.coords.x === target.x && page.coords.y === target.y) {
          isAdjacentPage = true;
        }
      });

      if (isAdjacentPage) {
        component.zoomToPage(target);
      }
    }
  };

  /**
   * [description]
   * @param  {[type]} event [description]
   * @return {[type]}       [description]
   */
  var handleTouchEnd = (event) => {
    if (event.touches.length === 0) {
      dangerouslySetStyle(master, {
        trasition: ""
      });
      if (!didMove) {
        return;
      }

      if (!component.state.isPageZoomed) {
        var cameraUpdate = {camera: {
          x: currentX,
          y: currentYcameraUpdate
        }};

        if (typeof currentZoom !== 'undefined') {
          cameraUpdate.zoom = currentZoom;
        }
        component.setState(cameraUpdate);

        resetValues();
      }

      // Can this trigger?
      else { handleSwipe(); }
    }

    else {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
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
