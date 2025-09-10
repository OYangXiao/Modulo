# @strong-z/modulo-pack

支持多种框架的构建工具

构建以浏览器为目标的页面、组件、函数

- 支持js、ts、jsx、tsx
- 支持vue、react (根据package.json的依赖自动判断)
- 支持less、sass

## 使用方式：

```bash
pnpm install @strong-z/modulo-pack
```

然后可以直接执行以下命令，也可以添加到package.json中作为script执行

```bash
pnpx modulo-pack [ build | dev ] --target=[ page | lib ] --config=[ 配置文件路径 ]
```

## 命令行参数解释：

- build | dev：打包或者开发
- target：目标，page表示构建页面，lib表示构建组件、函数
- config：配置文件路径

## 配置文件：

默认路径：./modulo.config.json

配置项和默认值：{

```jsonc
  "src_dir": "src", // 源码目录
  "dist_dir": "dist", // 输出目录
  "dir_names":{
    "page": "page", // 页面目录，target为page时生效会构建这些目录下的页面
    "components": "components", // 组件目录，target为lib时生效会构建这些目录下的组件
    "functions": "functions" // 函数目录，target为lib时生效会构建这些目录下的函数
  },

  "html_mount_id": "app", // html挂载点id
  "html_title": "", // 默认html标题
  "base_path":"", // 配置前缀路径
  "cdn_domain":"", // 如果希望除了html资源都部署到cdn上，就设置cdn域名，如果有公共路径，也写在一起，比如https://c.zhangle.com/

  "dev_server": {
    "port":8080, // 开发服务器端口
    "open": undefined, // dev时是否自动打开指定页面
    "proxy": undefined // dev时的代理配置
  },
  // lib构建会将以下依赖排除在外，不打包进产物，也可配置更多的依赖
  "lib_externals":{
    "react": "React",
    "react-dom": "ReactDOM",
    "vue": "Vue",
    "vue-router": "VueRouter",
    "jquery": "jQuery",
  },
  "minify": true // 是否压缩产物，同时进行mangle
}
```

## 模块入口自动发现

按照以下顺序自动查找入口文件：

- 入口文件为index.ts、index.tsx、index.js、index.jsx
- 入口文件为main.ts、main.tsx、main.js、main.jsx
- (如果是vue项目)入口文件为index.vue、main.vue、[文件夹名称].vue
- 入口文件为[文件夹名称].ts、[文件夹名称].tsx、[文件夹名称].js、[文件夹名称].jsx

## 产物目录结构

```bash
/{}/package.json.name
├── page1.html # 页面入口文件，以page的文件夹名称命名
├── page2.html
├── static # 静态资源目录，所有页面共用的静态资源
│   ├── css
│   │   ├── page1.css
│   │   └── page2.css
│   ├── img
│   │   ├── page1.png
│   │   └── page2.png
│   └── js
│       ├── page1.js
│       └── page2.js
└── modules # lib构建产物目录
    ├── components
    │   ├── esm # es模块产物目录
    │   │   ├── component1.js
    │   │   └── component1.css # 组件的样式文件单独提供
    │   └── umd # umd模块产物目录
    │       ├── component1.js
    │       └── component1.css 
    └── functions
        ├── esm
        │   ├── function1.js
        │   └── function1.css
        └── umd
            ├── function1.js
            └── function1.css
```
