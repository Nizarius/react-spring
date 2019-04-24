'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex
}

var _extends = _interopDefault(require('@babel/runtime/helpers/extends'))
var _objectWithoutPropertiesLoose = _interopDefault(
  require('@babel/runtime/helpers/objectWithoutPropertiesLoose')
)
var React = require('react')
var React__default = _interopDefault(React)
var _inheritsLoose = _interopDefault(
  require('@babel/runtime/helpers/inheritsLoose')
)
var _assertThisInitialized = _interopDefault(
  require('@babel/runtime/helpers/assertThisInitialized')
)

var is = {
  arr: Array.isArray,
  obj: function obj(a) {
    return Object.prototype.toString.call(a) === '[object Object]'
  },
  fun: function fun(a) {
    return typeof a === 'function'
  },
  str: function str(a) {
    return typeof a === 'string'
  },
  num: function num(a) {
    return typeof a === 'number'
  },
  und: function und(a) {
    return a === void 0
  },
  nul: function nul(a) {
    return a === null
  },
  boo: function boo(a) {
    return typeof a === 'boolean'
  },
  set: function set(a) {
    return a instanceof Set
  },
  map: function map(a) {
    return a instanceof Map
  },
  equ: function equ(a, b) {
    if (typeof a !== typeof b) return false
    if (is.str(a) || is.num(a)) return a === b
    if (
      is.obj(a) &&
      is.obj(b) &&
      Object.keys(a).length + Object.keys(b).length === 0
    )
      return true
    var i

    for (i in a) {
      if (!(i in b)) return false
    }

    for (i in b) {
      if (a[i] !== b[i]) return false
    }

    return is.und(i) ? a === b : true
  },
}
function useForceUpdate() {
  var _useState = React.useState(false),
    f = _useState[1]

  var forceUpdate = React.useCallback(function() {
    return f(function(v) {
      return !v
    })
  }, [])
  return forceUpdate
}
function withDefault(value, defaultValue) {
  return is.und(value) || is.nul(value) ? defaultValue : value
}
function toArray(a) {
  return !is.und(a) ? (is.arr(a) ? a : [a]) : []
}
function callProp(obj) {
  for (
    var _len = arguments.length,
      args = new Array(_len > 1 ? _len - 1 : 0),
      _key = 1;
    _key < _len;
    _key++
  ) {
    args[_key - 1] = arguments[_key]
  }

  return is.fun(obj) ? obj.apply(void 0, args) : obj
}

function getForwardProps(props) {
  var to = props.to,
    from = props.from,
    config = props.config,
    onStart = props.onStart,
    onRest = props.onRest,
    onFrame = props.onFrame,
    children = props.children,
    cancel = props.cancel,
    reset = props.reset,
    reverse = props.reverse,
    force = props.force,
    immediate = props.immediate,
    delay = props.delay,
    attach = props.attach,
    destroyed = props.destroyed,
    interpolateTo = props.interpolateTo,
    ref = props.ref,
    lazy = props.lazy,
    forward = _objectWithoutPropertiesLoose(props, [
      'to',
      'from',
      'config',
      'onStart',
      'onRest',
      'onFrame',
      'children',
      'cancel',
      'reset',
      'reverse',
      'force',
      'immediate',
      'delay',
      'attach',
      'destroyed',
      'interpolateTo',
      'ref',
      'lazy',
    ])

  return forward
}

function interpolateTo(props) {
  var forward = getForwardProps(props)
  props = Object.entries(props).reduce(function(props, _ref) {
    var key = _ref[0],
      value = _ref[1]
    return key in forward || (props[key] = value), props
  }, {})
  return _extends(
    {
      to: forward,
    },
    props
  )
}
function handleRef(ref, forward) {
  if (forward) {
    // If it's a function, assume it's a ref callback
    if (is.fun(forward)) forward(ref)
    else if (is.obj(forward)) {
      forward.current = ref
    }
  }

  return ref
}
function fillArray(length, mapIndex) {
  var arr = []

  for (var i = 0; i < length; i++) {
    arr.push(mapIndex(i))
  }

  return arr
}

/**
 * This tries to put deleted items back into the given `out` list in correct
 * order. Deleted items must have a `left` and `right` property with key of
 * their sibling which is used to find the correct placement.
 */
function reconcileDeleted(deleted, current) {
  // Copy as we will be mutating the arrays
  deleted = [].concat(deleted)
  current = [].concat(current) // Used to detect deadlock (when a pass finds 0 siblings)

  var failedTries = 0 // Track where the current pass start/ends

  var passIndex = 0
  var nextPassIndex = deleted.length // Insert all deleted items into `current`

  for (var i = 0; i < deleted.length; i++) {
    if (i === nextPassIndex) {
      // Sanity test: Push to end if somehow no siblings were found
      if (passIndex + failedTries === nextPassIndex) {
        for (var j = i; j < deleted.length; j++) {
          var _deleted$j = deleted[j],
            _left = _deleted$j.left,
            _right = _deleted$j.right,
            _deletedItem = _objectWithoutPropertiesLoose(_deleted$j, [
              'left',
              'right',
            ])

          current.push(_deletedItem)
        }

        break
      } // Update local state at the end of each pass

      passIndex = nextPassIndex
      nextPassIndex = deleted.length
      failedTries = 0
    } // The index of the deleted item in `current`

    var _index = -1 // Look for the left or right sibling in `current`

    var _deleted$i = deleted[i],
      left = _deleted$i.left,
      right = _deleted$i.right,
      deletedItem = _objectWithoutPropertiesLoose(_deleted$i, ['left', 'right'])

    for (var _j = current.length; --_j >= 0; ) {
      var _key2 = current[_j].originalKey

      if (_key2 === right) {
        _index = _j
        break
      }

      if (_key2 === left) {
        _index = _j + 1
        break
      }
    } // Items with no index are revisited in the next pass

    if (_index < 0) {
      failedTries++
      deleted.push(deleted[i])
    } else {
      current.splice(_index, 0, deletedItem)
    }
  }

  return current
}

var Animated =
  /*#__PURE__*/
  (function() {
    function Animated() {
      this.payload = void 0
      this.children = []
    }

    var _proto = Animated.prototype

    _proto.getAnimatedValue = function getAnimatedValue() {
      return this.getValue()
    }

    _proto.getPayload = function getPayload() {
      return this.payload || this
    }

    _proto.attach = function attach() {}

    _proto.detach = function detach() {}

    _proto.getChildren = function getChildren() {
      return this.children
    }

    _proto.addChild = function addChild(child) {
      if (this.children.length === 0) this.attach()
      this.children.push(child)
    }

    _proto.removeChild = function removeChild(child) {
      var index = this.children.indexOf(child)
      this.children.splice(index, 1)
      if (this.children.length === 0) this.detach()
    }

    return Animated
  })()
var AnimatedArray =
  /*#__PURE__*/
  (function(_Animated) {
    _inheritsLoose(AnimatedArray, _Animated)

    function AnimatedArray() {
      var _this

      for (
        var _len = arguments.length, args = new Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        args[_key] = arguments[_key]
      }

      _this = _Animated.call.apply(_Animated, [this].concat(args)) || this
      _this.payload = []

      _this.attach = function() {
        return _this.payload.forEach(function(p) {
          return (
            p instanceof Animated && p.addChild(_assertThisInitialized(_this))
          )
        })
      }

      _this.detach = function() {
        return _this.payload.forEach(function(p) {
          return (
            p instanceof Animated &&
            p.removeChild(_assertThisInitialized(_this))
          )
        })
      }

      return _this
    }

    return AnimatedArray
  })(Animated)
