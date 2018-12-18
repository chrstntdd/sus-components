import { useState, useRef, useCallback, useEffect, Children, cloneElement, useReducer, createElement } from 'react';/*
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

function f() {
  f = Object.assign || function(a) {
    for (var b, c = 1, e = arguments.length; c < e; c++) {
      b = arguments[c];
      for (var d in b) {
        Object.prototype.hasOwnProperty.call(b, d) && (a[d] = b[d]);
      }
    }
    return a;
  };
  return f.apply(this, arguments);
}
function k(a) {
  var b = a.children, c = a.once, e = void 0 === c ? !1 : c, d = a.onReveal;
  a = a.options;
  var p = void 0 === a ? {} : a;
  a = useState(!1);
  var m = a[0], q = a[1], g = useRef(null), h = useRef(null), n = useCallback(function() {
    g.current.unobserve(h.current);
    g.current.disconnect();
  }, []), r = useCallback(function() {
    m || q(!0);
    d();
    e && n();
  }, [h, m]), t = useCallback(function(a) {
    a = a[0];
    (a.isIntersecting || 0 < a.intersectionRatio) && r();
  }, [g]);
  useEffect(function() {
    if ("undefined" !== typeof window) {
      return g.current = new IntersectionObserver(t, p), g.current.observe(h.current), n;
    }
  }, []);
  b = Children.only(b);
  return cloneElement(b, {ref:function(a) {
    h.current = a;
  }});
}
var l = new Map;
function u(a, b) {
  switch(b.type) {
    case "LOADED":
      return f({}, a, {imgLoaded:!0});
    case "REAPPEAR":
    case "VISIBLE":
      return f({}, a, {imgVisible:!0});
    case "ERROR":
      return f({}, a, {imgLoaded:!1});
    default:
      return a;
  }
}
var Reveal = k;
var LazyBackgroundImage = function(a) {
  var b = a.src, c = a.children;
  a = useReducer(u, {imgLoaded:!1, imgVisible:!1, seenBefore:l.has(b)});
  var e = a[0], d = a[1];
  a = useCallback(function() {
    d({type:"VISIBLE"});
    if (e.seenBefore) {
      d({type:"REAPPEAR"});
    } else {
      var a = new Image;
      a.src = b;
      a.onload = function() {
        l.set(b, b);
        d({type:"LOADED"});
      };
      a.onerror = function() {
        d({type:"ERROR"});
      };
    }
  }, [e.seenBefore, b]);
  c = Children.only(c);
  c = cloneElement(c, f({}, e.imgVisible && e.imgLoaded ? {style:f({}, c.props.style, {backgroundImage:"url(" + l.get(b) + ")"})} : {}));
  return createElement(k, {once:!0, onReveal:a}, createElement("div", {style:{height:"100%", width:"100%"}}, createElement("div", {className:"placeholder"}), c));
};export{Reveal,LazyBackgroundImage};
