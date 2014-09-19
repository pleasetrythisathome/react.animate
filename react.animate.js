(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['underscore', 'react', 'ease'], factory);
  } else {
    // Browser globals
    root.amdWeb = factory(root._, root.React, root.Ease);
  }
}(this, function (_, React, Ease) {

  var requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame;

  var animator = function() {
    var date = (new Date).getTime();
    var alpha = (date - this.startTime) / this.duration;

    alpha = alpha > 1 ? 1 : alpha;

    var newState = {};
    var easeFunc = Ease[this.ease];
    for (var i in this.startState) {
      newState[i] = this.startState[i] + (this.endState[i] - this.startState[i]) * easeFunc(alpha);
    }
    this.component.setState(newState);

    if (alpha >= 1) {
      for (var i in this.startState) {
        delete this.component._reactAnimations[i];
      }
      this.callback();
    } else
      this.animation = requestAnimationFrame(animator.bind(this));
  };

  var removeAnimatorProperty = function(animator, property) {
    if (animator.startState[property] === undefined)
      return;

    delete animator.startState[property];
    delete animator.endState[property];

    if (_.keys(animator.startState).length < 1) {
      animator.callback();
    }
  };

  React.Animate = {

    animate: function() {
      // Default parameters
      var anim = {
        startTime: (new Date()).getTime(),
        animation: null,
        startState: {},
        endState: {},
        duration: 500,
        ease: "cubic-in-out",
        callback: _.identity,
        component: this,
      };

      // Parameter parsing
      var argIter = 0;
      if (_.isObject(arguments[argIter])) {
        anim.endState = arguments[argIter++];
      } else {
        anim.endState = _.object([arguments[argIter],
                                  arguments[argIter + 1]]);
        argIter += 2;
      }

      if (_.isNumber(arguments[argIter])) {
        anim.duration = arguments[argIter++];
      }

      if (_.isString(arguments[argIter])) {
        anim.ease = arguments[argIter++];
      }

      if (_.isFunction(arguments[argIter])) {
        anim.callback = arguments[argIter++];
      }

      // Save the animation object on the animated component
      if (!this._reactAnimations)
        this._reactAnimations = {};

      for (var i in anim.endState) {
        anim.startState[i] = (this.state[i] !== undefined ?
                              this.state[i] : this.endState[i]);
        // Stop currently running animation for a given property
        if (this._reactAnimations[i] !== undefined)
          removeAnimatorProperty(this._reactAnimations[i], i);
        this._reactAnimations[i] = anim;
      }

      // Kick the animation
      anim.animator = requestAnimationFrame(animator.bind(anim));
    }
  };

  return React;

}));