var AnimatedObject =
  /*#__PURE__*/
  (function(_Animated2) {
    _inheritsLoose(AnimatedObject, _Animated2)

    function AnimatedObject() {
      var _this2

      for (
        var _len3 = arguments.length, args = new Array(_len3), _key3 = 0;
        _key3 < _len3;
        _key3++
      ) {
        args[_key3] = arguments[_key3]
      }

      _this2 = _Animated2.call.apply(_Animated2, [this].concat(args)) || this
      _this2.payload = {}

      _this2.attach = function() {
        return Object.values(_this2.payload).forEach(function(s) {
          return (
            s instanceof Animated && s.addChild(_assertThisInitialized(_this2))
          )
        })
      }

      _this2.detach = function() {
        return Object.values(_this2.payload).forEach(function(s) {
          return (
            s instanceof Animated &&
            s.removeChild(_assertThisInitialized(_this2))
          )
        })
      }

      return _this2
    }

    var _proto2 = AnimatedObject.prototype

    _proto2.getValue = function getValue(animated) {
      if (animated === void 0) {
        animated = false
      }

      var payload = {}

      for (var _key4 in this.payload) {
        var value = this.payload[_key4]
        if (animated && !(value instanceof Animated)) continue
        payload[_key4] =
          value instanceof Animated
            ? value[animated ? 'getAnimatedValue' : 'getValue']()
            : value
      }

      return payload
    }

    _proto2.getAnimatedValue = function getAnimatedValue() {
      return this.getValue(true)
    }

    return AnimatedObject
  })(Animated)

//
// Required
var applyAnimatedValues //
// Optional
//

var now = function now() {
  return Date.now()
}
var colorNames = {}
var defaultElement
var manualFrameloop
var createAnimatedStyle
var createAnimatedTransform
var createAnimatedRef = function createAnimatedRef(node) {
  return node.current
}
var createStringInterpolator
var requestAnimationFrame =
  typeof window !== 'undefined' ? window.requestAnimationFrame : void 0
var cancelAnimationFrame =
  typeof window !== 'undefined' ? window.cancelAnimationFrame : void 0
var interpolation //
// Configuration
//

var assign = function assign(globals) {
  var _Object$assign

  return (
    (_Object$assign = Object.assign(
      {
        colorNames: colorNames,
        defaultElement: defaultElement,
        applyAnimatedValues: applyAnimatedValues,
        createStringInterpolator: createStringInterpolator,
        createAnimatedTransform: createAnimatedTransform,
        createAnimatedStyle: createAnimatedStyle,
        createAnimatedRef: createAnimatedRef,
        requestAnimationFrame: requestAnimationFrame,
        cancelAnimationFrame: cancelAnimationFrame,
        manualFrameloop: manualFrameloop,
        interpolation: interpolation,
      },
      globals
    )),
    (colorNames = _Object$assign.colorNames),
    (defaultElement = _Object$assign.defaultElement),
    (applyAnimatedValues = _Object$assign.applyAnimatedValues),
    (createStringInterpolator = _Object$assign.createStringInterpolator),
    (createAnimatedTransform = _Object$assign.createAnimatedTransform),
    (createAnimatedStyle = _Object$assign.createAnimatedStyle),
    (createAnimatedRef = _Object$assign.createAnimatedRef),
    (requestAnimationFrame = _Object$assign.requestAnimationFrame),
    (cancelAnimationFrame = _Object$assign.cancelAnimationFrame),
    (manualFrameloop = _Object$assign.manualFrameloop),
    (interpolation = _Object$assign.interpolation),
    _Object$assign
  )
}

var Globals = /*#__PURE__*/ Object.freeze({
  get applyAnimatedValues() {
    return applyAnimatedValues
  },
  now: now,
  get colorNames() {
    return colorNames
  },
  get defaultElement() {
    return defaultElement
  },
  get manualFrameloop() {
    return manualFrameloop
  },
  get createAnimatedStyle() {
    return createAnimatedStyle
  },
  get createAnimatedTransform() {
    return createAnimatedTransform
  },
  get createAnimatedRef() {
    return createAnimatedRef
  },
  get createStringInterpolator() {
    return createStringInterpolator
  },
  get requestAnimationFrame() {
    return requestAnimationFrame
  },
  get cancelAnimationFrame() {
    return cancelAnimationFrame
  },
  get interpolation() {
    return interpolation
  },
  assign: assign,
})

/**
 * Wraps the `style` property with `AnimatedStyle`.
 */

var AnimatedProps =
  /*#__PURE__*/
  (function(_AnimatedObject) {
    _inheritsLoose(AnimatedProps, _AnimatedObject)

    function AnimatedProps(props, callback) {
      var _this

      _this = _AnimatedObject.call(this) || this
      _this.update = void 0
      _this.payload =
        props.style && createAnimatedStyle
          ? _extends({}, props, {
              style: createAnimatedStyle(props.style),
            })
          : props
      _this.update = callback

      _this.attach()

      return _this
    }

    return AnimatedProps
  })(AnimatedObject)

var createAnimatedComponent = function createAnimatedComponent(Component) {
  var AnimatedComponent = React.forwardRef(function(props, _ref) {
    var forceUpdate = useForceUpdate()
    var mounted = React.useRef(true)
    var propsAnimated = React.useRef(null)
    var node = React.useRef(null)
    var attachProps = React.useCallback(function(props) {
      var oldPropsAnimated = propsAnimated.current

      var callback = function callback() {
        if (node.current) {
          var didUpdate = applyAnimatedValues(
            node.current,
            propsAnimated.current.getAnimatedValue()
          )
          if (didUpdate === false) forceUpdate()
        }
      }

      propsAnimated.current = new AnimatedProps(props, callback)
      oldPropsAnimated && oldPropsAnimated.detach()
    }, [])
    React.useEffect(function() {
      return function() {
        mounted.current = false
        propsAnimated.current && propsAnimated.current.detach()
      }
    }, [])
    React.useImperativeHandle(_ref, function() {
      return createAnimatedRef(node, mounted, forceUpdate)
    })
    attachProps(props)

    var _getValue = propsAnimated.current.getValue(),
      scrollTop = _getValue.scrollTop,
      scrollLeft = _getValue.scrollLeft,
      animatedProps = _objectWithoutPropertiesLoose(_getValue, [
        'scrollTop',
        'scrollLeft',
      ])

    return React__default.createElement(
      Component,
      _extends({}, animatedProps, {
        ref: function ref(childRef) {
          return (node.current = handleRef(childRef, _ref))
        },
      })
    )
  })
  return AnimatedComponent
}
/**
 * withExtend(animated, options = {})
 */

/** Add an `extend` method to your `animated` factory function */
function withExtend(animated, options) {
  if (options === void 0) {
    options = {}
  }

  var self = animated

  self.extend = function() {
    for (
      var _len = arguments.length, args = new Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      args[_key] = arguments[_key]
    }

    args.forEach(function(arg) {
      return extend(arg)
    })
    return self
  }

  return self

  function extend(arg, overrideKey) {
    // Arrays avoid passing their index to `extend`
    if (is.arr(arg)) {
      return arg.forEach(function(arg) {
        return extend(arg)
      })
    } // Object keys are always used over value inspection

    if (is.obj(arg)) {
      for (var _key2 in arg) {
        extend(arg[_key2], _key2)
      }

      return
    } // Use the `overrideKey` or inspect the value for a key

    var key = is.str(overrideKey)
      ? overrideKey
      : is.str(arg)
      ? arg
      : arg && is.str(arg.displayName)
      ? arg.displayName
      : is.fun(arg)
      ? arg.name
      : '' // This lowercases the first letter of the key

    if (options.lowercase) {
      key = key[0].toLowerCase() + key.slice(1)
    } // NOTE(typescript): Properties are not yet inferred from the arguments of
    // the `extend` method and then attached to the `animated` function via
    // the return type.

    self[key] = animated(arg)
  }
}

function createInterpolator(range, output, extrapolate) {
  if (typeof range === 'function') {
    return range
  }

  if (Array.isArray(range)) {
    return createInterpolator({
      range: range,
      output: output,
      extrapolate: extrapolate,
    })
  }

  if (interpolation && typeof range.output[0] === 'string') {
    return interpolation(range)
  }

  var config = range
  var outputRange = config.output
  var inputRange = config.range || [0, 1]
  var extrapolateLeft = config.extrapolateLeft || config.extrapolate || 'extend'
  var extrapolateRight =
    config.extrapolateRight || config.extrapolate || 'extend'

  var easing =
    config.easing ||
    function(t) {
      return t
    }

  return function(input) {
    var range = findRange(input, inputRange)
    return interpolate(
      input,
      inputRange[range],
      inputRange[range + 1],
      outputRange[range],
      outputRange[range + 1],
      easing,
      extrapolateLeft,
      extrapolateRight,
      config.map
    )
  }
}

