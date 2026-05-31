## `create_picture_tag` 函数

`create_picture_tag` 是一个工具函数，用于生成 `<picture>` HTML 标签，支持多种图片格式和属性。是 ai-zl-image 标签所使用的函数，如有需要可以自行调用。

### 参数说明

| 参数名   | 类型   | 描述                          |
| -------- | ------ | ----------------------------- |
| `webp`   | string | WebP 格式的图片 URL（可选）。 |
| `png`    | string | PNG 格式的图片 URL（可选）。  |
| `jpg`    | string | JPG 格式的图片 URL（可选）。  |
| `alt`    | string | 图片的替代文本（可选）。      |
| `width`  | string | 图片的宽度（可选）。          |
| `height` | string | 图片的高度（可选）。          |
| `class`  | string | 图片的 CSS 类名（可选）。     |
| `id`     | string | 图片的 ID（可选）。           |
| `style`  | string | 图片的内联样式（可选）。      |

### 返回值

返回一个完整的 `<picture>` HTML DOM，该标签会提供自动降级能力

### 示例代码

```javascript
const pictureTag = create_picture_tag({
  webp: "https://example.com/image.webp",
  png: "https://example.com/image.png",
  alt: "示例图片",
  width: "200",
  height: "200",
  class: "example-class",
});
console.log(pictureTag);
```

```html
<!-- 上面的结果如下 -->
<picture>
  <source srcset="https://example.com/image.webp" type="image/webp" />
  <img
    src="https://example.com/image.png"
    alt="示例图片"
    width="200"
    height="200"
    class="example-class"
  />
</picture>
```

---

## `AutoDowngradePicture` 自定义组件

`AutoDowngradePicture` 是一个自定义 HTML 元素（基于 `HTMLElement`），用于动态渲染图片，支持预设图片、自定义图片和多种属性配置。

### 功能特性

1. **自定义图片**：通过 `png`、`webp`、`jpg` 等属性指定自定义图片。
2. **属性监听**：自动监听属性变化并重新渲染。

### 属性说明

| 属性名   | 类型   | 描述                                    |
| -------- | ------ | --------------------------------------- |
| `png`    | string | PNG 格式的图片 URL（可选）。            |
| `webp`   | string | WebP 格式的图片 URL（可选）。           |
| `jpg`    | string | JPG 格式的图片 URL（可选）。            |
| `jpeg`   | string | JPEG 格式的图片 URL（可选）。           |
| `alt`    | string | 图片的替代文本（可选）。                |
| `class`  | string | 图片的 CSS 类名（可选）。               |
| `id`     | string | 图片的 ID（可选）。                     |
| `width`  | string | 图片的宽度（可选）。                    |
| `height` | string | 图片的高度（可选）。                    |
| `mode`   | string | 渲染模式（`block` 或 `inline`，可选）。 |

### 示例代码

```html
<auto-downgrade-image
  alt="example"
  class="example-class"
  width="200"
  height="200"
></auto-downgrade-image>
```

### mode

- **block**: block 模式下，图片会被渲染为 inline-block 元素，此时可以直接给 ai-zl-image 标签增加样式，内部 img 默认宽度为 100%，高度为 auto
- **inline**: inline 模式下，图片会被渲染为行内元素，所有附加在 ai-zl-image 标签上的可以赋值给 img 标签的 attribute 都会被剪贴到内部的 img 标签上

### example

```html
<!-- 通过mode="inline" 可以将图片渲染为行内元素 -->
<!-- 此时所有外部样式最终都会应用到内部，并且参与flex布局 -->
<div style="display: flex; align-items: center">
  <div style="width: 30px; height: 30px; border-radius: 50%; overflow: hidden">
    <auto-downgrade-picture
      class="test-class"
      style="width: 100%"
      mode="inline"
    ></auto-downgrade-picture>
  </div>
  <span> hahaha </span>
</div>

<!-- 直接添加外部样式，内部图片100%高度自动撑开 -->
<auto-downgrade-picture
  class="test-class"
  style="width: 400px; height: 300px; overflow: hidden"
></auto-downgrade-picture>
```
---

## 总结

- **`create_picture_tag`**：生成支持多种格式的 `<picture>` 标签。
- **`AutoDowngradePicture`组件**：动态渲染图片，支持预设和自定义配置。
