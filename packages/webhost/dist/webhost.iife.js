/*! For license information please see webhost.iife.js.LICENSE.txt */
/*!
 * SJS 6.15.1
 */ (function() {
    function errMsg(errCode, msg) {
        return (msg || "") + " (SystemJS https://github.com/systemjs/systemjs/blob/main/docs/errors.md#" + errCode + ")";
    }
    var hasSymbol = "undefined" != typeof Symbol;
    var hasSelf = "undefined" != typeof self;
    var hasDocument = "undefined" != typeof document;
    var envGlobal = hasSelf ? self : global;
    var baseUrl;
    if (hasDocument) {
        var baseEl = document.querySelector("base[href]");
        if (baseEl) baseUrl = baseEl.href;
    }
    if (!baseUrl && "undefined" != typeof location) {
        baseUrl = location.href.split("#")[0].split("?")[0];
        var lastSepIndex = baseUrl.lastIndexOf("/");
        if (-1 !== lastSepIndex) baseUrl = baseUrl.slice(0, lastSepIndex + 1);
    }
    var backslashRegEx = /\\/g;
    function resolveIfNotPlainOrUrl(relUrl, parentUrl) {
        if (-1 !== relUrl.indexOf("\\")) relUrl = relUrl.replace(backslashRegEx, "/");
        if ("/" === relUrl[0] && "/" === relUrl[1]) return parentUrl.slice(0, parentUrl.indexOf(":") + 1) + relUrl;
        if ("." === relUrl[0] && ("/" === relUrl[1] || "." === relUrl[1] && ("/" === relUrl[2] || 2 === relUrl.length && (relUrl += "/")) || 1 === relUrl.length && (relUrl += "/")) || "/" === relUrl[0]) {
            var parentProtocol = parentUrl.slice(0, parentUrl.indexOf(":") + 1);
            var pathname;
            if ("/" === parentUrl[parentProtocol.length + 1]) if ("file:" !== parentProtocol) {
                pathname = parentUrl.slice(parentProtocol.length + 2);
                pathname = pathname.slice(pathname.indexOf("/") + 1);
            } else pathname = parentUrl.slice(8);
            else pathname = parentUrl.slice(parentProtocol.length + ("/" === parentUrl[parentProtocol.length]));
            if ("/" === relUrl[0]) return parentUrl.slice(0, parentUrl.length - pathname.length - 1) + relUrl;
            var segmented = pathname.slice(0, pathname.lastIndexOf("/") + 1) + relUrl;
            var output = [];
            var segmentIndex = -1;
            for(var i = 0; i < segmented.length; i++)if (-1 !== segmentIndex) {
                if ("/" === segmented[i]) {
                    output.push(segmented.slice(segmentIndex, i + 1));
                    segmentIndex = -1;
                }
            } else if ("." === segmented[i]) if ("." === segmented[i + 1] && ("/" === segmented[i + 2] || i + 2 === segmented.length)) {
                output.pop();
                i += 2;
            } else if ("/" === segmented[i + 1] || i + 1 === segmented.length) i += 1;
            else segmentIndex = i;
            else segmentIndex = i;
            if (-1 !== segmentIndex) output.push(segmented.slice(segmentIndex));
            return parentUrl.slice(0, parentUrl.length - pathname.length) + output.join("");
        }
    }
    function resolveUrl(relUrl, parentUrl) {
        return resolveIfNotPlainOrUrl(relUrl, parentUrl) || (-1 !== relUrl.indexOf(":") ? relUrl : resolveIfNotPlainOrUrl("./" + relUrl, parentUrl));
    }
    function resolveAndComposePackages(packages, outPackages, baseUrl, parentMap, parentUrl) {
        for(var p in packages){
            var resolvedLhs = resolveIfNotPlainOrUrl(p, baseUrl) || p;
            var rhs = packages[p];
            if ("string" == typeof rhs) {
                var mapped = resolveImportMap(parentMap, resolveIfNotPlainOrUrl(rhs, baseUrl) || rhs, parentUrl);
                if (mapped) outPackages[resolvedLhs] = mapped;
                else targetWarning("W1", p, rhs);
            }
        }
    }
    function resolveAndComposeImportMap(json, baseUrl, outMap) {
        if (json.imports) resolveAndComposePackages(json.imports, outMap.imports, baseUrl, outMap, null);
        var u;
        for(u in json.scopes || {}){
            var resolvedScope = resolveUrl(u, baseUrl);
            resolveAndComposePackages(json.scopes[u], outMap.scopes[resolvedScope] || (outMap.scopes[resolvedScope] = {}), baseUrl, outMap, resolvedScope);
        }
        for(u in json.depcache || {})outMap.depcache[resolveUrl(u, baseUrl)] = json.depcache[u];
        for(u in json.integrity || {})outMap.integrity[resolveUrl(u, baseUrl)] = json.integrity[u];
    }
    function getMatch(path, matchObj) {
        if (matchObj[path]) return path;
        var sepIndex = path.length;
        do {
            var segment = path.slice(0, sepIndex + 1);
            if (segment in matchObj) return segment;
        }while (-1 !== (sepIndex = path.lastIndexOf("/", sepIndex - 1)));
    }
    function applyPackages(id, packages) {
        var pkgName = getMatch(id, packages);
        if (pkgName) {
            var pkg = packages[pkgName];
            if (null === pkg) return;
            if (!(id.length > pkgName.length) || "/" === pkg[pkg.length - 1]) return pkg + id.slice(pkgName.length);
            targetWarning("W2", pkgName, pkg);
        }
    }
    function targetWarning(code, match, target, msg) {
        console.warn(errMsg(code, [
            target,
            match
        ].join(", ")));
    }
    function resolveImportMap(importMap, resolvedOrPlain, parentUrl) {
        var scopes = importMap.scopes;
        var scopeUrl = parentUrl && getMatch(parentUrl, scopes);
        while(scopeUrl){
            var packageResolution = applyPackages(resolvedOrPlain, scopes[scopeUrl]);
            if (packageResolution) return packageResolution;
            scopeUrl = getMatch(scopeUrl.slice(0, scopeUrl.lastIndexOf("/")), scopes);
        }
        return applyPackages(resolvedOrPlain, importMap.imports) || -1 !== resolvedOrPlain.indexOf(":") && resolvedOrPlain;
    }
    var toStringTag = hasSymbol && Symbol.toStringTag;
    var REGISTRY = hasSymbol ? Symbol() : "@";
    function SystemJS() {
        this[REGISTRY] = {};
    }
    var systemJSPrototype = SystemJS.prototype;
    systemJSPrototype.import = function(id, parentUrl, meta) {
        var loader = this;
        parentUrl && "object" == typeof parentUrl && (meta = parentUrl, parentUrl = void 0);
        return Promise.resolve(loader.prepareImport()).then(function() {
            return loader.resolve(id, parentUrl, meta);
        }).then(function(id) {
            var load = getOrCreateLoad(loader, id, void 0, meta);
            return load.C || topLevelLoad(loader, load);
        });
    };
    systemJSPrototype.createContext = function(parentId) {
        var loader = this;
        return {
            url: parentId,
            resolve: function(id, parentUrl) {
                return Promise.resolve(loader.resolve(id, parentUrl || parentId));
            }
        };
    };
    var lastRegister;
    systemJSPrototype.register = function(deps, declare, metas) {
        lastRegister = [
            deps,
            declare,
            metas
        ];
    };
    systemJSPrototype.getRegister = function() {
        var _lastRegister = lastRegister;
        lastRegister = void 0;
        return _lastRegister;
    };
    function getOrCreateLoad(loader, id, firstParentUrl, meta) {
        var load = loader[REGISTRY][id];
        if (load) return load;
        var importerSetters = [];
        var ns = Object.create(null);
        if (toStringTag) Object.defineProperty(ns, toStringTag, {
            value: "Module"
        });
        var instantiatePromise = Promise.resolve().then(function() {
            return loader.instantiate(id, firstParentUrl, meta);
        }).then(function(registration) {
            if (!registration) throw Error(errMsg(2, id));
            function _export(name, value) {
                load.h = true;
                var changed = false;
                if ("string" == typeof name) {
                    if (!(name in ns) || ns[name] !== value) {
                        ns[name] = value;
                        changed = true;
                    }
                } else {
                    for(var p in name){
                        var value = name[p];
                        if (!(p in ns) || ns[p] !== value) {
                            ns[p] = value;
                            changed = true;
                        }
                    }
                    if (name && name.__esModule) ns.__esModule = name.__esModule;
                }
                if (changed) for(var i = 0; i < importerSetters.length; i++){
                    var setter = importerSetters[i];
                    if (setter) setter(ns);
                }
                return value;
            }
            var declared = registration[1](_export, 2 === registration[1].length ? {
                import: function(importId, meta) {
                    return loader.import(importId, id, meta);
                },
                meta: loader.createContext(id)
            } : void 0);
            load.e = declared.execute || function() {};
            return [
                registration[0],
                declared.setters || [],
                registration[2] || []
            ];
        }, function(err) {
            load.e = null;
            load.er = err;
            throw err;
        });
        var linkPromise = instantiatePromise.then(function(instantiation) {
            return Promise.all(instantiation[0].map(function(dep, i) {
                var setter = instantiation[1][i];
                var meta = instantiation[2][i];
                return Promise.resolve(loader.resolve(dep, id)).then(function(depId) {
                    var depLoad = getOrCreateLoad(loader, depId, id, meta);
                    return Promise.resolve(depLoad.I).then(function() {
                        if (setter) {
                            depLoad.i.push(setter);
                            if (depLoad.h || !depLoad.I) setter(depLoad.n);
                        }
                        return depLoad;
                    });
                });
            })).then(function(depLoads) {
                load.d = depLoads;
            });
        });
        return load = loader[REGISTRY][id] = {
            id: id,
            i: importerSetters,
            n: ns,
            m: meta,
            I: instantiatePromise,
            L: linkPromise,
            h: false,
            d: void 0,
            e: void 0,
            er: void 0,
            E: void 0,
            C: void 0,
            p: void 0
        };
    }
    function instantiateAll(loader, load, parent, loaded) {
        if (!loaded[load.id]) {
            loaded[load.id] = true;
            return Promise.resolve(load.L).then(function() {
                if (!load.p || null === load.p.e) load.p = parent;
                return Promise.all(load.d.map(function(dep) {
                    return instantiateAll(loader, dep, parent, loaded);
                }));
            }).catch(function(err) {
                if (load.er) throw err;
                load.e = null;
                throw err;
            });
        }
    }
    function topLevelLoad(loader, load) {
        return load.C = instantiateAll(loader, load, load, {}).then(function() {
            return postOrderExec(loader, load, {});
        }).then(function() {
            return load.n;
        });
    }
    var nullContext = Object.freeze(Object.create(null));
    function postOrderExec(loader, load, seen) {
        if (seen[load.id]) return;
        seen[load.id] = true;
        if (!load.e) {
            if (load.er) throw load.er;
            if (load.E) return load.E;
            return;
        }
        var exec = load.e;
        load.e = null;
        var depLoadPromises;
        load.d.forEach(function(depLoad) {
            try {
                var depLoadPromise = postOrderExec(loader, depLoad, seen);
                if (depLoadPromise) (depLoadPromises = depLoadPromises || []).push(depLoadPromise);
            } catch (err) {
                load.er = err;
                throw err;
            }
        });
        if (depLoadPromises) return Promise.all(depLoadPromises).then(doExec);
        return doExec();
        function doExec() {
            try {
                var execPromise = exec.call(nullContext);
                if (execPromise) {
                    execPromise = execPromise.then(function() {
                        load.C = load.n;
                        load.E = null;
                    }, function(err) {
                        load.er = err;
                        load.E = null;
                        throw err;
                    });
                    return load.E = execPromise;
                }
                load.C = load.n;
                load.L = load.I = void 0;
            } catch (err) {
                load.er = err;
                throw err;
            } finally{}
        }
    }
    envGlobal.System = new SystemJS();
    var importMapPromise = Promise.resolve();
    var importMap = {
        imports: {},
        scopes: {},
        depcache: {},
        integrity: {}
    };
    var processFirst = hasDocument;
    systemJSPrototype.prepareImport = function(doProcessScripts) {
        if (processFirst || doProcessScripts) {
            processScripts();
            processFirst = false;
        }
        return importMapPromise;
    };
    systemJSPrototype.getImportMap = function() {
        return JSON.parse(JSON.stringify(importMap));
    };
    if (hasDocument) {
        processScripts();
        window.addEventListener("DOMContentLoaded", processScripts);
    }
    systemJSPrototype.addImportMap = function(newMap, mapBase) {
        resolveAndComposeImportMap(newMap, mapBase || baseUrl, importMap);
    };
    function processScripts() {
        [].forEach.call(document.querySelectorAll("script"), function(script) {
            if (script.sp) return;
            if ("systemjs-module" === script.type) {
                script.sp = true;
                if (!script.src) return;
                System.import("import:" === script.src.slice(0, 7) ? script.src.slice(7) : resolveUrl(script.src, baseUrl)).catch(function(e) {
                    if (e.message.indexOf("https://github.com/systemjs/systemjs/blob/main/docs/errors.md#3") > -1) {
                        var event = document.createEvent("Event");
                        event.initEvent("error", false, false);
                        script.dispatchEvent(event);
                    }
                    return Promise.reject(e);
                });
            } else if ("systemjs-importmap" === script.type) {
                script.sp = true;
                var fetchPromise = script.src ? (System.fetch || fetch)(script.src, {
                    integrity: script.integrity,
                    priority: script.fetchPriority,
                    passThrough: true
                }).then(function(res) {
                    if (!res.ok) throw Error(res.status);
                    return res.text();
                }).catch(function(err) {
                    err.message = errMsg("W4", script.src) + "\n" + err.message;
                    console.warn(err);
                    if ("function" == typeof script.onerror) script.onerror();
                    return "{}";
                }) : script.innerHTML;
                importMapPromise = importMapPromise.then(function() {
                    return fetchPromise;
                }).then(function(text) {
                    extendImportMap(importMap, text, script.src || baseUrl);
                });
            }
        });
    }
    function extendImportMap(importMap, newMapText, newMapUrl) {
        var newMap = {};
        try {
            newMap = JSON.parse(newMapText);
        } catch (err) {
            console.warn(Error(errMsg("W5")));
        }
        resolveAndComposeImportMap(newMap, newMapUrl, importMap);
    }
    if (hasDocument) {
        window.addEventListener("error", function(evt) {
            lastWindowErrorUrl = evt.filename;
            lastWindowError = evt.error;
        });
        var baseOrigin = location.origin;
    }
    systemJSPrototype.createScript = function(url) {
        var script = document.createElement("script");
        script.async = true;
        if (url.indexOf(baseOrigin + "/")) script.crossOrigin = "anonymous";
        var integrity = importMap.integrity[url];
        if (integrity) script.integrity = integrity;
        script.src = url;
        return script;
    };
    var lastAutoImportDeps, lastAutoImportTimeout;
    var autoImportCandidates = {};
    var systemRegister = systemJSPrototype.register;
    systemJSPrototype.register = function(deps, declare) {
        if (hasDocument && "loading" === document.readyState && "string" != typeof deps) {
            var scripts = document.querySelectorAll("script[src]");
            var lastScript = scripts[scripts.length - 1];
            if (lastScript) {
                lastScript.src;
                lastAutoImportDeps = deps;
                var loader = this;
                lastAutoImportTimeout = setTimeout(function() {
                    autoImportCandidates[lastScript.src] = [
                        deps,
                        declare
                    ];
                    loader.import(lastScript.src);
                });
            }
        } else lastAutoImportDeps = void 0;
        return systemRegister.call(this, deps, declare);
    };
    var lastWindowErrorUrl, lastWindowError;
    systemJSPrototype.instantiate = function(url, firstParentUrl) {
        var autoImportRegistration = autoImportCandidates[url];
        if (autoImportRegistration) {
            delete autoImportCandidates[url];
            return autoImportRegistration;
        }
        var loader = this;
        return Promise.resolve(systemJSPrototype.createScript(url)).then(function(script) {
            return new Promise(function(resolve, reject) {
                script.addEventListener("error", function() {
                    reject(Error(errMsg(3, [
                        url,
                        firstParentUrl
                    ].join(", "))));
                });
                script.addEventListener("load", function() {
                    document.head.removeChild(script);
                    if (lastWindowErrorUrl === url) reject(lastWindowError);
                    else {
                        var register = loader.getRegister(url);
                        if (register && register[0] === lastAutoImportDeps) clearTimeout(lastAutoImportTimeout);
                        resolve(register);
                    }
                });
                document.head.appendChild(script);
            });
        });
    };
    systemJSPrototype.shouldFetch = function() {
        return false;
    };
    if ("undefined" != typeof fetch) systemJSPrototype.fetch = fetch;
    var instantiate = systemJSPrototype.instantiate;
    var jsContentTypeRegEx = /^(text|application)\/(x-)?javascript(;|$)/;
    systemJSPrototype.instantiate = function(url, parent, meta) {
        var loader = this;
        if (!this.shouldFetch(url, parent, meta)) return instantiate.apply(this, arguments);
        return this.fetch(url, {
            credentials: "same-origin",
            integrity: importMap.integrity[url],
            meta: meta
        }).then(function(res) {
            if (!res.ok) throw Error(errMsg(7, [
                res.status,
                res.statusText,
                url,
                parent
            ].join(", ")));
            var contentType = res.headers.get("content-type");
            if (!contentType || !jsContentTypeRegEx.test(contentType)) throw Error(errMsg(4, contentType));
            return res.text().then(function(source) {
                if (source.indexOf("//# sourceURL=") < 0) source += "\n//# sourceURL=" + url;
                (0, eval)(source);
                return loader.getRegister(url);
            });
        });
    };
    systemJSPrototype.resolve = function(id, parentUrl) {
        parentUrl = parentUrl || false || baseUrl;
        return resolveImportMap(importMap, resolveIfNotPlainOrUrl(id, parentUrl) || id, parentUrl) || throwUnresolved(id, parentUrl);
    };
    function throwUnresolved(id, parentUrl) {
        throw Error(errMsg(8, [
            id,
            parentUrl
        ].join(", ")));
    }
    var systemInstantiate = systemJSPrototype.instantiate;
    systemJSPrototype.instantiate = function(url, firstParentUrl, meta) {
        var preloads = importMap.depcache[url];
        if (preloads) for(var i = 0; i < preloads.length; i++)getOrCreateLoad(this, this.resolve(preloads[i], url), url);
        return systemInstantiate.call(this, url, firstParentUrl, meta);
    };
    if (hasSelf && "function" == typeof importScripts) systemJSPrototype.instantiate = function(url) {
        var loader = this;
        return Promise.resolve().then(function() {
            importScripts(url);
            return loader.getRegister(url);
        });
    };
})();
(function() {
    function errMsg(errCode, msg) {
        return (msg || "") + " (SystemJS Error#" + errCode + " https://github.com/systemjs/systemjs/blob/main/docs/errors.md#" + errCode + ")";
    }
    (function(global1) {
        function unsupportedRequire() {
            throw Error(errMsg(5, "AMD require not supported."));
        }
        var requireExportsModule = [
            "require",
            "exports",
            "module"
        ];
        function createAMDRegister(amdDefineDeps, amdDefineExec) {
            var exports = {};
            var module = {
                exports: exports
            };
            var depModules = [];
            var setters = [];
            var splice = 0;
            for(var i = 0; i < amdDefineDeps.length; i++){
                var id = amdDefineDeps[i];
                var index = setters.length;
                if ("require" === id) {
                    depModules[i] = unsupportedRequire;
                    splice++;
                } else if ("module" === id) {
                    depModules[i] = module;
                    splice++;
                } else if ("exports" === id) {
                    depModules[i] = exports;
                    splice++;
                } else createSetter(i);
                if (splice) amdDefineDeps[index] = id;
            }
            if (splice) amdDefineDeps.length -= splice;
            var amdExec = amdDefineExec;
            return [
                amdDefineDeps,
                function(_export, _context) {
                    _export({
                        default: exports,
                        __useDefault: true
                    });
                    return {
                        setters: setters,
                        execute: function() {
                            module.uri = _context.meta.url;
                            var amdResult = amdExec.apply(exports, depModules);
                            if (void 0 !== amdResult) module.exports = amdResult;
                            _export(module.exports);
                            _export("default", module.exports);
                        }
                    };
                }
            ];
            function createSetter(idx) {
                setters.push(function(ns) {
                    depModules[idx] = ns.__useDefault ? ns.default : ns;
                });
            }
        }
        global1.define = function(arg1, arg2, arg3) {
            var isNamedRegister = "string" == typeof arg1;
            var name = isNamedRegister ? arg1 : null;
            var depArg = isNamedRegister ? arg2 : arg1;
            var execArg = isNamedRegister ? arg3 : arg2;
            var deps, exec;
            if (Array.isArray(depArg)) {
                deps = depArg;
                exec = execArg;
            } else if ("object" == typeof depArg) {
                deps = [];
                exec = function() {
                    return depArg;
                };
            } else if ("function" == typeof depArg) {
                deps = requireExportsModule;
                exec = depArg;
            } else throw Error(errMsg(9, "Invalid call to AMD define()"));
            var amdRegister = createAMDRegister(deps, exec);
            if (isNamedRegister) {
                if (System.registerRegistry) {
                    System.registerRegistry[name] = amdRegister;
                    System.register(name, amdRegister[0], amdRegister[1]);
                } else console.warn(errMsg("W6", "Include named-register.js for full named define support"));
                System.register(amdRegister[0], amdRegister[1]);
            } else System.register(amdRegister[0], amdRegister[1]);
        };
        global1.define.amd = {};
    })("undefined" != typeof self ? self : global);
})();
(function() {
    (function(global1) {
        var System1 = global1.System;
        setRegisterRegistry(System1);
        var systemJSPrototype = System1.constructor.prototype;
        var constructor = System1.constructor;
        var SystemJS = function() {
            constructor.call(this);
            setRegisterRegistry(this);
        };
        SystemJS.prototype = systemJSPrototype;
        System1.constructor = SystemJS;
        var firstNamedDefine, firstName;
        function setRegisterRegistry(systemInstance) {
            systemInstance.registerRegistry = Object.create(null);
            systemInstance.namedRegisterAliases = Object.create(null);
        }
        var register = systemJSPrototype.register;
        systemJSPrototype.register = function(name, deps, declare, metas) {
            if ("string" != typeof name) return register.apply(this, arguments);
            var define = [
                deps,
                declare,
                metas
            ];
            this.registerRegistry[name] = define;
            if (!firstNamedDefine) {
                firstNamedDefine = define;
                firstName = name;
            }
            Promise.resolve().then(function() {
                firstNamedDefine = null;
                firstName = null;
            });
            return register.apply(this, [
                deps,
                declare,
                metas
            ]);
        };
        var resolve = systemJSPrototype.resolve;
        systemJSPrototype.resolve = function(id, parentURL) {
            try {
                return resolve.call(this, id, parentURL);
            } catch (err) {
                if (id in this.registerRegistry) return this.namedRegisterAliases[id] || id;
                throw err;
            }
        };
        var instantiate = systemJSPrototype.instantiate;
        systemJSPrototype.instantiate = function(url, firstParentUrl, meta) {
            var result = this.registerRegistry[url];
            if (!result) return instantiate.call(this, url, firstParentUrl, meta);
            this.registerRegistry[url] = null;
            return result;
        };
        var getRegister = systemJSPrototype.getRegister;
        systemJSPrototype.getRegister = function(url) {
            var register = getRegister.call(this, url);
            if (firstName && url) this.namedRegisterAliases[firstName] = url;
            var result = firstNamedDefine || register;
            firstNamedDefine = null;
            firstName = null;
            return result;
        };
    })("undefined" != typeof self ? self : global);
})();