function interpolate(
  input,
  inputMin,
  inputMax,
  outputMin,
  outputMax,
  easing,
  extrapolateLeft,
  extrapolateRight,
  map
) {
  var result = map ? map(input) : input // Extrapolate

  if (result < inputMin) {
    if (extrapolateLeft === 'identity') return result
    else if (extrapolateLeft === 'clamp') result = inputMin
  }

  if (result > inputMax) {
    if (extrapolateRight === 'identity') return result
    else if (extrapolateRight === 'clamp') result = inputMax
  }

  if (outputMin === outputMax) return outputMin
  if (inputMin === inputMax) return input <= inputMin ? outputMin : outputMax // Input Range

  if (inputMin === -Infinity) result = -result
  else if (inputMax === Infinity) result = result - inputMin
  else result = (result - inputMin) / (inputMax - inputMin) // Easing

  result = easing(result) // Output Range

  if (outputMin === -Infinity) result = -result
  else if (outputMax === Infinity) result = result + outputMin
  else result = result * (outputMax - outputMin) + outputMin
  return result
}

function findRange(input, inputRange) {
  for (var i = 1; i < inputRange.length - 1; ++i) {
    if (inputRange[i] >= input) break
  }

  return i - 1
}

var AnimatedInterpolation =
  /*#__PURE__*/
  (function(_AnimatedArray) {
    _inheritsLoose(AnimatedInterpolation, _AnimatedArray)

    function AnimatedInterpolation(parents, range, output) {
      var _this

      _this = _AnimatedArray.call(this) || this
      _this.calc = void 0
      _this.calc = createInterpolator(range, output)
      _this.payload =
        parents instanceof AnimatedArray &&
        !(parents instanceof AnimatedInterpolation)
          ? parents.getPayload()
          : Array.isArray(parents)
          ? parents
          : [parents]
      return _this
    }

    var _proto = AnimatedInterpolation.prototype

    _proto.getValue = function getValue() {
      return this.calc.apply(
        this,
        this.payload.map(function(value) {
          return value.getValue()
        })
      )
    }

    _proto.interpolate = function interpolate(range, output) {
      return new AnimatedInterpolation(this, range, output)
    }

    return AnimatedInterpolation
  })(AnimatedArray)

var interpolate$1 = function interpolate(parents, range, output) {
  return parents && new AnimatedInterpolation(parents, range, output)
}

var config = {
  default: {
    tension: 170,
    friction: 26,
  },
  gentle: {
    tension: 120,
    friction: 14,
  },
  wobbly: {
    tension: 180,
    friction: 12,
  },
  stiff: {
    tension: 210,
    friction: 20,
  },
  slow: {
    tension: 280,
    friction: 60,
  },
  molasses: {
    tension: 280,
    friction: 120,
  },
}

/** API
 *  useChain(references, timeSteps, timeFrame)
 */

function useChain(refs, timeSteps, timeFrame) {
  if (timeFrame === void 0) {
    timeFrame = 1000
  }

  React.useEffect(function() {
    if (timeSteps) {
      var prevDelay = 0
      refs.forEach(function(ref, i) {
        if (!ref.current) return
        var controllers = ref.current.controllers

        if (controllers.length) {
          var delay = timeFrame * timeSteps[i] // Use the previous delay if none exists.

          if (isNaN(delay)) delay = prevDelay
          else prevDelay = delay
          controllers.forEach(function(ctrl) {
            ctrl.queue.forEach(function(props) {
              return (props.delay += delay)
            })
            ctrl.start()
          })
        }
      })
    } else {
      var p = Promise.resolve()
      refs.forEach(function(ref) {
        if (!ref.current) return
        var _ref$current = ref.current,
          controllers = _ref$current.controllers,
          start = _ref$current.start

        if (controllers.length) {
          // Take the queue of each controller
          var updates = controllers.map(function(ctrl) {
            var q = ctrl.queue
            ctrl.queue = []
            return q
          }) // Apply the queue when the previous ref stops animating

          p = p.then(function() {
            controllers.forEach(function(ctrl, i) {
              var _ctrl$queue

              return (_ctrl$queue = ctrl.queue).push.apply(
                _ctrl$queue,
                updates[i]
              )
            })
            return start()
          })
        }
      })
    }
  })
}

/**
 * Animated works by building a directed acyclic graph of dependencies
 * transparently when you render your Animated components.
 *
 *               new Animated.Value(0)
 *     .interpolate()        .interpolate()    new Animated.Value(1)
 *         opacity               translateY      scale
 *          style                         transform
 *         View#234                         style
 *                                         View#123
 *
 * A) Top Down phase
 * When an AnimatedValue is updated, we recursively go down through this
 * graph in order to find leaf nodes: the views that we flag as needing
 * an update.
 *
 * B) Bottom Up phase
 * When a view is flagged as needing an update, we recursively go back up
 * in order to build the new value that it needs. The reason why we need
 * this two-phases process is to deal with composite props such as
 * transform which can receive values from multiple parents.
 */

function addAnimatedStyles(node, styles) {
  if ('update' in node) {
    styles.add(node)
  } else {
    node.getChildren().forEach(function(child) {
      return addAnimatedStyles(child, styles)
    })
  }
}

var AnimatedValue =
  /*#__PURE__*/
  (function(_Animated) {
    _inheritsLoose(AnimatedValue, _Animated)

    function AnimatedValue(_value) {
      var _this

      _this = _Animated.call(this) || this
      _this.animatedStyles = new Set()
      _this.value = void 0
      _this.startPosition = void 0
      _this.lastPosition = void 0
      _this.lastVelocity = void 0
      _this.startTime = void 0
      _this.lastTime = void 0
      _this.done = false

      _this.setValue = function(value, flush) {
        if (flush === void 0) {
          flush = true
        }

        _this.value = value
        if (flush) _this.flush()
      }

      _this.value = _value
      _this.startPosition = _value
      _this.lastPosition = _value
      return _this
    }

    var _proto = AnimatedValue.prototype

    _proto.flush = function flush() {
      if (this.animatedStyles.size === 0) {
        addAnimatedStyles(this, this.animatedStyles)
      }

      this.animatedStyles.forEach(function(animatedStyle) {
        return animatedStyle.update()
      })
    }

    _proto.clearStyles = function clearStyles() {
      this.animatedStyles.clear()
    }

    _proto.getValue = function getValue() {
      return this.value
    }

    _proto.interpolate = function interpolate(range, output) {
      return new AnimatedInterpolation(this, range, output)
    }

    _proto.reset = function reset(isActive) {
      this.startPosition = this.value
      this.lastPosition = this.value
      this.lastVelocity = isActive ? this.lastVelocity : undefined
      this.lastTime = isActive ? this.lastTime : undefined
      this.startTime = now()
      this.done = false
      this.animatedStyles.clear()
    }

    return AnimatedValue
  })(Animated)

var AnimatedValueArray =
  /*#__PURE__*/
  (function(_AnimatedArray) {
    _inheritsLoose(AnimatedValueArray, _AnimatedArray)

    function AnimatedValueArray(values) {
      var _this

      _this = _AnimatedArray.call(this) || this
      _this.payload = values
      return _this
    }

    var _proto = AnimatedValueArray.prototype

    _proto.setValue = function setValue(value, flush) {
      var _this2 = this

      if (flush === void 0) {
        flush = true
      }

      if (Array.isArray(value)) {
        if (value.length === this.payload.length) {
          value.forEach(function(v, i) {
            return _this2.payload[i].setValue(v, flush)
          })
        }
      } else {
        this.payload.forEach(function(p) {
          return p.setValue(value, flush)
        })
      }
    }

    _proto.getValue = function getValue() {
      return this.payload.map(function(v) {
        return v.getValue()
      })
    }

    _proto.interpolate = function interpolate(range, output) {
      return new AnimatedInterpolation(this, range, output)
    }

    return AnimatedValueArray
  })(AnimatedArray)

var active = false
var controllers = new Set()

