React.Animate
=============

A simple state animation mixin for React.js

Philosophy
------------

React.Animate is a different approach to animate based on state rather than direct DOM mutation using $.animate or similar.

While it's great that you can use refs to get DOM nodes after render, the biggest benefit to using react is that there is always a direct, observable, and testable relationship between component props, state, and the rendered output.

Mutating the dom directly is an antipattern.

What we really want to animate is not the DOM, it's component state.

If you think about animation as a transition from one state value from another, you can just interpolate state over an interval, and your component can rerender precisely in response to the current component state at every step.

At it's most simple, React.Animate allows you to transition between one state and another over a set interval.


```javascript
animate: function(attr, targetValue, duration, ease) {
  var cmp = this;

  var interpolator;
  if (_.isFunction(targetValue)) {
    interpolator = targetValue;
  } else {
    interpolator = d3.interpolate(this.state[attr], targetValue);
  }

  return d3.transition()
    .duration(duration || 500)
    .ease(ease || "cubic-in-out")
    .tween(attr, function() {
      return function(t) {
        cmp.setState(_.object([attr], [interpolator(t)]));
      };
    });
}
```

the included implemtation supports the same syntax as $.animate.

you can pass either

```javascript
this.animate(properties [, duration ] [, easing ] [, complete ] );
```

or

```javascript
this.animate(key, value [, duration ] [, easing ] [, complete ] );
```

Example
------------

React.Animate can be included in any React class by adding it to the mixins array

By animating state instead of the DOM directly, we can define logic that acts during certain parts of our animations.

```javascript
var component = React.createClass({
  mixins: [React.Animate],
  getInitialState: function() {
    return {
      width: 100
    };
  },
  render: function() {
    var heightBounds = [50, 100];

    return React.DOM.div({
      style: {
        width: this.state.width,
        height: Math.min(heightBounds[1], Math.max(heightBounds[0], this.state.width / 2))
      },
      onClick: this.randomSize
    });
  },
  randomSize: function() {
    this.animate({
      width: _.random(20, 300)
    }, 500, function() {
      console.log("random size reached!");
    });
  }
});
```

view in [jsfiddle](http://jsfiddle.net/mWAnw/2/)


Installation
------------

React.Animate can be installed with [bower](http://bower.io/) using

```
bower install react.animate --save
```

which will automatically pull the required React and Underscore dependencies.

to use React.Animate, include it in your page or build process after React and Underscore

Dependencies
------------

[d3.js](http://d3js.org/) provides a variety of flexible [interpolators](https://github.com/mbostock/d3/wiki/Transitions#d3_interpolate) and [easing functions](https://github.com/mbostock/d3/wiki/Transitions#d3_ease).

[underscore.js](http://underscorejs.org/) provides some functional sugar.

Limitations
------------

Due to the nature of d3's transition system, starting a new animation on a component will cancel the current running animation. This will change in the future to allow concurrent animation of different properties at different speeds, easing, etc.
