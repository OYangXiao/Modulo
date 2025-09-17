import "systemjs/dist/s.min.js";
import "systemjs/dist/extras/amd.js";
import "systemjs/dist/extras/named-register.js";

// Declare window as a global variable for TypeScript
const System = (globalThis as any).System;

if (System.register) {
  const register = System.register;
  System.register = function (...args: any[]) {
    if (args[0] === "modulo-page") {
      // 手动启动页面执行
      System.import("modulo-page");
    }
    const module = register.apply(this, args);
    return module;
  };
}
