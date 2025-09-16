export {};

declare global {
  interface ImportMetaEnv {
    MOUNT_ID: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
