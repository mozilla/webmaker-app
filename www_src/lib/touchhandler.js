(function() {
  "use strict";

  function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function resetTransform() {
    return {
      x1: false,
      y1: false,
      x2: false,
      y2: false,
      distance: 0,
      angle: 0
    };
  }

  function generator(positionable) {
    var transform = resetTransform();
    var mark = copy(positionable.state);
    var handlers = {
      /**
       * mark the first touch event so we can perform computation
       * relative to that coordinate.
       */
      startmark: function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if(!evt.touches || evt.touches.length === 1) {
          mark = copy(positionable.state);
          transform.x1 = evt.clientX || evt.touches[0].pageX;
          transform.y1 = evt.clientY || evt.touches[0].pageY;
          positionable.setState({ touchactive: true });
        } else { handlers.secondFinger(evt); }
      },

      /**
       * pan/move functionality relies on a single touch event being active.
       */
      panmove: function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (!transform.x1 && !transform.y1) return;
        if (evt.touches && evt.touches.length > 1) {
          return handlers.handleTouchRepositioning(evt);
        }
        var x = evt.clientX || evt.touches[0].pageX,
            y = evt.clientY || evt.touches[0].pageY;
        positionable.handleTranslation(x - transform.x1 + mark.x, y - transform.y1 + mark.y);
      },

      /**
       * When all fingers are off the device, stop being in "touch mode"
       */
      endmark: function(evt) {
        if(evt.touches && evt.touches.length > 0) {
          return handlers.endSecondFinger(evt);
        }
        mark = copy(positionable.state);
        transform = resetTransform();
        positionable.setState({ touchactive: false });
      },

      /**
       * A second finger means we need to start tracking another
       * event coordinate, which may lead to rotation and scaling
       * updates for the element we're working for.
       */
      secondFinger: function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (evt.touches.length < 2) return;
        // we need to rebind finger 1, because it may have moved!
        transform.x1 = evt.touches[0].pageX;
        transform.y1 = evt.touches[0].pageY;
        transform.x2 = evt.touches[1].pageX;
        transform.y2 = evt.touches[1].pageY;
        var x1 = transform.x1,
            y1 = transform.y1,
            x2 = transform.x2,
            y2 = transform.y2,
            dx = x2 - x1,
            dy = y2 - y1,
            d = Math.sqrt(dx*dx + dy*dy),
            a = Math.atan2(dy,dx);
        transform.distance = d;
        transform.angle = a;
      },

      /**
       * Processing coordinates for rotation/scaling
       */
      handleTouchRepositioning: function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (evt.touches.length < 2) return;
        var x1 = evt.touches[0].pageX,
            y1 = evt.touches[0].pageY,
            x2 = evt.touches[1].pageX,
            y2 = evt.touches[1].pageY,
            dx = x2 - x1,
            dy = y2 - y1,
            d = Math.sqrt(dx*dx + dy*dy),
            a = Math.atan2(dy,dx),
            da = a - transform.angle + mark.angle,
            s = d/transform.distance * mark.scale;
        positionable.handleRotationAndScale(da, s);
      },

      /**
       * When the second touch event ends, we might still need to
       * keep processing plain single touch updates.
       */
      endSecondFinger: function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if(evt.touches.length !== 1) return;
        handlers.startmark(evt);
      }
    };

    return handlers;
  };

  module.exports = generator;
}());