var update = function update() {
  if (!active) return false
  var time = now()

  for (
    var _iterator = controllers,
      _isArray = Array.isArray(_iterator),
      _i = 0,
      _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();
    ;

  ) {
    var _ref

    if (_isArray) {
      if (_i >= _iterator.length) break
      _ref = _iterator[_i++]
    } else {
      _i = _iterator.next()
      if (_i.done) break
      _ref = _i.value
    }

    var controller = _ref
    var isActive = false // Number of updated animations

    var updateCount = 0

    for (
      var configIdx = 0;
      configIdx < controller.configs.length;
      configIdx++
    ) {
      var config = controller.configs[configIdx]
      var endOfAnimation = void 0,
        lastTime = void 0

      for (var valIdx = 0; valIdx < config.animatedValues.length; valIdx++) {
        var animated = config.animatedValues[valIdx]
        if (animated.done) continue
        updateCount++
        var to = config.toValues[valIdx]
        var isAnimated = to instanceof Animated
        if (isAnimated) to = to.getValue() // Jump to end value for immediate animations

        if (config.immediate) {
          animated.setValue(to)
          animated.done = true
          continue
        }

        var from = config.fromValues[valIdx] // Break animation when string values are involved

        if (typeof from === 'string' || typeof to === 'string') {
          animated.setValue(to)
          animated.done = true
          continue
        }

        var position = animated.lastPosition
        var velocity = Array.isArray(config.initialVelocity)
          ? config.initialVelocity[valIdx]
          : config.initialVelocity

        if (config.duration !== void 0) {
          /** Duration easing */
          position =
            from +
            config.easing((time - animated.startTime) / config.duration) *
              (to - from)
          endOfAnimation = time >= animated.startTime + config.duration
        } else if (config.decay) {
          /** Decay easing */
          position =
            from +
            (velocity / (1 - 0.998)) *
              (1 - Math.exp(-(1 - 0.998) * (time - animated.startTime)))
          endOfAnimation = Math.abs(animated.lastPosition - position) < 0.1
          if (endOfAnimation) to = position
        } else {
          /** Spring easing */
          lastTime = animated.lastTime !== void 0 ? animated.lastTime : time
          velocity =
            animated.lastVelocity !== void 0
              ? animated.lastVelocity
              : config.initialVelocity // If we lost a lot of frames just jump to the end.

          if (time > lastTime + 64) lastTime = time // http://gafferongames.com/game-physics/fix-your-timestep/

          var numSteps = Math.floor(time - lastTime)

          for (var i = 0; i < numSteps; ++i) {
            var force = -config.tension * (position - to)
            var damping = -config.friction * velocity
            var acceleration = (force + damping) / config.mass
            velocity = velocity + (acceleration * 1) / 1000
            position = position + (velocity * 1) / 1000
          } // Conditions for stopping the spring animation

          var isOvershooting =
            config.clamp && config.tension !== 0
              ? from < to
                ? position > to
                : position < to
              : false
          var isVelocity = Math.abs(velocity) <= config.precision
          var isDisplacement =
            config.tension !== 0
              ? Math.abs(to - position) <= config.precision
              : true
          endOfAnimation = isOvershooting || (isVelocity && isDisplacement)
          animated.lastVelocity = velocity
          animated.lastTime = time
        } // Trails aren't done until their parents conclude

        if (isAnimated && !config.toValues[valIdx].done) endOfAnimation = false

        if (endOfAnimation) {
          // Ensure that we end up with a round value
          if (animated.value !== to) position = to
          animated.done = true
        } else isActive = true

        animated.setValue(position)
        animated.lastPosition = position
      } // Keep track of updated values only when necessary

      if (controller.props.onFrame) {
        controller.values[config.key] = config.animated.getValue()
      }
    }

    controller.onFrame(isActive, updateCount)
  } // Loop over as long as there are controllers ...

  if (controllers.size) {
    if (manualFrameloop) manualFrameloop()
    else requestAnimationFrame(update)
  } else {
    active = false
  }

  return active
}

var start = function start(controller) {
  controllers.add(controller)

  if (!active) {
    active = true
    if (manualFrameloop) manualFrameloop()
    else requestAnimationFrame(update)
  }
}

var stop = function stop(controller) {
  controllers.delete(controller)
}

// Default easing
var linear = function linear(t) {
  return t
}

var emptyObj = Object.freeze({})
var nextId = 1

