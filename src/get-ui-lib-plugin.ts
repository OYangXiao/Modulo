import type { RsbuildPlugin } from '@rsbuild/core';
import { ui_lib_name, ui_lib_major_version } from './settings';

function first_letter_upper(str: string) {
  return `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;
}

export async function get_ui_lib_plugin() {
  const first_upper_name = first_letter_upper(ui_lib_name);
  const version_appendix = ui_lib_name === 'vue' ? ui_lib_major_version : '';

  const ui_plugin = (await import(`@rsbuild/plugin-${ui_lib_name}${version_appendix}`))[
    `plugin${first_upper_name}${version_appendix}`
  ];

  return ui_plugin as (...params: unknown[]) => RsbuildPlugin;
}
