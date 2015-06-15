module.exports = {
  componentWillMount: function () {
    var width = 320;
    var height = 440;
    var gutter = 20;

    this.cartesian = new Cartesian({
      allCoords: [],
      width,
      height,
      gutter
    });
  },

  componentDidMount: function () {
    var el = this.getDOMNode();
    var bounding = this.refs.bounding;
    var boundingEl = bounding.getDOMNode();
    var startX, startY, endX, endY, startDistance, currentX, currentY, currentZoom;
    var didMove = false;

    // FIXME: TODO: all these things need to be done via render, not via
    //              style manipulation post-render.

    el.addEventListener('touchstart', (event) => {
      didMove = false;

      if (event.touches.length > 1) {
        var dx = event.touches[1].clientX - event.touches[0].clientX;
        var dy = event.touches[1].clientY - event.touches[0].clientY;
        startDistance = Math.sqrt(dx*dx + dy*dy);
      } else {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        boundingEl.style.transition = 'none';
      }

    });

    el.addEventListener('touchmove', (event) => {
      didMove = true;
      var translateStr = 'translate(' + this.state.camera.x + 'px, ' + this.state.camera.y + 'px)';
      var scaleStr = 'scale(' + this.state.zoom + ')';

      if (event.touches.length > 1) {
        currentZoom = this.state.zoom;
        var dx = event.touches[1].clientX - event.touches[0].clientX;
        var dy = event.touches[1].clientY - event.touches[0].clientY;
        var distance = Math.sqrt(dx*dx + dy*dy);

        // We know that we actually need to transform the target such that we maintain the
        // translation already in effect, but scale

        currentZoom = currentZoom + ((distance - startDistance) / ZOOM_SENSITIVITY);
        currentZoom = Math.min(Math.max(currentZoom, MIN_ZOOM), MAX_ZOOM);
        scaleStr = 'scale(' + currentZoom + ')';
      }

      var x = this.state.camera.x;
      var y = this.state.camera.y;
      currentX = x + (event.touches[0].clientX - startX);
      currentY = y + (event.touches[0].clientY - startY);
      translateStr = 'translate(' + currentX + 'px, ' + currentY + 'px)';

      endX = event.touches[0].clientX;
      endY = event.touches[0].clientY;

      // Only pan the bounding box if you're not zoomed in on a page
      if (!this.state.isPageZoomed) {
        boundingEl.style.transform = translateStr + ' ' + scaleStr;
      }
    });

    el.addEventListener('touchend', (event) => {
      if (event.touches.length === 0) {
        boundingEl.style.transition = '';
        if (!didMove) {
          return;
        }

        if (!this.state.isPageZoomed) {
          var state = {camera: {
            x: currentX,
            y: currentY
          }};

          if (typeof currentZoom !== 'undefined') {
            state.zoom = currentZoom;
          }
          this.setState(state);

          startX = undefined;
          startY = undefined;
          startDistance = undefined;
          currentX = undefined;
          currentY = undefined;
          currentZoom = undefined;
        } else {
          // Handle swipe
          var swipeDirection = calculateSwipe(startX, startY, endX, endY);

          if (swipeDirection) {
            var panTargets = {
              LEFT: {x: this.state.zoomedPageCoords.x + 1, y: this.state.zoomedPageCoords.y},
              RIGHT: {x: this.state.zoomedPageCoords.x - 1, y: this.state.zoomedPageCoords.y},
              UP: {x: this.state.zoomedPageCoords.x, y: this.state.zoomedPageCoords.y + 1},
              DOWN: {x: this.state.zoomedPageCoords.x, y: this.state.zoomedPageCoords.y - 1}
            };

            // Determine if an adjacent page exists
            var isAdjacentPage = false;
            var target = panTargets[swipeDirection];

            this.state.pages.forEach(function (page) {
              if (page.coords.x === target.x && page.coords.y === target.y) {
                isAdjacentPage = true;
              }
            });

            if (isAdjacentPage) {
              this.zoomToPage(target);
            }
          }
        }
      } else {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        this.state.camera.x = currentX;
        this.state.camera.y = currentY;
        this.state.zoom = currentZoom;
      }

    });
  }
};
