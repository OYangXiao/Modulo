type Modulo_Build_Cmd = "build" | "dev";
type Modulo_Init_Cmd = "init";

type Modulo_Build_Target = "page" | "module" | "all";
type Modulo_Init_Target = "config" | "script";

interface Modulo_Build_Args {
  cmd: Modulo_Build_Cmd;
  target: Modulo_Build_Target;
  config: string;
  mode: "dev" | "prd";
  watch: boolean;
}

interface Modulo_Init_Args {
  cmd: Modulo_Init_Cmd;
  target: Modulo_Init_Target;
  path: string;
  force: boolean;
  preset: string;
}
