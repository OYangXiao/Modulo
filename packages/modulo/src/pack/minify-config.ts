export const minify_config = {
  js: true,
  jsOptions: {
    minimizerOptions: {
      compress: {
        dead_code: true,
        defaults: false,
        toplevel: true,
        unused: true,
      },
      format: {
        comments: "some",
        ecma: 2015,
        preserve_annotations: true,
        safari10: true,
        semicolons: false,
      },
      mangle: true,
      minify: true,
    },
  },
} as const;
