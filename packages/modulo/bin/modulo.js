#! /usr/bin/env node

import("../src/index.ts")
  .then((module) => {
    console.log("\nsupport ts, use Typescript code\n");
    try {
      module.exec();
    } catch (e) {
      console.error(e);
    }
  })
  .catch((e) => {
    console.error(e);
    import("../dist/index.js").then((module) => {
      console.log("\nnot support ts, use JavaScript code\n");
      try {
        module.exec();
      } catch (e) {
        console.error(e);
      }
    });
  });
