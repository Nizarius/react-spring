import * as THREE from 'three'
import { addEffect, invalidate, applyProps } from 'react-three-fiber'
import _extends from '@babel/runtime/helpers/esm/extends'
import _objectWithoutPropertiesLoose from '@babel/runtime/helpers/esm/objectWithoutPropertiesLoose'
import React, {
  useState,
  useCallback,
  forwardRef,
  useRef,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react'

class Animated {
  constructor() {
    this.payload = void 0
    this.children = []
  }

  getAnimatedValue() {
    return this.getValue()
  }

  getPayload() {
    return this.payload || this
  }

  attach() {}

  detach() {}

  getChildren() {
    return this.children
  }

  addChild(child) {
    if (this.children.length === 0) this.attach()
    this.children.push(child)
  }

  removeChild(child) {
    const index = this.children.indexOf(child)
    this.children.splice(index, 1)
    if (this.children.length === 0) this.detach()
  }
}
class AnimatedArray extends Animated {
  constructor() {
    super(...arguments)
    this.payload = []

    this.attach = () =>
      this.payload.forEach(p => p instanceof Animated && p.addChild(this))

    this.detach = () =>
      this.payload.forEach(p => p instanceof Animated && p.removeChild(this))
  }
}
class AnimatedObject extends Animated {
  constructor() {
    super(...arguments)
    this.payload = {}

    this.attach = () =>
      Object.values(this.payload).forEach(
        s => s instanceof Animated && s.addChild(this)
      )

    this.detach = () =>
      Object.values(this.payload).forEach(
        s => s instanceof Animated && s.removeChild(this)
      )
  }

  getValue(animated) {
    if (animated === void 0) {
      animated = false
    }

    const payload = {}

    for (const key in this.payload) {
      const value = this.payload[key]
      if (animated && !(value instanceof Animated)) continue
      payload[key] =
        value instanceof Animated
          ? value[animated ? 'getAnimatedValue' : 'getValue']()
          : value
    }

    return payload
  }

  getAnimatedValue() {
    return this.getValue(true)
  }
}

let applyAnimatedValues
function injectApplyAnimatedValues(fn, transform) {
  applyAnimatedValues = {
    fn,
    transform,
  }
}
let colorNames
function injectColorNames(names) {
  colorNames = names
}
let requestFrame = cb =>
  typeof window !== 'undefined' ? window.requestAnimationFrame(cb) : -1
let cancelFrame = id => {
  typeof window !== 'undefined' && window.cancelAnimationFrame(id)
}
function injectFrame(raf, caf) {
  requestFrame = raf
  cancelFrame = caf
}
let interpolation
function injectStringInterpolator(fn) {
  interpolation = fn
}
let now = () => Date.now()
function injectNow(nowFn) {
  now = nowFn
}
let defaultElement
function injectDefaultElement(el) {
  defaultElement = el
}
let animatedApi = node => node.current
function injectAnimatedApi(fn) {
  animatedApi = fn
}
let createAnimatedStyle
function injectCreateAnimatedStyle(factory) {
  createAnimatedStyle = factory
}
let manualFrameloop
function injectManualFrameloop(callback) {
  manualFrameloop = callback
}

var Globals = /*#__PURE__*/ Object.freeze({
  get applyAnimatedValues() {
    return applyAnimatedValues
  },
  injectApplyAnimatedValues: injectApplyAnimatedValues,
  get colorNames() {
    return colorNames
  },
  injectColorNames: injectColorNames,
  get requestFrame() {
    return requestFrame
  },
  get cancelFrame() {
    return cancelFrame
  },
  injectFrame: injectFrame,
  get interpolation() {
    return interpolation
  },
  injectStringInterpolator: injectStringInterpolator,
  get now() {
    return now
  },
  injectNow: injectNow,
  get defaultElement() {
    return defaultElement
  },
  injectDefaultElement: injectDefaultElement,
  get animatedApi() {
    return animatedApi
  },
  injectAnimatedApi: injectAnimatedApi,
  get createAnimatedStyle() {
    return createAnimatedStyle
  },
  injectCreateAnimatedStyle: injectCreateAnimatedStyle,
  get manualFrameloop() {
    return manualFrameloop
  },
  injectManualFrameloop: injectManualFrameloop,
})

function createInterpolator(range, output, extrapolate) {
  if (typeof range === 'function') {
    return range
  }

  if (Array.isArray(range)) {
    return createInterpolator({
      range,
      output: output,
      extrapolate,
    })
  }

  if (interpolation && typeof range.output[0] === 'string') {
    return interpolation(range)
  }

  const config = range
  const outputRange = config.output
  const inputRange = config.range || [0, 1]
  const extrapolateLeft =
    config.extrapolateLeft || config.extrapolate || 'extend'
  const extrapolateRight =
    config.extrapolateRight || config.extrapolate || 'extend'

  const easing = config.easing || (t => t)

  return input => {
    const range = findRange(input, inputRange)
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
  let result = map ? map(input) : input // Extrapolate

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
  for (var i = 1; i < inputRange.length - 1; ++i)
    if (inputRange[i] >= input) break

  return i - 1
}

class AnimatedInterpolation extends AnimatedArray {
  constructor(parents, range, output) {
    super()
    this.calc = void 0
    this.payload =
      parents instanceof AnimatedArray &&
      !(parents instanceof AnimatedInterpolation)
        ? parents.getPayload()
        : Array.isArray(parents)
        ? parents
        : [parents]
    this.calc = createInterpolator(range, output)
  }

  getValue() {
    return this.calc(...this.payload.map(value => value.getValue()))
  }

  updateConfig(range, output) {
    this.calc = createInterpolator(range, output)
  }

  interpolate(range, output) {
    return new AnimatedInterpolation(this, range, output)
  }
}

const interpolate$1 = (parents, range, output) =>
  parents && new AnimatedInterpolation(parents, range, output)

const is = {
  arr: Array.isArray,
  obj: a => Object.prototype.toString.call(a) === '[object Object]',
  fun: a => typeof a === 'function',
  str: a => typeof a === 'string',
  num: a => typeof a === 'number',
  und: a => a === void 0,
  nul: a => a === null,
  boo: a => typeof a === 'boolean',
  set: a => a instanceof Set,
  map: a => a instanceof Map,

  equ(a, b) {
    if (typeof a !== typeof b) return false
    if (is.str(a) || is.num(a)) return a === b
    if (
      is.obj(a) &&
      is.obj(b) &&
      Object.keys(a).length + Object.keys(b).length === 0
    )
      return true
    let i

    for (i in a) if (!(i in b)) return false

    for (i in b) if (a[i] !== b[i]) return false

    return is.und(i) ? a === b : true
  },
}
function merge(target, lowercase) {
  if (lowercase === void 0) {
    lowercase = true
  }

  return object =>
    (is.arr(object) ? object : Object.keys(object)).reduce((acc, element) => {
      const key = lowercase
        ? element[0].toLowerCase() + element.substring(1)
        : element
      acc[key] = target(key)
      return acc
    }, target)
}
function useForceUpdate() {
  const _useState = useState(false),
    f = _useState[1]

  const forceUpdate = useCallback(() => f(v => !v), [])
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

  return is.fun(obj) ? obj(...args) : obj
}

function getForwardProps(props) {
  const to = props.to,
    from = props.from,
    config = props.config,
    onStart = props.onStart,
    onRest = props.onRest,
    onFrame = props.onFrame,
    children = props.children,
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
  const forward = getForwardProps(props)
  props = Object.entries(props).reduce((props, _ref) => {
    let key = _ref[0],
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
  const arr = []

  for (let i = 0; i < length; i++) arr.push(mapIndex(i))

  return arr
}

/**
 * Wraps the `style` property with `AnimatedStyle`.
 */

class AnimatedProps extends AnimatedObject {
  constructor(props, callback) {
    super()
    this.update = void 0
    this.payload = !props.style
      ? props
      : _extends({}, props, {
          style: createAnimatedStyle(props.style),
        })
    this.update = callback
    this.attach()
  }
}

const createAnimatedComponent = Component => {
  const AnimatedComponent = forwardRef((props, _ref) => {
    const forceUpdate = useForceUpdate()
    const mounted = useRef(true)
    const propsAnimated = useRef(null)
    const node = useRef(null)
    const attachProps = useCallback(props => {
      const oldPropsAnimated = propsAnimated.current

      const callback = () => {
        if (node.current) {
          const didUpdate = applyAnimatedValues.fn(
            node.current,
            propsAnimated.current.getAnimatedValue()
          )
          if (didUpdate === false) forceUpdate()
        }
      }

      propsAnimated.current = new AnimatedProps(props, callback)
      oldPropsAnimated && oldPropsAnimated.detach()
    }, [])
    useEffect(
      () => () => {
        mounted.current = false
        propsAnimated.current && propsAnimated.current.detach()
      },
      []
    )
    useImperativeHandle(_ref, () => animatedApi(node, mounted, forceUpdate))
    attachProps(props)

    const _getValue = propsAnimated.current.getValue(),
      scrollTop = _getValue.scrollTop,
      scrollLeft = _getValue.scrollLeft,
      animatedProps = _objectWithoutPropertiesLoose(_getValue, [
        'scrollTop',
        'scrollLeft',
      ])

    return React.createElement(
      Component,
      _extends({}, animatedProps, {
        ref: childRef => (node.current = handleRef(childRef, _ref)),
      })
    )
  })
  return AnimatedComponent
}

// http://www.w3.org/TR/css3-color/#svg-color
const colors = {
  transparent: 0x00000000,
  aliceblue: 0xf0f8ffff,
  antiquewhite: 0xfaebd7ff,
  aqua: 0x00ffffff,
  aquamarine: 0x7fffd4ff,
  azure: 0xf0ffffff,
  beige: 0xf5f5dcff,
  bisque: 0xffe4c4ff,
  black: 0x000000ff,
  blanchedalmond: 0xffebcdff,
  blue: 0x0000ffff,
  blueviolet: 0x8a2be2ff,
  brown: 0xa52a2aff,
  burlywood: 0xdeb887ff,
  burntsienna: 0xea7e5dff,
  cadetblue: 0x5f9ea0ff,
  chartreuse: 0x7fff00ff,
  chocolate: 0xd2691eff,
  coral: 0xff7f50ff,
  cornflowerblue: 0x6495edff,
  cornsilk: 0xfff8dcff,
  crimson: 0xdc143cff,
  cyan: 0x00ffffff,
  darkblue: 0x00008bff,
  darkcyan: 0x008b8bff,
  darkgoldenrod: 0xb8860bff,
  darkgray: 0xa9a9a9ff,
  darkgreen: 0x006400ff,
  darkgrey: 0xa9a9a9ff,
  darkkhaki: 0xbdb76bff,
  darkmagenta: 0x8b008bff,
  darkolivegreen: 0x556b2fff,
  darkorange: 0xff8c00ff,
  darkorchid: 0x9932ccff,
  darkred: 0x8b0000ff,
  darksalmon: 0xe9967aff,
  darkseagreen: 0x8fbc8fff,
  darkslateblue: 0x483d8bff,
  darkslategray: 0x2f4f4fff,
  darkslategrey: 0x2f4f4fff,
  darkturquoise: 0x00ced1ff,
  darkviolet: 0x9400d3ff,
  deeppink: 0xff1493ff,
  deepskyblue: 0x00bfffff,
  dimgray: 0x696969ff,
  dimgrey: 0x696969ff,
  dodgerblue: 0x1e90ffff,
  firebrick: 0xb22222ff,
  floralwhite: 0xfffaf0ff,
  forestgreen: 0x228b22ff,
  fuchsia: 0xff00ffff,
  gainsboro: 0xdcdcdcff,
  ghostwhite: 0xf8f8ffff,
  gold: 0xffd700ff,
  goldenrod: 0xdaa520ff,
  gray: 0x808080ff,
  green: 0x008000ff,
  greenyellow: 0xadff2fff,
  grey: 0x808080ff,
  honeydew: 0xf0fff0ff,
  hotpink: 0xff69b4ff,
  indianred: 0xcd5c5cff,
  indigo: 0x4b0082ff,
  ivory: 0xfffff0ff,
  khaki: 0xf0e68cff,
  lavender: 0xe6e6faff,
  lavenderblush: 0xfff0f5ff,
  lawngreen: 0x7cfc00ff,
  lemonchiffon: 0xfffacdff,
  lightblue: 0xadd8e6ff,
  lightcoral: 0xf08080ff,
  lightcyan: 0xe0ffffff,
  lightgoldenrodyellow: 0xfafad2ff,
  lightgray: 0xd3d3d3ff,
  lightgreen: 0x90ee90ff,
  lightgrey: 0xd3d3d3ff,
  lightpink: 0xffb6c1ff,
  lightsalmon: 0xffa07aff,
  lightseagreen: 0x20b2aaff,
  lightskyblue: 0x87cefaff,
  lightslategray: 0x778899ff,
  lightslategrey: 0x778899ff,
  lightsteelblue: 0xb0c4deff,
  lightyellow: 0xffffe0ff,
  lime: 0x00ff00ff,
  limegreen: 0x32cd32ff,
  linen: 0xfaf0e6ff,
  magenta: 0xff00ffff,
  maroon: 0x800000ff,
  mediumaquamarine: 0x66cdaaff,
  mediumblue: 0x0000cdff,
  mediumorchid: 0xba55d3ff,
  mediumpurple: 0x9370dbff,
  mediumseagreen: 0x3cb371ff,
  mediumslateblue: 0x7b68eeff,
  mediumspringgreen: 0x00fa9aff,
  mediumturquoise: 0x48d1ccff,
  mediumvioletred: 0xc71585ff,
  midnightblue: 0x191970ff,
  mintcream: 0xf5fffaff,
  mistyrose: 0xffe4e1ff,
  moccasin: 0xffe4b5ff,
  navajowhite: 0xffdeadff,
  navy: 0x000080ff,
  oldlace: 0xfdf5e6ff,
  olive: 0x808000ff,
  olivedrab: 0x6b8e23ff,
  orange: 0xffa500ff,
  orangered: 0xff4500ff,
  orchid: 0xda70d6ff,
  palegoldenrod: 0xeee8aaff,
  palegreen: 0x98fb98ff,
  paleturquoise: 0xafeeeeff,
  palevioletred: 0xdb7093ff,
  papayawhip: 0xffefd5ff,
  peachpuff: 0xffdab9ff,
  peru: 0xcd853fff,
  pink: 0xffc0cbff,
  plum: 0xdda0ddff,
  powderblue: 0xb0e0e6ff,
  purple: 0x800080ff,
  rebeccapurple: 0x663399ff,
  red: 0xff0000ff,
  rosybrown: 0xbc8f8fff,
  royalblue: 0x4169e1ff,
  saddlebrown: 0x8b4513ff,
  salmon: 0xfa8072ff,
  sandybrown: 0xf4a460ff,
  seagreen: 0x2e8b57ff,
  seashell: 0xfff5eeff,
  sienna: 0xa0522dff,
  silver: 0xc0c0c0ff,
  skyblue: 0x87ceebff,
  slateblue: 0x6a5acdff,
  slategray: 0x708090ff,
  slategrey: 0x708090ff,
  snow: 0xfffafaff,
  springgreen: 0x00ff7fff,
  steelblue: 0x4682b4ff,
  tan: 0xd2b48cff,
  teal: 0x008080ff,
  thistle: 0xd8bfd8ff,
  tomato: 0xff6347ff,
  turquoise: 0x40e0d0ff,
  violet: 0xee82eeff,
  wheat: 0xf5deb3ff,
  white: 0xffffffff,
  whitesmoke: 0xf5f5f5ff,
  yellow: 0xffff00ff,
  yellowgreen: 0x9acd32ff,
}

const config = {
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

// const INTEGER = '[-+]?\\d+';
const NUMBER = '[-+]?\\d*\\.?\\d+'
const PERCENTAGE = NUMBER + '%'

function call() {
  for (
    var _len = arguments.length, parts = new Array(_len), _key = 0;
    _key < _len;
    _key++
  ) {
    parts[_key] = arguments[_key]
  }

  return '\\(\\s*(' + parts.join(')\\s*,\\s*(') + ')\\s*\\)'
}

const rgb = new RegExp('rgb' + call(NUMBER, NUMBER, NUMBER))
const rgba = new RegExp('rgba' + call(NUMBER, NUMBER, NUMBER, NUMBER))
const hsl = new RegExp('hsl' + call(NUMBER, PERCENTAGE, PERCENTAGE))
const hsla = new RegExp('hsla' + call(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER))
const hex3 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/
const hex4 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/
const hex6 = /^#([0-9a-fA-F]{6})$/
const hex8 = /^#([0-9a-fA-F]{8})$/

/*
https://github.com/react-community/normalize-css-color

BSD 3-Clause License

Copyright (c) 2016, React Community
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
function normalizeColor(color) {
  let match

  if (typeof color === 'number') {
    return color >>> 0 === color && color >= 0 && color <= 0xffffffff
      ? color
      : null
  } // Ordered based on occurrences on Facebook codebase

  if ((match = hex6.exec(color))) return parseInt(match[1] + 'ff', 16) >>> 0
  if (colors.hasOwnProperty(color)) return colors[color]

  if ((match = rgb.exec(color))) {
    return (
      ((parse255(match[1]) << 24) | // r
      (parse255(match[2]) << 16) | // g
      (parse255(match[3]) << 8) | // b
        0x000000ff) >>> // a
      0
    )
  }

  if ((match = rgba.exec(color))) {
    return (
      ((parse255(match[1]) << 24) | // r
      (parse255(match[2]) << 16) | // g
      (parse255(match[3]) << 8) | // b
        parse1(match[4])) >>> // a
      0
    )
  }

  if ((match = hex3.exec(color))) {
    return (
      parseInt(
        match[1] +
        match[1] + // r
        match[2] +
        match[2] + // g
        match[3] +
        match[3] + // b
          'ff', // a
        16
      ) >>> 0
    )
  } // https://drafts.csswg.org/css-color-4/#hex-notation

  if ((match = hex8.exec(color))) return parseInt(match[1], 16) >>> 0

  if ((match = hex4.exec(color))) {
    return (
      parseInt(
        match[1] +
        match[1] + // r
        match[2] +
        match[2] + // g
        match[3] +
        match[3] + // b
          match[4] +
          match[4], // a
        16
      ) >>> 0
    )
  }

  if ((match = hsl.exec(color))) {
    return (
      (hslToRgb(
        parse360(match[1]), // h
        parsePercentage(match[2]), // s
        parsePercentage(match[3]) // l
      ) |
        0x000000ff) >>> // a
      0
    )
  }

  if ((match = hsla.exec(color))) {
    return (
      (hslToRgb(
        parse360(match[1]), // h
        parsePercentage(match[2]), // s
        parsePercentage(match[3]) // l
      ) |
        parse1(match[4])) >>> // a
      0
    )
  }

  return null
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

function hslToRgb(h, s, l) {
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const r = hue2rgb(p, q, h + 1 / 3)
  const g = hue2rgb(p, q, h)
  const b = hue2rgb(p, q, h - 1 / 3)
  return (
    (Math.round(r * 255) << 24) |
    (Math.round(g * 255) << 16) |
    (Math.round(b * 255) << 8)
  )
}

function parse255(str) {
  const int = parseInt(str, 10)
  if (int < 0) return 0
  if (int > 255) return 255
  return int
}

function parse360(str) {
  const int = parseFloat(str)
  return (((int % 360) + 360) % 360) / 360
}

function parse1(str) {
  const num = parseFloat(str)
  if (num < 0) return 0
  if (num > 1) return 255
  return Math.round(num * 255)
}

function parsePercentage(str) {
  // parseFloat conveniently ignores the final %
  const int = parseFloat(str)
  if (int < 0) return 0
  if (int > 100) return 1
  return int / 100
}

function colorToRgba(input) {
  let int32Color = normalizeColor(input)
  if (int32Color === null) return input
  int32Color = int32Color || 0
  let r = (int32Color & 0xff000000) >>> 24
  let g = (int32Color & 0x00ff0000) >>> 16
  let b = (int32Color & 0x0000ff00) >>> 8
  let a = (int32Color & 0x000000ff) / 255
  return `rgba(${r}, ${g}, ${b}, ${a})`
} // Problem: https://github.com/animatedjs/animated/pull/102
// Solution: https://stackoverflow.com/questions/638565/parsing-scientific-notation-sensibly/658662

const stringShapeRegex = /[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g // Covers rgb, rgba, hsl, hsla
// Taken from https://gist.github.com/olmokramer/82ccce673f86db7cda5e

const colorRegex = /(#(?:[0-9a-f]{2}){2,4}|(#[0-9a-f]{3})|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))/gi // Covers color names (transparent, blue, etc.)

const colorNamesRegex = new RegExp(`(${Object.keys(colors).join('|')})`, 'g')
/**
 * Supports string shapes by extracting numbers so new values can be computed,
 * and recombines those values into new strings of the same shape.  Supports
 * things like:
 *
 *   rgba(123, 42, 99, 0.36)           // colors
 *   -45deg                            // values with units
 *   0 2px 2px 0px rgba(0, 0, 0, 0.12) // box shadows
 */

const createStringInterpolator = config => {
  // Replace colors with rgba
  const outputRange = config.output
    .map(rangeValue => rangeValue.replace(colorRegex, colorToRgba))
    .map(rangeValue => rangeValue.replace(colorNamesRegex, colorToRgba))
  const outputRanges = outputRange[0].match(stringShapeRegex).map(() => [])
  outputRange.forEach(value => {
    value
      .match(stringShapeRegex)
      .forEach((number, i) => outputRanges[i].push(+number))
  })
  const interpolations = outputRange[0]
    .match(stringShapeRegex)
    .map((_value, i) =>
      createInterpolator(
        _extends({}, config, {
          output: outputRanges[i],
        })
      )
    )
  return input => {
    let i = 0
    return (
      outputRange[0] // 'rgba(0, 100, 200, 0)'
        // ->
        // 'rgba(${interpolations[0](input)}, ${interpolations[1](input)}, ...'
        .replace(stringShapeRegex, () => interpolations[i++](input)) // rgba requires that the r,g,b are integers.... so we want to round them, but we *dont* want to
        // round the opacity (4th column).
        .replace(
          /rgba\(([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+)\)/gi,
          (_, p1, p2, p3, p4) =>
            `rgba(${Math.round(p1)}, ${Math.round(p2)}, ${Math.round(
              p3
            )}, ${p4})`
        )
    )
  }
}

/** API
 *  useChain(references, timeSteps, timeFrame)
 */

function useChain(refs, timeSteps, timeFrame) {
  if (timeFrame === void 0) {
    timeFrame = 1000
  }

  const previous = useRef()
  useEffect(() => {
    if (is.equ(refs, previous.current))
      refs.forEach(_ref => {
        let current = _ref.current
        return current && current.start()
      })
    else if (timeSteps) {
      refs.forEach((_ref2, index) => {
        let current = _ref2.current

        if (current) {
          const ctrls = current.controllers

          if (ctrls.length) {
            const t = timeFrame * timeSteps[index]
            ctrls.forEach(ctrl => {
              ctrl.queue.forEach(props => (props.delay += t))
              ctrl.start()
            })
          }
        }
      })
    } else
      refs.reduce((q, _ref3, rI) => {
        let current = _ref3.current
        return (q = q.then(() => current.start()))
      }, Promise.resolve())
    previous.current = refs
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
    node.getChildren().forEach(child => addAnimatedStyles(child, styles))
  }
}

class AnimatedValue extends Animated {
  constructor(_value) {
    var _this

    super()
    _this = this
    this.animatedStyles = new Set()
    this.value = void 0
    this.startPosition = void 0
    this.lastPosition = void 0
    this.lastVelocity = void 0
    this.startTime = void 0
    this.lastTime = void 0
    this.done = false

    this.setValue = function(value, flush) {
      if (flush === void 0) {
        flush = true
      }

      _this.value = value
      if (flush) _this.flush()
    }

    this.value = _value
    this.startPosition = _value
    this.lastPosition = _value
  }

  flush() {
    if (this.animatedStyles.size === 0) {
      addAnimatedStyles(this, this.animatedStyles)
    }

    this.animatedStyles.forEach(animatedStyle => animatedStyle.update())
  }

  clearStyles() {
    this.animatedStyles.clear()
  }

  getValue() {
    return this.value
  }

  interpolate(range, output) {
    return new AnimatedInterpolation(this, range, output)
  }

  reset(isActive) {
    this.startPosition = this.value
    this.lastPosition = this.value
    this.lastVelocity = isActive ? this.lastVelocity : undefined
    this.lastTime = isActive ? this.lastTime : undefined
    this.startTime = now()
    this.done = false
    this.animatedStyles.clear()
  }
}

class AnimatedValueArray extends AnimatedArray {
  constructor(values) {
    super()
    this.payload = values
  }

  setValue(value, flush) {
    if (flush === void 0) {
      flush = true
    }

    if (Array.isArray(value)) {
      if (value.length === this.payload.length) {
        value.forEach((v, i) => this.payload[i].setValue(v, flush))
      }
    } else {
      this.payload.forEach(p => p.setValue(value, flush))
    }
  }

  getValue() {
    return this.payload.map(v => v.getValue())
  }

  interpolate(range, output) {
    return new AnimatedInterpolation(this, range, output)
  }
}

let active = false
const controllers = new Set()

const update = () => {
  if (!active) return false
  let time = now()

  for (let controller of controllers) {
    let isActive = false

    for (
      let configIdx = 0;
      configIdx < controller.configs.length;
      configIdx++
    ) {
      let config = controller.configs[configIdx]
      let endOfAnimation, lastTime

      for (let valIdx = 0; valIdx < config.animatedValues.length; valIdx++) {
        let animated = config.animatedValues[valIdx]
        if (animated.done) continue
        let to = config.toValues[valIdx]
        let isAnimated = to instanceof Animated
        if (isAnimated) to = to.getValue() // Jump to end value for immediate animations

        if (config.immediate) {
          animated.setValue(to)
          animated.done = true
          continue
        }

        let from = config.fromValues[valIdx] // Break animation when string values are involved

        if (typeof from === 'string' || typeof to === 'string') {
          animated.setValue(to)
          animated.done = true
          continue
        }

        let position = animated.lastPosition
        let velocity = Array.isArray(config.initialVelocity)
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

          let numSteps = Math.floor(time - lastTime)

          for (let i = 0; i < numSteps; ++i) {
            let force = -config.tension * (position - to)
            let damping = -config.friction * velocity
            let acceleration = (force + damping) / config.mass
            velocity = velocity + (acceleration * 1) / 1000
            position = position + (velocity * 1) / 1000
          } // Conditions for stopping the spring animation

          let isOvershooting =
            config.clamp && config.tension !== 0
              ? from < to
                ? position > to
                : position < to
              : false
          let isVelocity = Math.abs(velocity) <= config.precision
          let isDisplacement =
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
        controller.values[config.name] = config.animated.getValue()
      }
    }

    controller.onFrame(isActive)
  } // Loop over as long as there are controllers ...

  if (controllers.size) {
    if (manualFrameloop) manualFrameloop()
    else requestFrame(update)
  } else {
    active = false
  }

  return active
}

const start = controller => {
  controllers.add(controller)

  if (!active) {
    active = true
    if (manualFrameloop) requestFrame(manualFrameloop)
    else requestFrame(update)
  }
}

const stop = controller => {
  controllers.delete(controller)
}

// Default easing
const linear = t => t

const emptyObj = Object.freeze({})
let nextId = 1

class Controller {
  constructor(props) {
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

    this.getValues = () => this.animated

    if (props) this.update(props).start()
  }
  /**
   * Push props into the update queue. The props are used after `start` is
   * called and any delay is over. The props are intelligently diffed to ensure
   * that later calls to this method properly override any delayed props.
   * The `propsArg` argument is always copied before mutations are made.
   */

  update(propsArg) {
    if (!propsArg) return this
    const props = interpolateTo(propsArg) // For async animations, the `from` prop must be defined for
    // the Animated nodes to exist before animations have started.

    this._ensureAnimated(props.from)

    if (is.obj(props.to)) {
      this._ensureAnimated(props.to)
    }

    props.timestamp = now() // The `delay` prop of every update must be a number >= 0

    if (is.fun(props.delay) && is.obj(props.to)) {
      for (const key in props.to) {
        this.queue.push(
          _extends({}, props, {
            to: {
              [key]: props.to[key],
            },
            from:
              key in props.from
                ? {
                    [key]: props.from[key],
                  }
                : void 0,
            delay: Math.max(0, Math.round(props.delay(key))),
          })
        )
      }
    } else {
      props.delay = is.num(props.delay)
        ? Math.max(0, Math.round(props.delay))
        : 0
      this.queue.push(props)
    }

    return this
  }
  /**
   * Flush the update queue.
   * If the queue is empty, try starting the frameloop.
   */

  start(onEnd) {
    if (this.queue.length) this._flush(onEnd)
    else this._start(onEnd)
    return this
  }
  /** Stop one animation or all animations */

  stop() {
    for (
      var _len = arguments.length, keys = new Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      keys[_key] = arguments[_key]
    }

    let finished = false

    if (is.boo(keys[0])) {
      var _keys = keys
      finished = _keys[0]
      keys = _keys.slice(1)
    } // Stop animations by key

    if (keys.length) {
      for (const key of keys) {
        const index = this.configs.findIndex(config => key === config.key)

        this._stopAnimation(key)

        this.configs[index] = this.animations[key]
      }
    } // Stop all animations
    else if (this.runCount) {
      // Stop all async animations
      this.animations = _extends({}, this.animations) // Update the animation configs

      this.configs.forEach(config => this._stopAnimation(config.key))
      this.configs = Object.values(this.animations) // Exit the frameloop

      this._stop(finished)
    }

    return this
  }
  /** @internal Called by the frameloop */

  onFrame(isActive) {
    if (this.props.onFrame) {
      this.props.onFrame(this.values)
    }

    if (!isActive) {
      this._stop(true)
    }
  }
  /** Reset the internal state */

  destroy() {
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

  setProp(key, value) {
    this.props[key] = value
    this.timestamps[key] = now()
    return this
  } // Create an Animated node if none exists.

  _ensureAnimated(values) {
    for (const key in values) {
      if (this.animated[key]) continue
      const value = values[key]
      const animated = createAnimated(value)

      if (animated) {
        this.animated[key] = animated

        this._stopAnimation(key)
      } else {
        console.warn('Given value not animatable:', value)
      }
    }
  } // Listen for all animations to end.

  _onEnd(onEnd) {
    if (this.runCount) this.onEndQueue.push(onEnd)
    else onEnd(true)
  } // Add this controller to the frameloop.

  _start(onEnd) {
    if (onEnd) this._onEnd(onEnd)

    if (this.idle && this.runCount) {
      this.idle = false
      start(this)
    }
  } // Remove this controller from the frameloop, and notify any listeners.

  _stop(finished) {
    this.idle = true
    stop(this)
    const onEndQueue = this.onEndQueue

    if (onEndQueue.length) {
      this.onEndQueue = []
      onEndQueue.forEach(onEnd => onEnd(finished))
    }
  } // Execute the current queue of prop updates.

  _flush(onEnd) {
    const queue = this.queue.reduce(reduceDelays, [])
    this.queue.length = 0 // Track the number of running animations.

    let runsLeft = Object.keys(queue).length
    this.runCount += runsLeft // Never assume that the last update always finishes last, since that's
    // not true when 2+ async updates have indeterminate durations.

    const onRunEnd = finished => {
      this.runCount--
      if (--runsLeft) return
      if (onEnd) onEnd(finished)

      if (!this.runCount && finished) {
        const onRest = this.props.onRest
        if (onRest) onRest(this.merged)
      }
    }

    queue.forEach((props, delay) => {
      if (delay) setTimeout(() => this._run(props, onRunEnd), delay)
      else this._run(props, onRunEnd)
    })
  } // Update the props and animations

  _run(props, onEnd) {
    if (is.arr(props.to) || is.fun(props.to)) {
      this._runAsync(props, onEnd)
    } else if (this._diff(props)) {
      this._animate(props)._start(onEnd)
    } else {
      this._onEnd(onEnd)
    }
  } // Start an async chain or an async script.

  _runAsync(_ref, onEnd) {
    let to = _ref.to,
      props = _objectWithoutPropertiesLoose(_ref, ['to'])

    // Merge other props immediately.
    if (this._diff(props)) {
      this._animate(this.props)
    } // This async animation might be overridden.

    if (
      !this._diff({
        asyncTo: to,
        timestamp: props.timestamp,
      })
    ) {
      return onEnd(false)
    } // Async chains run to completion. Async scripts are interrupted.

    const animations = this.animations

    const isCancelled = () =>
      // The `stop` and `destroy` methods clear the animation map.
      animations !== this.animations || // Async scripts are cancelled when a new chain/script begins.
      (is.fun(to) && to !== this.props.asyncTo)

    let last

    const next = props => {
      if (isCancelled()) throw this
      return (last = new Promise(done => {
        this.update(props).start(done)
      })).then(() => {
        if (isCancelled()) throw this
      })
    }

    let queue = Promise.resolve()

    if (is.arr(to)) {
      to.forEach(props => (queue = queue.then(() => next(props))))
    } else if (is.fun(to)) {
      queue = queue.then(() =>
        to(next, this.stop.bind(this)) // Always wait for the last update.
          .then(() => last)
      )
    }

    queue
      .catch(err => err !== this && console.error(err))
      .then(() => onEnd(!isCancelled()))
  } // Merge every fresh prop. Returns true if one or more props changed.
  // These props are ignored: (config, immediate, reverse)

  _diff(_ref2) {
    let timestamp = _ref2.timestamp,
      config = _ref2.config,
      immediate = _ref2.immediate,
      reverse = _ref2.reverse,
      props = _objectWithoutPropertiesLoose(_ref2, [
        'timestamp',
        'config',
        'immediate',
        'reverse',
      ])

    let changed = false // Ensure the newer timestamp is used.

    const diffTimestamp = keyPath => {
      const previous = this.timestamps[keyPath]

      if (is.und(previous) || timestamp >= previous) {
        this.timestamps[keyPath] = timestamp
        return true
      }

      return false
    } // Generalized diffing algorithm

    const diffProp = (keys, value, parent) => {
      if (is.und(value)) return
      const lastKey = keys[keys.length - 1]

      if (is.obj(value)) {
        if (!is.obj(parent[lastKey])) parent[lastKey] = {}

        for (const key in value) {
          diffProp(keys.concat(key), value[key], parent[lastKey])
        }
      } else if (diffTimestamp(keys.join('.'))) {
        const oldValue = parent[lastKey]

        if (!is.equ(value, oldValue)) {
          changed = true
          parent[lastKey] = value
        }
      }
    }

    if (reverse) {
      const to = props.to
      props.to = props.from
      props.from = is.obj(to) ? to : void 0
    }

    for (const key in props) {
      diffProp([key], props[key], this.props)
    } // Never cache "reset: true"

    if (props.reset) {
      this.props.reset = false
    }

    return changed
  } // Update the animation configs. The given props override any default props.

  _animate(props) {
    let _this$props = this.props,
      _this$props$to = _this$props.to,
      to = _this$props$to === void 0 ? emptyObj : _this$props$to,
      _this$props$from = _this$props.from,
      from = _this$props$from === void 0 ? emptyObj : _this$props$from // Merge `from` values with `to` values

    this.merged = _extends({}, from, to) // True if any animation was updated

    let changed = false // The animations that are starting or restarting

    const started = [] // Attachment handling, trailed springs can "attach" themselves to a previous spring

    const target = this.props.attach && this.props.attach(this) // Reduces input { key: value } pairs into animation objects

    for (const key in this.merged) {
      const state = this.animations[key]

      if (!state) {
        console.warn(
          `Failed to animate key: "${key}"\n` +
            `Did you forget to define "from.${key}" for an async animation?`
        )
        continue
      } // Reuse the Animated nodes whenever possible

      let animated = state.animated,
        animatedValues = state.animatedValues
      const value = this.merged[key]
      const goalValue = computeGoalValue(value) // Stop animations with a goal value equal to its current value.

      if (!props.reset && is.equ(goalValue, animated.getValue())) {
        // The animation might be stopped already.
        if (!is.und(state.goalValue)) {
          changed = true

          this._stopAnimation(key)
        }

        continue
      } // Replace an animation when its goal value is changed (or it's been reset)

      if (props.reset || !is.equ(goalValue, state.goalValue)) {
        let _ref3 = is.und(props.immediate) ? this.props : props,
          immediate = _ref3.immediate

        immediate = callProp(immediate, key)

        if (!immediate) {
          started.push(key)
        }

        const isActive = animatedValues.some(v => !v.done)
        const fromValue = !is.und(from[key])
          ? computeGoalValue(from[key])
          : goalValue // Animatable strings use interpolation

        const isInterpolated = isAnimatableString(value)

        if (isInterpolated) {
          let input
          const output = [fromValue, goalValue]

          if (animated instanceof AnimatedInterpolation) {
            input = animatedValues[0]
            if (!props.reset) output[0] = animated.calc(input.value)
            animated.updateConfig({
              output,
            })
            input.setValue(0, false)
            input.reset(isActive)
          } else {
            input = new AnimatedValue(0)
            animated = input.interpolate({
              output,
            })
          }

          if (immediate) {
            input.setValue(1, false)
          }
        } else {
          // Convert values into Animated nodes (reusing nodes whenever possible)
          if (is.arr(value)) {
            if (animated instanceof AnimatedValueArray) {
              if (props.reset) animated.setValue(fromValue, false)
              animatedValues.forEach(v => v.reset(isActive))
            } else {
              animated = createAnimated(fromValue)
            }
          } else {
            if (animated instanceof AnimatedValue) {
              if (props.reset) animated.setValue(fromValue, false)
              animated.reset(isActive)
            } else {
              animated = new AnimatedValue(fromValue)
            }
          }

          if (immediate) {
            animated.setValue(goalValue, false)
          }
        } // Only change the "config" of updated animations.

        const config =
          callProp(props.config, key) ||
          callProp(this.props.config, key) ||
          emptyObj
        changed = true
        animatedValues = toArray(animated.getPayload())
        this.animations[key] = {
          key,
          goalValue,
          toValues: toArray(
            target
              ? target.animations[key].animated.getPayload()
              : (isInterpolated && 1) || goalValue
          ),
          fromValues: animatedValues.map(v => v.getValue()),
          animated,
          animatedValues,
          immediate,
          duration: config.duration,
          easing: withDefault(config.easing, linear),
          decay: config.decay,
          mass: withDefault(config.mass, 1),
          tension: withDefault(config.tension, 170),
          friction: withDefault(config.friction, 26),
          initialVelocity: withDefault(config.velocity, 0),
          clamp: withDefault(config.clamp, false),
          precision: withDefault(config.precision, 0.01),
          config,
        }
      }
    }

    if (changed) {
      if (this.props.onStart && started.length) {
        started.forEach(key => this.props.onStart(this.animations[key]))
      } // Make animations available to the frameloop

      const configs = (this.configs = [])
      const values = (this.values = {})
      const nodes = (this.animated = {})

      for (const key in this.animations) {
        const config = this.animations[key]
        configs.push(config)
        values[key] = config.animated.getValue()
        nodes[key] = config.animated
      }
    }

    return this
  } // Stop an animation by its key

  _stopAnimation(key) {
    if (!this.animated[key]) return
    const state = this.animations[key]
    if (state && is.und(state.goalValue)) return

    let _ref4 = state || emptyObj,
      animated = _ref4.animated,
      animatedValues = _ref4.animatedValues

    if (!state) {
      animated = this.animated[key]
      animatedValues = toArray(animated.getPayload())
    }

    this.animations[key] = {
      key,
      animated,
      animatedValues,
    }
    animatedValues.forEach(v => (v.done = true)) // Prevent delayed updates to this key.

    this.timestamps['to.' + key] = now()
  }
}

function createAnimated(value) {
  return is.arr(value)
    ? new AnimatedValueArray(
        value.map(value => {
          const animated = createAnimated(value)
          const payload = animated.getPayload()
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
} // Merge updates with the same delay.
// NOTE: Mutation of `props` may occur!

function reduceDelays(merged, props) {
  const prev = merged[props.delay]

  if (prev) {
    props.to = merge$1(prev.to, props.to)
    props.from = merge$1(prev.from, props.from)
    Object.assign(prev, props)
  } else {
    merged[props.delay] = props
  }

  return merged
}

function merge$1(dest, src) {
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

const useSprings = (length, props) => {
  const mounted = useRef(false)
  const ctrl = useRef()
  const isFn = is.fun(props) // The controller maintains the animation values, starts and stops animations

  const _useMemo = useMemo(() => {
      let ref, controllers
      return [
        // Recreate the controllers whenever `length` changes
        (controllers = fillArray(length, i => {
          const c = new Controller()
          const newProps = isFn ? callProp(props, i, c) : props[i]
          if (i === 0) ref = newProps.ref
          return c.update(newProps)
        })), // This updates the controllers with new props
        props => {
          const isFn = is.fun(props)
          if (!isFn) props = toArray(props)
          controllers.forEach((c, i) => {
            c.update(isFn ? callProp(props, i, c) : props[i])
            if (!ref) c.start()
          })
        }, // The imperative API is accessed via ref
        ref,
        ref && {
          start: () =>
            Promise.all(controllers.map(c => new Promise(r => c.start(r)))),
          stop: finished => controllers.forEach(c => c.stop(finished)),
          controllers,
        },
      ]
    }, [length]),
    controllers = _useMemo[0],
    setProps = _useMemo[1],
    ref = _useMemo[2],
    api = _useMemo[3] // Attach the imperative API to its ref

  useImperativeHandle(ref, () => api, [api]) // Update controller if props aren't functional

  useEffect(() => {
    if (ctrl.current !== controllers) {
      if (ctrl.current) ctrl.current.map(c => c.destroy())
      ctrl.current = controllers
    }

    controllers.forEach((c, i) => {
      c.setProp('config', props[i].config)
      c.setProp('immediate', props[i].immediate)
    })

    if (mounted.current) {
      if (!isFn) setProps(props)
    } else if (!ref) {
      controllers.forEach(c => c.start())
    }
  }) // Update mounted flag and destroy controller on unmount

  useEffect(() => {
    mounted.current = true
    return () => ctrl.current.forEach(c => c.destroy())
  }, []) // Return animated props, or, anim-props + the update-setter above

  const values = controllers.map(c => c.getValues())
  return isFn
    ? [
        values,
        setProps,
        function() {
          for (
            var _len = arguments.length, args = new Array(_len), _key = 0;
            _key < _len;
            _key++
          ) {
            args[_key] = arguments[_key]
          }

          return ctrl.current.forEach(c => c.stop(...args))
        },
      ]
    : values
}

/** API
 * const props = useSpring({ ... })
 * const [props, set] = useSpring(() => ({ ... }))
 */

const useSpring = props => {
  const isFn = is.fun(props)

  const _useSprings = useSprings(1, isFn ? props : [props]),
    result = _useSprings[0],
    set = _useSprings[1],
    pause = _useSprings[2]

  return isFn ? [result[0], set, pause] : result
}

/** API
 * const trails = useTrail(number, { ... })
 * const [trails, set] = useTrail(number, () => ({ ... }))
 */

const useTrail = (length, props) => {
  const mounted = useRef(false)
  const isFn = is.fun(props)
  const updateProps = callProp(props)
  const instances = useRef()

  const _useSprings = useSprings(length, (i, ctrl) => {
      if (i === 0) instances.current = []
      instances.current.push(ctrl)
      return _extends({}, updateProps, {
        config: callProp(updateProps.config, i),
        attach: i > 0 && (() => instances.current[i - 1]),
      })
    }),
    result = _useSprings[0],
    set = _useSprings[1],
    pause = _useSprings[2] // Set up function to update controller

  const updateCtrl = useMemo(
    () => props =>
      set((i, ctrl) => {
        const last = props.reverse ? i === 0 : length - 1 === i
        const attachIdx = props.reverse ? i + 1 : i - 1
        const attachController = instances.current[attachIdx]
        return _extends({}, props, {
          config: callProp(props.config || updateProps.config, i),
          attach: !!attachController && (() => attachController),
        })
      }),
    [length, updateProps.config]
  ) // Update controller if props aren't functional

  useEffect(() => void (mounted.current && !isFn && updateCtrl(props))) // Update mounted flag and destroy controller on unmount

  useEffect(() => void (mounted.current = true), [])
  return isFn ? [result, updateCtrl, pause] : result
}

/** API
 * const transitions = useTransition(items, itemKeys, { ... })
 * const [transitions, update] = useTransition(items, itemKeys, () => ({ ... }))
 */

let guid = 0
const INITIAL = 'initial'
const ENTER = 'enter'
const UPDATE = 'update'
const LEAVE = 'leave'

const makeKeys = (items, keys) =>
  (typeof keys === 'function' ? items.map(keys) : toArray(keys)).map(String)

const makeConfig = props => {
  let items = props.items,
    keys = props.keys,
    rest = _objectWithoutPropertiesLoose(props, ['items', 'keys'])

  items = toArray(is.und(items) ? null : items)
  return _extends(
    {
      items,
      keys: makeKeys(items, keys),
    },
    rest
  )
}

function useTransition(input, keyTransform, props) {
  props = makeConfig(
    _extends({}, props, {
      items: input,
      keys: keyTransform || (i => i),
    })
  )

  const _props = props,
    _props$lazy = _props.lazy,
    lazy = _props$lazy === void 0 ? false : _props$lazy,
    _props$unique = _props.unique,
    _props$reset = _props.reset,
    reset = _props$reset === void 0 ? false : _props$reset,
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
      'reset',
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

  const forceUpdate = useForceUpdate()
  const mounted = useRef(false)
  const state = useRef({
    mounted: false,
    first: true,
    deleted: [],
    current: {},
    transitions: [],
    prevProps: {},
    paused: !!props.ref,
    instances: !mounted.current && new Map(),
    forceUpdate,
  })
  useImperativeHandle(props.ref, () => ({
    start: () =>
      Promise.all(
        Array.from(state.current.instances).map(_ref => {
          let c = _ref[1]
          return new Promise(r => c.start(r))
        })
      ),
    stop: finished =>
      Array.from(state.current.instances).forEach(_ref2 => {
        let c = _ref2[1]
        return c.stop(finished)
      }),

    get controllers() {
      return Array.from(state.current.instances).map(_ref3 => {
        let c = _ref3[1]
        return c
      })
    },
  })) // Update state

  state.current = diffItems(state.current, props)

  if (state.current.changed) {
    // Update state
    state.current.transitions.forEach(transition => {
      const phase = transition.phase,
        key = transition.key,
        item = transition.item,
        props = transition.props
      if (!state.current.instances.has(key))
        state.current.instances.set(key, new Controller()) // Avoid calling `onStart` more than once per transition.

      let started = false // update the map object

      const ctrl = state.current.instances.get(key)

      const itemProps = _extends(
        {
          reset: reset && phase === ENTER,
        },
        extra,
        props,
        {
          ref,
          onRest: values => {
            if (state.current.mounted) {
              if (transition.destroyed) {
                // If no ref is given delete destroyed items immediately
                if (!ref && !lazy) cleanUp(state, key)
                if (onDestroyed) onDestroyed(item)
              } // A transition comes to rest once all its springs conclude

              const curInstances = Array.from(state.current.instances)
              const active = curInstances.some(_ref4 => {
                let c = _ref4[1]
                return !c.idle
              })

              if (
                !active &&
                (ref || lazy) &&
                state.current.deleted.length > 0
              ) {
                cleanUp(state)
              }

              if (_onRest) {
                _onRest(item, phase, values)
              }
            }
          },
          onFrame: onFrame && (values => onFrame(item, phase, values)),
          onStart:
            onStart &&
            (animation =>
              started || (started = (onStart(item, phase, animation), true))), // Update controller
        }
      )

      ctrl.update(itemProps)
      if (!state.current.paused) ctrl.start()
    })
  }

  useEffect(() => {
    state.current.mounted = mounted.current = true
    return () => {
      state.current.mounted = mounted.current = false
      Array.from(state.current.instances).map(_ref5 => {
        let c = _ref5[1]
        return c.destroy()
      })
      state.current.instances.clear()
    }
  }, [])
  return state.current.transitions.map(_ref6 => {
    let item = _ref6.item,
      phase = _ref6.phase,
      key = _ref6.key
    return {
      item,
      key,
      phase,
      props: state.current.instances.get(key).getValues(),
    }
  })
}

function cleanUp(_ref7, filterKey) {
  let state = _ref7.current
  const deleted = state.deleted

  for (let _ref8 of deleted) {
    let key = _ref8.key

    const filter = t => t.key !== key

    if (is.und(filterKey) || filterKey === key) {
      state.instances.delete(key)
      state.transitions = state.transitions.filter(filter)
      state.deleted = state.deleted.filter(filter)
    }
  }

  state.forceUpdate()
}

function diffItems(_ref10, props) {
  let first = _ref10.first,
    current = _ref10.current,
    deleted = _ref10.deleted,
    prevProps = _ref10.prevProps,
    state = _objectWithoutPropertiesLoose(_ref10, [
      'first',
      'current',
      'deleted',
      'prevProps',
    ])

  let items = props.items,
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

  let _makeConfig = makeConfig(prevProps),
    _keys = _makeConfig.keys,
    _items = _makeConfig.items // Compare next keys with current keys

  const currentKeys = Object.keys(current)
  const currentSet = new Set(currentKeys)
  const nextSet = new Set(keys)
  const addedKeys = keys.filter(key => !currentSet.has(key))
  const updatedKeys =
    update && _ref9.prevProps.items !== props.items
      ? keys.filter(key => currentSet.has(key))
      : []
  const deletedKeys = state.transitions
    .filter(t => !t.destroyed && !nextSet.has(t.originalKey))
    .map(t => t.originalKey)
  let delay = -trail

  while (order.length) {
    let phase = order.shift()

    if (phase === ENTER) {
      if (first && !is.und(initial)) {
        phase = INITIAL
      }

      addedKeys.forEach(key => {
        // In unique mode, remove fading out transitions if their key comes in again
        if (unique && deleted.find(d => d.originalKey === key)) {
          deleted = deleted.filter(t => t.originalKey !== key)
        }

        const i = keys.indexOf(key)
        const item = items[i]
        const enterProps = callProp(enter, item, i)
        current[key] = {
          phase,
          originalKey: key,
          key: unique ? String(key) : guid++,
          item,
          props: _extends(
            {
              delay: (delay += trail),
              config: callProp(config, item, phase),
              from: callProp(first && !is.und(initial) ? initial : from, item),
              to: enterProps,
            },
            is.obj(enterProps) && interpolateTo(enterProps)
          ),
        }
      })
    } else if (phase === LEAVE) {
      deletedKeys.forEach(key => {
        const i = _keys.indexOf(key)

        const item = _items[i]
        const leaveProps = callProp(leave, item, i)
        deleted.unshift(
          _extends({}, current[key], {
            phase,
            destroyed: true,
            left: _keys[Math.max(0, i - 1)],
            right: _keys[Math.min(_keys.length, i + 1)],
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
      updatedKeys.forEach(key => {
        const i = keys.indexOf(key)
        const item = items[i]
        const updateProps = callProp(update, item, i)
        current[key] = _extends({}, current[key], {
          phase,
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

  let out = keys.map(key => current[key]) // This tries to restore order for deleted items by finding their last known siblings
  // only using the left sibling to keep order placement consistent for all deleted items

  deleted.forEach(_ref11 => {
    let left = _ref11.left,
      right = _ref11.right,
      item = _objectWithoutPropertiesLoose(_ref11, ['left', 'right'])

    let pos // Was it the element on the left, if yes, move there ...

    if ((pos = out.findIndex(t => t.originalKey === left)) !== -1) pos += 1 // And if nothing else helps, move it to the start ¯\_(ツ)_/¯

    pos = Math.max(0, pos)
    out = [...out.slice(0, pos), item, ...out.slice(pos)]
  })
  return _extends({}, state, {
    first: first && !addedKeys.length,
    changed: !!(addedKeys.length || deletedKeys.length || updatedKeys.length),
    transitions: out,
    current,
    deleted,
    prevProps: props,
  })
}

function Spring(_ref) {
  let children = _ref.children,
    props = _objectWithoutPropertiesLoose(_ref, ['children'])

  const spring = useSpring(props)
  return children(spring)
}
function Trail(_ref2) {
  let items = _ref2.items,
    children = _ref2.children,
    props = _objectWithoutPropertiesLoose(_ref2, ['items', 'children'])

  const trails = useTrail(items.length, props)
  return items.map((item, index) => children(item)(trails[index]))
}
function Transition(_ref3) {
  let items = _ref3.items,
    _ref3$keys = _ref3.keys,
    keys = _ref3$keys === void 0 ? null : _ref3$keys,
    children = _ref3.children,
    props = _objectWithoutPropertiesLoose(_ref3, ['items', 'keys', 'children'])

  const transitions = useTransition(items, keys, props)
  return transitions.map((_ref4, index) => {
    let item = _ref4.item,
      key = _ref4.key,
      props = _ref4.props,
      slot = _ref4.slot
    const el = children(item, slot, index)(props)
    return React.createElement(
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

// Extend animated with all the available THREE elements
const apply = merge(createAnimatedComponent)
const extendedAnimated = apply(THREE)
extendedAnimated.primitive = createAnimatedComponent('primitive')

if (addEffect) {
  // Add the update function as a global effect to react-three-fibers update loop
  addEffect(update) // Ping react-three-fiber, so that it will call react-springs update function as an effect

  injectManualFrameloop(() => invalidate())
} // Set default native-element

injectDefaultElement('group') // Use default interpolation (which includes numbers, strings, colors)

injectStringInterpolator(createStringInterpolator) // Inject color names, so that it will be able to deal with things like "peachpuff"

injectColorNames(colors) // This is how we teach react-spring to set props "natively", the api is (instance, props) => { ... }

injectApplyAnimatedValues(applyProps, style => style)

export {
  apply,
  update,
  config,
  extendedAnimated as animated,
  extendedAnimated as a,
  interpolate$1 as interpolate,
  Globals,
  useSpring,
  useTrail,
  useTransition,
  useChain,
  useSprings,
  Spring,
  Trail,
  Transition,
}
