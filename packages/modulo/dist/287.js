export const __webpack_id__ = "287";
export const __webpack_ids__ = [
    "287"
];
export const __webpack_modules__ = {
    "./src/cli/init.ts": function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {
        __webpack_require__.r(__webpack_exports__);
        __webpack_require__.d(__webpack_exports__, {
            init_tool: ()=>init_tool
        });
        var external_node_fs_ = __webpack_require__("node:fs");
        var external_node_path_ = __webpack_require__("node:path");
        var external_node_readline_ = __webpack_require__("node:readline");
        var external_picocolors_ = __webpack_require__("picocolors");
        var example_config = __webpack_require__("./src/config/example/example-config.ts");
        async function create_config_file(args) {
            const path = args.init.path || example_config.C;
            console.log(external_picocolors_["default"].blue("即将创建配置文件"), path);
            const filepath = (0, external_node_path_.resolve)(process.cwd(), path);
            if ((0, external_node_fs_.existsSync)(filepath)) if (args.init.force) console.log(external_picocolors_["default"].bgRed(external_picocolors_["default"].white("配置文件已存在，将覆盖")));
            else {
                console.log(external_picocolors_["default"].red("配置文件已存在，是否覆盖？"));
                const rl = external_node_readline_["default"].createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                const answer = await new Promise((resolve)=>{
                    rl.question("\n请输入(Y/N) ", (answer)=>{
                        rl.close();
                        resolve(answer);
                    });
                });
                if ("y" !== answer.toLowerCase()) return void console.log("取消创建");
            }
            (0, external_node_fs_.writeFileSync)(filepath, JSON.stringify((0, example_config.T)(args.init.preset), null, 2));
            console.log(external_picocolors_["default"].green("创建成功"), filepath);
        }
        var modify_scripts = __webpack_require__("./src/initiator/modify-scripts.ts");
        function init_tool(args) {
            if ("config" === args.target) create_config_file(args);
            if ("script" === args.target) (0, modify_scripts.o)();
        }
    }
};
