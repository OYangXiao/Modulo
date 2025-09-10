const key_name_map: { [name: string]: string | undefined } = {
  config: 'config_file',
};

const arg_value_options = {
  action: ['build', 'dev'],
  target: ['all', 'page', 'lib'],
  debug: ['false', 'true'],
  config_file: undefined, // undefined代表不检查
} as const;

type ArgValueOptions = typeof arg_value_options;

const default_args = {
  debug: arg_value_options.debug[0] as ArgValueOptions['debug'][number],
  action: arg_value_options.action[0] as ArgValueOptions['action'][number],
  target: arg_value_options.target[0] as ArgValueOptions['target'][number],
  config_file: 'modulo.config.json',
};

export const args = Object.assign(
  default_args,
  Object.fromEntries(
    process.argv
      .filter((arg) => arg === 'build' || arg === 'dev' || arg.startsWith('--'))
      .map((arg) => (arg.startsWith('--') ? arg.slice(2) : `action=${arg}`))
      .map((arg) => {
        const index = arg.indexOf('=');
        const key = arg.slice(0, index);
        const value = arg.slice(index + 1);

        const inner_key = (key_name_map[key] || (key in default_args ? key : undefined)) as
          | keyof typeof default_args
          | undefined;

        if (!inner_key) return undefined;

        const value_options = arg_value_options[inner_key];
        // @ts-ignore
        if (value_options === undefined || value_options.includes(value)) {
          return [inner_key, value];
        }
      })
      .filter((v): v is string[] => !!v),
  ) as typeof default_args,
);

if (args.debug === 'true') console.log('args: ', args);