var Controller =
  /*#__PURE__*/
  (function() {
    function Controller(props) {
      this.id = nextId++
      this.idle = true
      this.props = {}
      this.queue = []
      this.timestamps = {}
      this.values = {}
      this.merged = {}
      this.animated = {}
      this.animations = {}
      this.configs = []
      this.onEndQueue = []
      this.runCount = 0
      if (props) this.update(props).start()
    }
    /**
     * Push props into the update queue. The props are used after `start` is
     * called and any delay is over. The props are intelligently diffed to ensure
     * that later calls to this method properly override any delayed props.
     * The `propsArg` argument is always copied before mutations are made.
     */

    var _proto = Controller.prototype

    _proto.update = function update$$1(propsArg) {
      if (!propsArg) return this
      var props = interpolateTo(propsArg) // For async animations, the `from` prop must be defined for
      // the Animated nodes to exist before animations have started.

      this._ensureAnimated(props.from)

      this._ensureAnimated(props.to)

      props.timestamp = now() // The `delay` prop of every update must be a number >= 0

      if (is.fun(props.delay) && is.obj(props.to)) {
        var from = props.from || emptyObj

        for (var _key in props.to) {
          var _to, _ref

          this.queue.push(
            _extends({}, props, {
              to: ((_to = {}), (_to[_key] = props.to[_key]), _to),
              from:
                _key in from
                  ? ((_ref = {}), (_ref[_key] = from[_key]), _ref)
                  : void 0,
              delay: Math.max(0, Math.round(props.delay(_key))),
            })
          )
        }
      } else {
        props.delay = is.num(props.delay)
          ? Math.max(0, Math.round(props.delay))
          : 0 // Coerce falsy values to undefined for these props

        if (!props.to) props.to = void 0
        if (!props.from) props.from = void 0
        this.queue.push(props)
      }

      return this
    }
    /**
     * Flush the update queue.
     * If the queue is empty, try starting the frameloop.
     */

    _proto.start = function start$$1(onEnd) {
      if (this.queue.length) this._flush(onEnd)
      else this._start(onEnd)
      return this
    }
    /** Stop one animation or all animations */

    _proto.stop = function stop$$1() {
      var _this = this

      for (
        var _len = arguments.length, keys = new Array(_len), _key2 = 0;
        _key2 < _len;
        _key2++
      ) {
        keys[_key2] = arguments[_key2]
      }

      var finished = false

      if (is.boo(keys[0])) {
        var _keys = keys
        finished = _keys[0]
        keys = _keys.slice(1)
      } // Stop animations by key

      if (keys.length) {
        var _loop = function _loop() {
          if (_isArray) {
            if (_i >= _iterator.length) return 'break'
            _ref2 = _iterator[_i++]
          } else {
            _i = _iterator.next()
            if (_i.done) return 'break'
            _ref2 = _i.value
          }

          var key = _ref2

          var index = _this.configs.findIndex(function(config) {
            return key === config.key
          })

          _this._stopAnimation(key)

          _this.configs[index] = _this.animations[key]
        }

        for (
          var _iterator = keys,
            _isArray = Array.isArray(_iterator),
            _i = 0,
            _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();
          ;

        ) {
          var _ref2

          var _ret = _loop()

          if (_ret === 'break') break
        }
      } // Stop all animations
      else if (this.runCount) {
        // Stop all async animations
        this.animations = _extends({}, this.animations) // Update the animation configs

        this.configs.forEach(function(config) {
          return _this._stopAnimation(config.key)
        })
        this.configs = Object.values(this.animations) // Exit the frameloop

        this._stop(finished)
      }

      return this
    }
    /** @internal Called by the frameloop */

    _proto.onFrame = function onFrame(isActive, updateCount) {
      if (updateCount) {
        var onFrame = this.props.onFrame
        if (onFrame) onFrame(this.values)
      }

      if (!isActive) this._stop(true)
    }
    /** Reset the internal state */

    _proto.destroy = function destroy() {
      this.stop()
      this.props = {}
      this.timestamps = {}
      this.values = {}
      this.merged = {}
      this.animated = {}
      this.animations = {}
      this.configs = []
    }
    /**
     * Set a prop for the next animations where the prop is undefined. The given
     * value is overridden by the next update where the prop is defined.
     *
     * Ongoing animations are not changed.
     */

    _proto.setProp = function setProp(key, value) {
      this.props[key] = value
      this.timestamps[key] = now()
      return this
    } // Create an Animated node if none exists.

    _proto._ensureAnimated = function _ensureAnimated(values) {
      if (!is.obj(values)) return

      for (var _key3 in values) {
        if (this.animated[_key3]) continue
        var value = values[_key3]
        var animated = createAnimated(value)

        if (animated) {
          this.animated[_key3] = animated

          this._stopAnimation(_key3)
        } else {
          console.warn('Given value not animatable:', value)
        }
      }
    } // Listen for all animations to end.

    _proto._onEnd = function _onEnd(onEnd) {
      if (this.runCount) this.onEndQueue.push(onEnd)
      else onEnd(true)
    } // Add this controller to the frameloop.

    _proto._start = function _start(onEnd) {
      if (onEnd) this._onEnd(onEnd)

      if (this.idle && this.runCount) {
        this.idle = false
        start(this)
      }
    } // Remove this controller from the frameloop, and notify any listeners.

    _proto._stop = function _stop(finished) {
      this.idle = true
      stop(this)
      var onEndQueue = this.onEndQueue

      if (onEndQueue.length) {
        this.onEndQueue = []
        onEndQueue.forEach(function(onEnd) {
          return onEnd(finished)
        })
      }
    } // Execute the current queue of prop updates.

    _proto._flush = function _flush(onEnd) {
      var _this2 = this

      var queue = this.queue.reduce(reduceDelays, [])
      this.queue.length = 0 // Track the number of active `_run` calls.

      var runsLeft = Object.keys(queue).length
      this.runCount += runsLeft // Never assume that the last update always finishes last, since that's
      // not true when 2+ async updates have indeterminate durations.

      var onRunEnd = function onRunEnd(finished) {
        _this2.runCount--
        if (--runsLeft) return
        if (onEnd) onEnd(finished)

        if (!_this2.runCount && finished) {
          var onRest = _this2.props.onRest
          if (onRest) onRest(_this2.merged)
        }
      }

      queue.forEach(function(props, delay) {
        if (delay)
          setTimeout(function() {
            return _this2._run(props, onRunEnd)
          }, delay)
        else _this2._run(props, onRunEnd)
      })
    } // Update the props and animations

    _proto._run = function _run(props, onEnd) {
      if (is.arr(props.to) || is.fun(props.to)) {
        this._runAsync(props, onEnd)
      } else if (this._diff(props)) {
        this._animate(props)._start(onEnd)
      } else {
        this._onEnd(onEnd)
      }
    } // Start an async chain or an async script.

    _proto._runAsync = function _runAsync(_ref3, onEnd) {
      var _this3 = this

      var to = _ref3.to,
        props = _objectWithoutPropertiesLoose(_ref3, ['to'])

      // Merge other props immediately.
      if (this._diff(props)) {
        this._animate(props)
      } // Async scripts can be declaratively cancelled.

      if (props.cancel === true) {
        this.props.asyncTo = void 0
        return onEnd(false)
      } // Never run more than one script at a time.

      if (
        !this._diff({
          asyncTo: to,
          timestamp: props.timestamp,
        })
      ) {
        return onEnd(false)
      }

      var animations = this.animations

      var isCancelled = function isCancelled() {
        return (
          // The `stop` and `destroy` methods replace the `animations` map.
          animations !== _this3.animations || // Async scripts are cancelled when a new chain/script begins.
          (is.fun(to) && to !== _this3.props.asyncTo)
        )
      }

      var last

      var next = function next(props) {
        if (isCancelled()) throw _this3
        return (last = new Promise(function(done) {
          _this3.update(props).start(done)
        })).then(function() {
          if (isCancelled()) throw _this3
        })
      }

      var queue = Promise.resolve()

      if (is.arr(to)) {
        to.forEach(function(props) {
          return (queue = queue.then(function() {
            return next(props)
          }))
        })
      } else if (is.fun(to)) {
        queue = queue.then(function() {
          return to(next, _this3.stop.bind(_this3)) // Always wait for the last update.
            .then(function() {
              return last
            })
        })
      }

      queue
        .catch(function(err) {
          return err !== _this3 && console.error(err)
        })
        .then(function() {
          return onEnd(!isCancelled())
        })
    } // Merge every fresh prop. Returns true if one or more props changed.
    // These props are ignored: (config, immediate, reverse)

    _proto._diff = function _diff(_ref4) {
      var _this4 = this

      var timestamp = _ref4.timestamp,
        config = _ref4.config,
        immediate = _ref4.immediate,
        reverse = _ref4.reverse,
        props = _objectWithoutPropertiesLoose(_ref4, [
          'timestamp',
          'config',
          'immediate',
          'reverse',
        ])

      var changed = false // Ensure the newer timestamp is used.

      var diffTimestamp = function diffTimestamp(keyPath) {
        var previous = _this4.timestamps[keyPath]

        if (is.und(previous) || timestamp >= previous) {
          _this4.timestamps[keyPath] = timestamp
          return true
        }

        return false
      } // Generalized diffing algorithm

      var diffProp = function diffProp(keys, value, parent) {
        if (is.und(value)) return
        var lastKey = keys[keys.length - 1]

        if (is.obj(value)) {
          if (!is.obj(parent[lastKey])) parent[lastKey] = {}

          for (var _key4 in value) {
            diffProp(keys.concat(_key4), value[_key4], parent[lastKey])
          }
        } else if (diffTimestamp(keys.join('.'))) {
          var oldValue = parent[lastKey]

          if (!is.equ(value, oldValue)) {
            changed = true
            parent[lastKey] = value
          }
        }
      }

      if (reverse) {
        var to = props.to
        props.to = props.from
        props.from = is.obj(to) ? to : void 0
      }

      for (var _key5 in props) {
        diffProp([_key5], props[_key5], this.props)
      } // These props only affect one update

      if (props.reset) this.props.reset = false
      if (props.cancel) this.props.cancel = false
      return changed
    } // Return true if the given prop was changed by this update

    _proto._isModified = function _isModified(props, prop) {
      return this.timestamps[prop] === props.timestamp
    } // Update the animation configs. The given props override any default props.

    _proto._animate = function _animate(props) {
      var _this5 = this

      var _this$props = this.props,
        _this$props$from = _this$props.from,
        from = _this$props$from === void 0 ? emptyObj : _this$props$from,
        _this$props$to = _this$props.to,
        to = _this$props$to === void 0 ? emptyObj : _this$props$to,
        attach = _this$props.attach,
        onStart = _this$props.onStart

      var isPrevented = function isPrevented(_) {
        return false
      }

      if (props.cancel && this._isModified(props, 'cancel')) {
        // Stop all animations when `cancel` is true
        if (props.cancel === true) {
          return this.stop()
        } // Prevent matching properties from animating when
        // `cancel` is a string or array of strings

        var keys = toArray(props.cancel)

        if (is.arr(keys) && keys.length) {
          isPrevented = function isPrevented(key) {
            return keys.indexOf(key) >= 0
          }

          this.stop.apply(this, keys)
        }
      } // Merge `from` values with `to` values

      this.merged = _extends({}, from, to) // True if any animation was updated

      var changed = false // The animations that are starting or restarting

      var started = [] // Attachment handling, trailed springs can "attach" themselves to a previous spring

      var target = attach && attach(this) // Reduces input { key: value } pairs into animation objects

      for (var _key6 in this.merged) {
        if (isPrevented(_key6)) continue
        var state = this.animations[_key6]

        if (!state) {
          console.warn(
            'Failed to animate key: "' +
              _key6 +
              '"\n' +
              ('Did you forget to define "from.' +
                _key6 +
                '" for an async animation?')
          )
          continue
        } // Reuse the Animated nodes whenever possible

        var animated = state.animated,
          animatedValues = state.animatedValues
        var value = this.merged[_key6]
        var goalValue = computeGoalValue(value) // Stop animations with a goal value equal to its current value.

        if (!props.reset && is.equ(goalValue, animated.getValue())) {
          // The animation might be stopped already.
          if (!state.idle) {
            changed = true

            this._stopAnimation(_key6)
          }

          continue
        } // Replace an animation when its goal value is changed (or it's been reset)

        if (props.reset || !is.equ(goalValue, state.goalValue)) {
          var _ret2 = (function() {
            var _ref5 = is.und(props.immediate) ? _this5.props : props,
              immediate = _ref5.immediate

            immediate = !!callProp(immediate, _key6)
            var isActive = animatedValues.some(function(v) {
              return !v.done
            })
            var fromValue = !is.und(from[_key6])
              ? computeGoalValue(from[_key6])
              : goalValue // Animatable strings use interpolation

            var isInterpolated = isAnimatableString(value)

            if (isInterpolated) {
              var output = [
                props.reset ? fromValue : animated.getValue(),
                goalValue,
              ]
              var input = animatedValues[0]

              if (input) {
                input.setValue(0, false)
                input.reset(isActive)
              } else {
                input = new AnimatedValue(0)
              }

              try {
                var prev = animated
                animated = input.interpolate({
                  output: output,
                })
                moveChildren(prev, animated)
              } catch (err) {
                console.warn(
                  'Failed to interpolate string from "%s" to "%s"',
                  output[0],
                  output[1]
                )
                console.error(err)
                return 'continue'
              }

              if (immediate) {
                input.setValue(1, false)
              }
            } else {
              // Convert values into Animated nodes (reusing nodes whenever possible)
              if (is.arr(value)) {
                if (animated instanceof AnimatedValueArray) {
                  if (props.reset) animated.setValue(fromValue, false)
                  animatedValues.forEach(function(v) {
                    return v.reset(isActive)
                  })
                } else {
                  var _prev = animated
                  animated = createAnimated(fromValue)
                  moveChildren(_prev, animated)
                }
              } else {
                if (animated instanceof AnimatedValue) {
                  if (props.reset) animated.setValue(fromValue, false)
                  animated.reset(isActive)
                } else {
                  var _prev2 = animated
                  animated = new AnimatedValue(fromValue)
                  moveChildren(_prev2, animated)
                }
              }

              if (immediate) {
                animated.setValue(goalValue, false)
              }
            } // Only change the "config" of updated animations.

            var config =
              callProp(props.config, _key6) ||
              callProp(_this5.props.config, _key6) ||
              emptyObj

            if (!immediate) {
              started.push(_key6)
            }

            changed = true
            animatedValues = toArray(animated.getPayload())
            _this5.animations[_key6] = {
              key: _key6,
              idle: false,
              goalValue: goalValue,
              toValues: toArray(
                target
                  ? target.animations[_key6].animated.getPayload()
                  : (isInterpolated && 1) || goalValue
              ),
              fromValues: animatedValues.map(function(v) {
                return v.getValue()
              }),
              animated: animated,
              animatedValues: animatedValues,
              immediate: immediate,
              duration: config.duration,
              easing: withDefault(config.easing, linear),
              decay: config.decay,
              mass: withDefault(config.mass, 1),
              tension: withDefault(config.tension, 170),
              friction: withDefault(config.friction, 26),
              initialVelocity: withDefault(config.velocity, 0),
              clamp: withDefault(config.clamp, false),
              precision: withDefault(config.precision, 0.01),
              config: config,
            }
          })()

          if (_ret2 === 'continue') continue
        }
      }

      if (changed) {
        if (onStart && started.length) {
          started.forEach(function(key) {
            return onStart(_this5.animations[key])
          })
        } // Make animations available to the frameloop

        var configs = (this.configs = [])
        var values = (this.values = {})
        var nodes = (this.animated = {})

        for (var _key7 in this.animations) {
          var config = this.animations[_key7]
          configs.push(config)
          values[_key7] = config.animated.getValue()
          nodes[_key7] = config.animated
        }
      }

      return this
    } // Stop an animation by its key

    _proto._stopAnimation = function _stopAnimation(key) {
      if (!this.animated[key]) return
      var state = this.animations[key]
      if (state && state.idle) return

      var _ref6 = state || emptyObj,
        animated = _ref6.animated,
        animatedValues = _ref6.animatedValues

      if (!state) {
        animated = this.animated[key]
        animatedValues = toArray(animated.getPayload())
      } // Tell the frameloop to stop animating these values

      animatedValues.forEach(function(v) {
        return (v.done = true)
      }) // Prevent any pending updates to this key

      this.timestamps['to.' + key] = now() // The current value becomes the goal value,
      // which ensures the integrity of the diffing algorithm.

      var goalValue = animated.getValue()

      if (this.props.to) {
        this.props.to[key] = goalValue
      } // Remove unused data from this key's animation config

      this.animations[key] = {
        key: key,
        idle: true,
        goalValue: goalValue,
        animated: animated,
        animatedValues: animatedValues,
      }
    }

    return Controller
  })()
