import { mount_module } from "./remote-module/index.ts";
import { load_module } from "./remote-module/module.ts";
import { mount_react_component } from "./remote-module/react.ts";
import { mount_vue2_component } from "./remote-module/vue2.ts";
import { System } from "./systemjs.ts";

// Expose webhost on the window object
(globalThis as any).webhost = {
  remote_module: {
    load: load_module,
    mount: mount_module,
    mount_react: mount_react_component,
    mount_vue2: mount_vue2_component,
  },
};

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
