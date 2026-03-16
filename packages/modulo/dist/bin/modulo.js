#! /usr/bin/env node
import("../131.js").then((mod)=>({
        exec: mod.exec
    })).then((module)=>{
    try {
        module.exec();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}).catch((e)=>{
    console.error("\x1b[31mError: Failed to load modulo.\x1b[0m");
    console.error(e);
    process.exit(1);
});