/** Wrap any value with an `Animated` node */

function createAnimated(value) {
  return is.arr(value)
    ? new AnimatedValueArray(
        value.map(function(value) {
          var animated = createAnimated(value)
          var payload = animated.getPayload()
          return animated instanceof AnimatedInterpolation
            ? payload[0]
            : payload
        })
      )
    : isAnimatableString(value)
    ? new AnimatedValue(0).interpolate({
        output: [value, value],
      })
    : new AnimatedValue(value)
}
/**
 * Replace an `Animated` node in the graph.
 * This is most useful for async updates, which don't cause a re-render.
 */

function moveChildren(prev, next) {
  var children = prev.getChildren().slice()
  children.forEach(function(child) {
    prev.removeChild(child)
    next.addChild(child) // Replace `prev` with `next` in child payloads

    var payload = child.getPayload()

    if (is.arr(payload)) {
      var i = payload.indexOf(prev)

      if (i >= 0) {
        var copy = [].concat(payload)
        copy[i] = next
        child['payload'] = copy
      }
    } else if (is.obj(payload)) {
      var entry = Object.entries(payload).find(function(entry) {
        return entry[1] === prev
      })

      if (entry) {
        var _extends2

        child['payload'] = _extends(
          {},
          payload,
          ((_extends2 = {}), (_extends2[entry[0]] = next), _extends2)
        )
      }
    }
  })
} // Merge updates with the same delay.
// NOTE: Mutation of `props` may occur!

function reduceDelays(merged, props) {
  var prev = merged[props.delay]

  if (prev) {
    props.to = merge(prev.to, props.to)
    props.from = merge(prev.from, props.from)
    Object.assign(prev, props)
  } else {
    merged[props.delay] = props
  }

  return merged
}

function merge(dest, src) {
  return is.obj(dest) && is.obj(src) ? _extends({}, dest, src) : src || dest
} // Not all strings can be animated (eg: {display: "none"})

function isAnimatableString(value) {
  if (!is.str(value)) return false
  return value.startsWith('#') || /\d/.test(value) || !!colorNames[value]
} // Compute the goal value, converting "red" to "rgba(255, 0, 0, 1)" in the process

function computeGoalValue(value) {
  return is.arr(value)
    ? value.map(computeGoalValue)
    : isAnimatableString(value)
    ? interpolation({
        range: [0, 1],
        output: [value, value],
      })(1)
    : value
}

/** API
 * const props = useSprings(number, [{ ... }, { ... }, ...])
 * const [props, set] = useSprings(number, (i, controller) => ({ ... }))
 */

