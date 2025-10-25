import packagejson from "../../package.json" assert { type: "json" };

export const my_name = packagejson.name;
export const my_simple_name = my_name.split("/")[1];
export const lower_my_simple_name = my_simple_name.toLowerCase();
