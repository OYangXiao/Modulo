import "systemjs/dist/s.min.js";
import "systemjs/dist/extras/amd.js";
import "systemjs/dist/extras/named-register.js";

// Declare window as a global variable for TypeScript
export const System = (globalThis as any).System;