var useSprings = function useSprings(length, propsArg) {
  var mounted = React.useRef(false)
  var ctrl = React.useRef()
  var isFn = is.fun(propsArg) // The `propsArg` coerced into an array

  var props = isFn ? [] : propsArg // The controller maintains the animation values, starts and stops animations

  var _useMemo = React.useMemo(
      function() {
        var ref, controllers
        return [
          // Recreate the controllers whenever `length` changes
          (controllers = fillArray(length, function(i) {
            var c = new Controller()
            var p = props[i] || (props[i] = callProp(propsArg, i, c))
            if (i === 0) ref = p.ref
            return c.update(p)
          })), // This updates the controllers with new props
          function(props) {
            var isFn = is.fun(props)
            if (!isFn) props = toArray(props)
            controllers.forEach(function(c, i) {
              c.update(isFn ? callProp(props, i, c) : props[i])
              if (!ref) c.start()
            })
          }, // The imperative API is accessed via ref
          ref,
          ref && {
            start: function start() {
              return Promise.all(
                controllers.map(function(c) {
                  return new Promise(function(r) {
                    return c.start(r)
                  })
                })
              )
            },
            stop: function stop(finished) {
              return controllers.forEach(function(c) {
                return c.stop(finished)
              })
            },
            controllers: controllers,
          },
        ]
      },
      [length]
    ),
    controllers = _useMemo[0],
    setProps = _useMemo[1],
    ref = _useMemo[2],
    api = _useMemo[3] // Attach the imperative API to its ref

  React.useImperativeHandle(
    ref,
    function() {
      return api
    },
    [api]
  ) // Once mounted, update the local state and start any animations.

  React.useEffect(function() {
    if (!isFn || ctrl.current !== controllers) {
      controllers.forEach(function(c, i) {
        var p = props[i] // Set the default props for async updates

        c.setProp('config', p.config)
        c.setProp('immediate', p.immediate)
      })
    }

    if (ctrl.current !== controllers) {
      if (ctrl.current)
        ctrl.current.forEach(function(c) {
          return c.destroy()
        })
      ctrl.current = controllers
    }

    if (mounted.current) {
      if (!isFn) setProps(props)
    } else if (!ref) {
      controllers.forEach(function(c) {
        return c.start()
      })
    }
  }) // Update mounted flag and destroy controller on unmount

  React.useEffect(function() {
    mounted.current = true
    return function() {
      return ctrl.current.forEach(function(c) {
        return c.destroy()
      })
    }
  }, []) // Return animated props, or, anim-props + the update-setter above

  var animatedProps = controllers.map(function(c) {
    return c.animated
  })
  return isFn
    ? [
        animatedProps,
        setProps,
        function() {
          for (
            var _len = arguments.length, args = new Array(_len), _key = 0;
            _key < _len;
            _key++
          ) {
            args[_key] = arguments[_key]
          }

          return ctrl.current.forEach(function(c) {
            return c.stop.apply(c, args)
          })
        },
      ]
    : animatedProps
}

/** API
 * const props = useSpring({ ... })
 * const [props, set] = useSpring(() => ({ ... }))
 */

var useSpring = function useSpring(props) {
  var isFn = is.fun(props)

  var _useSprings = useSprings(1, isFn ? props : [props]),
    result = _useSprings[0],
    set = _useSprings[1],
    stop = _useSprings[2]

  return isFn ? [result[0], set, stop] : result
}

/** API
 * const trails = useTrail(number, { ... })
 * const [trails, set] = useTrail(number, () => ({ ... }))
 */

var useTrail = function useTrail(length, props) {
  var mounted = React.useRef(false)
  var isFn = is.fun(props)
  var updateProps = callProp(props)
  var instances = React.useRef()

  var _useSprings = useSprings(length, function(i, ctrl) {
      if (i === 0) instances.current = []
      instances.current.push(ctrl)
      return _extends({}, updateProps, {
        config: callProp(updateProps.config, i),
        attach:
          i > 0 &&
          function() {
            return instances.current[i - 1]
          },
      })
    }),
    result = _useSprings[0],
    set = _useSprings[1],
    stop = _useSprings[2] // Set up function to update controller

  var updateCtrl = React.useMemo(
    function() {
      return function(props) {
        return set(function(i, ctrl) {
          var last = props.reverse ? i === 0 : length - 1 === i
          var attachIdx = props.reverse ? i + 1 : i - 1
          var attachController = instances.current[attachIdx]
          return _extends({}, props, {
            config: callProp(props.config || updateProps.config, i),
            attach:
              !!attachController &&
              function() {
                return attachController
              },
          })
        })
      }
    },
    [length, updateProps.config]
  ) // Update controller if props aren't functional

  React.useEffect(function() {
    return void (mounted.current && !isFn && updateCtrl(props))
  }) // Update mounted flag and destroy controller on unmount

  React.useEffect(function() {
    return void (mounted.current = true)
  }, [])
  return isFn ? [result, updateCtrl, stop] : result
}

/** API
 * const transitions = useTransition(items, itemKeys, { ... })
 * const [transitions, update] = useTransition(items, itemKeys, () => ({ ... }))
 */

var guid = 0
var INITIAL = 'initial'
var ENTER = 'enter'
var UPDATE = 'update'
var LEAVE = 'leave'

var makeKeys = function makeKeys(items, keys) {
  return (typeof keys === 'function' ? items.map(keys) : toArray(keys)).map(
    String
  )
}

var makeConfig = function makeConfig(props) {
  var items = props.items,
    keys = props.keys,
    rest = _objectWithoutPropertiesLoose(props, ['items', 'keys'])

  items = toArray(is.und(items) ? null : items)
  return _extends(
    {
      items: items,
      keys: makeKeys(items, keys),
    },
    rest
  )
}

function useTransition(input, keyTransform, props) {
  props = makeConfig(
    _extends({}, props, {
      items: input,
      keys:
        keyTransform ||
        function(i) {
          return i
        },
    })
  )

  var _props = props,
    _props$lazy = _props.lazy,
    lazy = _props$lazy === void 0 ? false : _props$lazy,
    _props$unique = _props.unique,
    from = _props.from,
    enter = _props.enter,
    leave = _props.leave,
    update = _props.update,
    onDestroyed = _props.onDestroyed,
    keys = _props.keys,
    items = _props.items,
    onFrame = _props.onFrame,
    _onRest = _props.onRest,
    onStart = _props.onStart,
    ref = _props.ref,
    extra = _objectWithoutPropertiesLoose(_props, [
      'lazy',
      'unique',
      'from',
      'enter',
      'leave',
      'update',
      'onDestroyed',
      'keys',
      'items',
      'onFrame',
      'onRest',
      'onStart',
      'ref',
    ])

  var forceUpdate = useForceUpdate()
  var mounted = React.useRef(false)
  var state = React.useRef({
    mounted: false,
    first: true,
    deleted: [],
    current: {},
    transitions: [],
    prevProps: {},
    paused: !!props.ref,
    instances: !mounted.current && new Map(),
    forceUpdate: forceUpdate,
  })
  React.useImperativeHandle(props.ref, function() {
    return {
      start: function start() {
        return Promise.all(
          Array.from(state.current.instances).map(function(_ref) {
            var c = _ref[1]
            return new Promise(function(r) {
              return c.start(r)
            })
          })
        )
      },
      stop: function stop(finished) {
        return Array.from(state.current.instances).forEach(function(_ref2) {
          var c = _ref2[1]
          return c.stop(finished)
        })
      },

      get controllers() {
        return Array.from(state.current.instances).map(function(_ref3) {
          var c = _ref3[1]
          return c
        })
      },
    }
  }) // Update state

  state.current = diffItems(state.current, props)

  if (state.current.changed) {
    // Update state
    state.current.transitions.forEach(function(transition) {
      var phase = transition.phase,
        key = transition.key,
        item = transition.item,
        props = transition.props
      if (!state.current.instances.has(key))
        state.current.instances.set(key, new Controller()) // Avoid calling `onStart` more than once per transition.

      var started = false // update the map object

      var ctrl = state.current.instances.get(key)

      var itemProps = _extends({}, extra, props, {
        ref: ref,
        onRest: function onRest(values) {
          if (state.current.mounted) {
            if (transition.destroyed) {
              // If no ref is given delete destroyed items immediately
              if (!ref && !lazy) cleanUp(state, key)
              if (onDestroyed) onDestroyed(item)
            } // A transition comes to rest once all its springs conclude

            var curInstances = Array.from(state.current.instances)
            var active = curInstances.some(function(_ref4) {
              var c = _ref4[1]
              return !c.idle
            })

            if (!active && (ref || lazy) && state.current.deleted.length > 0) {
              cleanUp(state)
            }

            if (_onRest) {
              _onRest(item, phase, values)
            }
          }
        },
        onFrame:
          onFrame &&
          function(values) {
            return onFrame(item, phase, values)
          },
        onStart:
          onStart &&
          function(animation) {
            return (
              started || (started = (onStart(item, phase, animation), true))
            )
          }, // Update controller
      })

      ctrl.update(itemProps)
      if (!state.current.paused) ctrl.start()
    })
  }

  React.useEffect(function() {
    state.current.mounted = mounted.current = true
    return function() {
      state.current.mounted = mounted.current = false
      Array.from(state.current.instances).map(function(_ref5) {
        var c = _ref5[1]
        return c.destroy()
      })
      state.current.instances.clear()
    }
  }, [])
  return state.current.transitions.map(function(_ref6) {
    var item = _ref6.item,
      phase = _ref6.phase,
      key = _ref6.key
    return {
      item: item,
      key: key,
      phase: phase,
      props: state.current.instances.get(key).animated,
    }
  })
}

