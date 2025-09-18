/// <reference types="@rsbuild/core/types" />

declare module "*.vue" {
  import Vue from "vue";

  export default Vue;
}

declare interface ImportMetaEnv {
  MOUNT_ID: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.png" {
  const content: string;
  export default content;
}
