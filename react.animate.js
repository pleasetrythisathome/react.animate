(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['underscore', 'react', 'd3'], factory);
  } else {
    // Browser globals
    root.amdWeb = factory(root._, root.React);
  }
}(this, function (_, React, d3) {

  React.Animate = {

    animate: function(attr, targetValue, duration, ease, callback) {
      var cmp = this;

      var targetState;

      if (_.isObject(attr)) {
        targetState = attr;

        ease = duration;
        duration = targetValue;
      } else {
        targetState = _.object([attr, targeValue]);
      }

      if (_.isFunction(ease)) {
        callback = ease;
        ease = null;
      }

      duration = duration || 500;
      ease = ease || "cubin-in-out";
      callback = callback || _.identity;

      // need to modify d3 source to support concurrent transtions
      // https://groups.google.com/forum/#!topic/d3-js/PwdFTn1ix2U
      // (based on old code) https://github.com/lgrammel/d3/commit/1dd3e6ead6ea33ef23b22eaacc91212a70a93f19

      // _.each(targetState, function(target, key) {
      //   cmp.animate(key, target, duration, ease);
      // });

      // until then, perform all at once

      var interpolators = _.map(targetState, function(target, key) {
        if (_.isFunction(target)) {
          return target;
        } else {
          return d3.interpolate(cmp.state[key], target);
        }
      });

      return d3.select(this.getDOMNode()).transition()
        .duration(duration)
        .ease(ease)
        .tween(attr, function() {
          return function(t) {
            cmp.setState(_.object(_.keys(targetState), _.invoke(interpolators, "call", cmp, t)));
          };
        })
        .each("end", callback);
    }
  };

  return React;

}));