function cleanUp(_ref7, filterKey) {
  var state = _ref7.current
  var deleted = state.deleted

  var _loop = function _loop() {
    if (_isArray) {
      if (_i >= _iterator.length) return 'break'
      _ref9 = _iterator[_i++]
    } else {
      _i = _iterator.next()
      if (_i.done) return 'break'
      _ref9 = _i.value
    }

    var _ref8 = _ref9
    var key = _ref8.key

    var filter = function filter(t) {
      return t.key !== key
    }

    if (is.und(filterKey) || filterKey === key) {
      state.instances.delete(key)
      state.transitions = state.transitions.filter(filter)
      state.deleted = state.deleted.filter(filter)
    }
  }

  for (
    var _iterator = deleted,
      _isArray = Array.isArray(_iterator),
      _i = 0,
      _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();
    ;

  ) {
    var _ref9

    var _ret = _loop()

    if (_ret === 'break') break
  }

  state.forceUpdate()
}

function diffItems(_ref10, props) {
  var first = _ref10.first,
    current = _ref10.current,
    deleted = _ref10.deleted,
    prevProps = _ref10.prevProps,
    state = _objectWithoutPropertiesLoose(_ref10, [
      'first',
      'current',
      'deleted',
      'prevProps',
    ])

  var items = props.items,
    keys = props.keys,
    initial = props.initial,
    from = props.from,
    enter = props.enter,
    leave = props.leave,
    update = props.update,
    _props$trail = props.trail,
    trail = _props$trail === void 0 ? 0 : _props$trail,
    unique = props.unique,
    config = props.config,
    _props$order = props.order,
    order = _props$order === void 0 ? [ENTER, LEAVE, UPDATE] : _props$order

  var _makeConfig = makeConfig(prevProps),
    _keys = _makeConfig.keys,
    _items = _makeConfig.items

  if (props.reset) {
    current = {}
    state.transitions = []
  } // Compare next keys with current keys

  var currentKeys = Object.keys(current)
  var currentSet = new Set(currentKeys)
  var nextSet = new Set(keys)
  var addedKeys = keys.filter(function(key) {
    return !currentSet.has(key)
  })
  var updatedKeys = update
    ? keys.filter(function(key) {
        return currentSet.has(key)
      })
    : []
  var deletedKeys = state.transitions
    .filter(function(t) {
      return !t.destroyed && !nextSet.has(t.originalKey)
    })
    .map(function(t) {
      return t.originalKey
    })
  var delay = -trail

  var _loop2 = function _loop2() {
    var phase = order.shift()

    if (phase === ENTER) {
      if (first && !is.und(initial)) {
        phase = INITIAL
        from = initial
      }

      addedKeys.forEach(function(key) {
        // In unique mode, remove fading out transitions if their key comes in again
        if (
          unique &&
          deleted.find(function(d) {
            return d.originalKey === key
          })
        ) {
          deleted = deleted.filter(function(t) {
            return t.originalKey !== key
          })
        }

        var i = keys.indexOf(key)
        var item = items[i]
        var enterProps = callProp(enter, item, i)
        current[key] = {
          phase: phase,
          originalKey: key,
          key: unique ? String(key) : guid++,
          item: item,
          props: _extends(
            {
              delay: (delay += trail),
              config: callProp(config, item, phase),
              from: callProp(from, item),
              to: enterProps,
            },
            is.obj(enterProps) && interpolateTo(enterProps)
          ),
        }
      })
    } else if (phase === LEAVE) {
      deletedKeys.forEach(function(key) {
        var i = _keys.indexOf(key)

        var item = _items[i]
        var leaveProps = callProp(leave, item, i)
        deleted.push(
          _extends({}, current[key], {
            phase: phase,
            destroyed: true,
            left: _keys[i - 1],
            right: _keys[i + 1],
            props: _extends(
              {
                delay: (delay += trail),
                config: callProp(config, item, phase),
                to: leaveProps,
              },
              is.obj(leaveProps) && interpolateTo(leaveProps)
            ),
          })
        )
        delete current[key]
      })
    } else if (phase === UPDATE) {
      updatedKeys.forEach(function(key) {
        var i = keys.indexOf(key)
        var item = items[i]
        var updateProps = callProp(update, item, i)
        current[key] = _extends({}, current[key], {
          phase: phase,
          props: _extends(
            {
              delay: (delay += trail),
              config: callProp(config, item, phase),
              to: updateProps,
            },
            is.obj(updateProps) && interpolateTo(updateProps)
          ),
        })
      })
    }
  }

  while (order.length) {
    _loop2()
  }

  var out = keys.map(function(key) {
    return current[key]
  })
  out = reconcileDeleted(deleted, out)
  return _extends({}, state, {
    first: first && !addedKeys.length,
    changed: !!(addedKeys.length || deletedKeys.length || updatedKeys.length),
    transitions: out,
    current: current,
    deleted: deleted,
    prevProps: props,
  })
}

function Spring(_ref) {
  var children = _ref.children,
    props = _objectWithoutPropertiesLoose(_ref, ['children'])

  var spring = useSpring(props)
  return children(spring)
}
function Trail(_ref2) {
  var items = _ref2.items,
    children = _ref2.children,
    props = _objectWithoutPropertiesLoose(_ref2, ['items', 'children'])

  var trails = useTrail(items.length, props)
  return items.map(function(item, index) {
    return children(item)(trails[index])
  })
}
function Transition(_ref3) {
  var items = _ref3.items,
    _ref3$keys = _ref3.keys,
    keys = _ref3$keys === void 0 ? null : _ref3$keys,
    children = _ref3.children,
    props = _objectWithoutPropertiesLoose(_ref3, ['items', 'keys', 'children'])

  var transitions = useTransition(items, keys, props)
  return transitions.map(function(_ref4, index) {
    var item = _ref4.item,
      key = _ref4.key,
      props = _ref4.props,
      slot = _ref4.slot
    var el = children(item, slot, index)(props)
    return React__default.createElement(
      el.type,
      _extends(
        {
          key: key,
        },
        el.props
      )
    )
  })
}

// Solution: https://stackoverflow.com/questions/638565/parsing-scientific-notation-sensibly/658662

var stringShapeRegex = /[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g

var createStringInterpolator$1 = function createStringInterpolator$$1(
  config$$1
) {
  var outputRange = config$$1.output
  var outputRanges = outputRange[0].match(stringShapeRegex).map(function() {
    return []
  })
  outputRange.forEach(function(value) {
    value.match(stringShapeRegex).forEach(function(number, i) {
      return outputRanges[i].push(+number)
    })
  })
  var interpolations = outputRange[0]
    .match(stringShapeRegex)
    .map(function(_, i) {
      return createInterpolator(
        _extends({}, config$$1, {
          output: outputRanges[i],
        })
      )
    })
  return function(input) {
    var i = 0
    return outputRange[0].replace(stringShapeRegex, function() {
      return interpolations[i++](input)
    })
  }
}

assign({
  createStringInterpolator: createStringInterpolator$1,
  applyAnimatedValues: function applyAnimatedValues$$1() {
    return false
  },
})
var animatedFn = withExtend(createAnimatedComponent)
/** @deprecated Use `animated.extend` instead */

var apply = animatedFn.extend
var Interpolation = {
  create: createInterpolator,
}

exports.apply = apply
exports.config = config
exports.animated = animatedFn
exports.a = animatedFn
exports.interpolate = interpolate$1
exports.Globals = Globals
exports.useSpring = useSpring
exports.useTrail = useTrail
exports.useTransition = useTransition
exports.useChain = useChain
exports.useSprings = useSprings
exports.Interpolation = Interpolation
exports.Spring = Spring
exports.Trail = Trail
exports.Transition = Transition