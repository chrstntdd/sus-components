/*
 *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
*****************************************************************************/
'use strict';
Object.defineProperty(exports, "__esModule", {value:!0});
var React = require("react"), __assign = function() {
  __assign = Object.assign || function(a) {
    for (var b, c = 1, e = arguments.length; c < e; c++) {
      b = arguments[c];
      for (var d in b) {
        Object.prototype.hasOwnProperty.call(b, d) && (a[d] = b[d]);
      }
    }
    return a;
  };
  return __assign.apply(this, arguments);
}, Reveal = function(a) {
  var b = a.children, c = a.once, e = void 0 === c ? !1 : c, d = a.onReveal;
  a = a.options;
  var l = void 0 === a ? {} : a;
  a = React.useState(!1);
  var h = a[0], m = a[1], f = React.useRef(null), g = React.useRef(null), k = React.useCallback(function() {
    f.current.unobserve(g.current);
    f.current.disconnect();
  }, []), n = React.useCallback(function() {
    h || m(!0);
    d();
    e && k();
  }, [g, h]), p = React.useCallback(function(a) {
    a = a[0];
    (a.isIntersecting || 0 < a.intersectionRatio) && n();
  }, [f]);
  React.useEffect(function() {
    if ("undefined" !== typeof window) {
      return f.current = new IntersectionObserver(p, l), f.current.observe(g.current), k;
    }
  }, []);
  b = React.Children.only(b);
  return React.cloneElement(b, {ref:function(a) {
    g.current = a;
  }});
}, imageCache = new Map, lazyImageReducer = function(a, b) {
  switch(b.type) {
    case "LOADED":
      return __assign({}, a, {imgLoaded:!0});
    case "REAPPEAR":
    case "VISIBLE":
      return __assign({}, a, {imgVisible:!0});
    case "ERROR":
      return __assign({}, a, {imgLoaded:!1});
    default:
      return a;
  }
}, LazyBackgroundImage = function(a) {
  var b = a.src, c = a.children;
  a = React.useReducer(lazyImageReducer, {imgLoaded:!1, imgVisible:!1, seenBefore:imageCache.has(b)});
  var e = a[0], d = a[1];
  a = React.useCallback(function() {
    d({type:"VISIBLE"});
    if (e.seenBefore) {
      d({type:"REAPPEAR"});
    } else {
      var a = new Image;
      a.src = b;
      a.onload = function() {
        imageCache.set(b, b);
        d({type:"LOADED"});
      };
      a.onerror = function() {
        d({type:"ERROR"});
      };
    }
  }, [e.seenBefore, b]);
  c = React.Children.only(c);
  c = React.cloneElement(c, __assign({}, e.imgVisible && e.imgLoaded ? {style:__assign({}, c.props.style, {backgroundImage:"url(" + imageCache.get(b) + ")"})} : {}));
  return React.createElement(Reveal, {once:!0, onReveal:a}, React.createElement("div", {style:{height:"100%", width:"100%"}}, React.createElement("div", {className:"placeholder"}), c));
};
exports.Reveal = Reveal;
exports.LazyBackgroundImage = LazyBackgroundImage;

