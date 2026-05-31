/** @license React v17.0.2
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define("react-jsx-runtime", ["react"], factory);
  } else if (
    typeof exports === "object" &&
    typeof exports.nodeName !== "string"
  ) {
    var React = require("react");
    module.exports = factory(React);
  } else {
    global.ReactJsxRuntime = factory(global.React);
  }
})(typeof self !== "undefined" ? self : this, function (react) {
  var h = Symbol.for;
  var g = h("react.element");
  var m =
      react.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
        .ReactCurrentOwner,
    n = Object.prototype.hasOwnProperty,
    p = { key: !0, ref: !0, __self: !0, __source: !0 };
  function q(c, a, k) {
    var b,
      d = {},
      e = null,
      l = null;
    void 0 !== k && (e = "" + k);
    void 0 !== a.key && (e = "" + a.key);
    void 0 !== a.ref && (l = a.ref);
    for (b in a) n.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
    if (c && c.defaultProps)
      for (b in ((a = c.defaultProps), a)) void 0 === d[b] && (d[b] = a[b]);
    return {
      $$typeof: g,
      type: c,
      key: e,
      ref: l,
      props: d,
      _owner: m.current,
    };
  }

  return {
    Fragment: h("react.fragment"),
    jsx: q,
    jsxs: q,
  };
});
