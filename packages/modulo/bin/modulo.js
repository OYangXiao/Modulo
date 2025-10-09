#! /usr/bin/env node

import("../src/index.ts")
  .then((module) => {
    try {
      module.exec();
    } catch (e) {
      console.error(e);
    }
  })
  .catch((e) => {
    import("../node_modules/tsx/dist/esm/api/index.mjs")
      .then((tsx) => {
        console.log("\nuse tsx to support Typescript\n");
        tsx.tsImport("../src/index.ts", import.meta.url).then((module) => {
          try {
            module.exec();
          } catch (e) {
            console.error(e);
          }
        });
      })
      .catch((e) => {
        console.error(e);
      });
  });
