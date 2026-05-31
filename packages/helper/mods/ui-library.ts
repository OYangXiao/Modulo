import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import semver from 'semver';

/**
 * 解析语义化版本号（SemVer）。
 *
 * - 支持：`3.2.1` / `v18.0.0` / `2.7.16-beta.1`
 * - 不支持：`workspace:*` / `latest` / `^3`（这些属于版本范围，不是已安装版本）
 */
function parseSemver(version: string): semver.SemVer | null {
  return semver.parse(version);
}

/**
 * 判断文件是否存在。
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 从 startCwd 向上查找最近的 package.json 路径。
 *
 * 用于支持在子目录（例如 packages/foo 或 src）中执行命令时，仍能定位到项目根或包根。
 */
async function findNearestPackageJsonPath(startCwd: string): Promise<string> {
  let current = path.resolve(startCwd);
  while (true) {
    const candidate = path.join(current, 'package.json');
    if (await fileExists(candidate)) return candidate;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  throw new Error(`未找到 package.json（从 ${startCwd} 向上查找失败）`);
}

/**
 * 读取并解析 JSON 文件。
 */
async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw) as T;
}

type PackageJson = {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

/**
 * 从 package.json 的多个依赖字段中获取声明的版本范围。
 */
function getDeclaredRange(pkg: PackageJson, depName: string): string | undefined {
  return (
    pkg.dependencies?.[depName] ??
    pkg.devDependencies?.[depName] ??
    pkg.peerDependencies?.[depName] ??
    pkg.optionalDependencies?.[depName]
  );
}

/**
 * 从 node_modules 中解析某个包的已安装版本。
 *
 * 为了保证“检测当前项目”的结果稳定且不串包，这里只读取当前项目目录下的直接依赖：
 * - <projectRoot>/node_modules/<packageName>/package.json
 *
 * 若未安装或无法读取版本则返回 null。
 */
async function getInstalledPackageVersion(
  packageName: string,
  cwd: string,
): Promise<{ version: string; packageJsonPath: string } | null> {
  const directPath = path.join(cwd, 'node_modules', packageName, 'package.json');
  if (!(await fileExists(directPath))) return null;
  const pkg = await readJsonFile<{ version?: string }>(directPath);
  if (!pkg.version) return null;
  return { version: pkg.version, packageJsonPath: directPath };
}

export type SupportedUiLibrary = 'vue2' | 'vue3' | 'react' | 'lit';

export type UiLibraryName = 'vue' | 'react' | 'lit';

export type UiLibraryDetectionErrorCode = 'NO_UI_LIBRARY' | 'UNSUPPORTED_VERSION' | 'DECLARED_BUT_NOT_INSTALLED';

/**
 * UI 库检测失败时抛出的错误类型。
 *
 * code 用于在 CLI 层进行结构化处理与输出。
 */
export class UiLibraryDetectionError extends Error {
  code: UiLibraryDetectionErrorCode;

  constructor(code: UiLibraryDetectionErrorCode, message: string) {
    super(message);
    this.name = 'UiLibraryDetectionError';
    this.code = code;
  }
}

export type UiLibraryReportItem = {
  name: UiLibraryName;
  declaredRange?: string;
  installedVersion: string;
};

export type UiLibraryReport = {
  cwd: string;
  packageJsonPath: string;
  supported: SupportedUiLibrary[];
  vue?: UiLibraryReportItem & { kind: 'vue2' | 'vue3' };
  react?: UiLibraryReportItem;
  lit?: UiLibraryReportItem;
};

/**
 * 检测当前项目安装的 UI 库与版本，并生成报告。
 *
 * 检测来源：
 * - package.json：用于判断是否声明了依赖（便于给出“声明了但未安装”的明确报错）
 * - node_modules：用于获取实际安装版本并进行版本校验
 *
 * 支持规则：
 * - Vue：仅支持 2.7.16（精确匹配）或 3.x
 * - React：仅支持 17+
 * - Lit：仅支持 3+
 *
 * 错误行为：
 * - 未检测到任何 UI 库：抛 UiLibraryDetectionError(NO_UI_LIBRARY)
 * - 检测到但版本不符合：抛 UiLibraryDetectionError(UNSUPPORTED_VERSION)
 * - package.json 声明了但未安装：抛 UiLibraryDetectionError(DECLARED_BUT_NOT_INSTALLED)
 */
export async function detectUiLibraries(cwd = process.cwd()): Promise<UiLibraryReport> {
  const packageJsonPath = await findNearestPackageJsonPath(cwd);
  const packageJsonDir = path.dirname(packageJsonPath);
  const pkg = await readJsonFile<PackageJson>(packageJsonPath);

  const vueDeclaredRange = getDeclaredRange(pkg, 'vue');
  const reactDeclaredRange = getDeclaredRange(pkg, 'react');
  const litDeclaredRange = getDeclaredRange(pkg, 'lit');

  const [vueInstalled, reactInstalled, litInstalled] = await Promise.all([
    getInstalledPackageVersion('vue', packageJsonDir),
    getInstalledPackageVersion('react', packageJsonDir),
    getInstalledPackageVersion('lit', packageJsonDir),
  ]);

  if (vueDeclaredRange && !vueInstalled) {
    throw new UiLibraryDetectionError(
      'DECLARED_BUT_NOT_INSTALLED',
      `已在 package.json 声明 vue（${vueDeclaredRange}），但未在 node_modules 中检测到。请先安装依赖或手动安装 vue。`,
    );
  }
  if (reactDeclaredRange && !reactInstalled) {
    throw new UiLibraryDetectionError(
      'DECLARED_BUT_NOT_INSTALLED',
      `已在 package.json 声明 react（${reactDeclaredRange}），但未在 node_modules 中检测到。请先安装依赖或手动安装 react。`,
    );
  }
  if (litDeclaredRange && !litInstalled) {
    throw new UiLibraryDetectionError(
      'DECLARED_BUT_NOT_INSTALLED',
      `已在 package.json 声明 lit（${litDeclaredRange}），但未在 node_modules 中检测到。请先安装依赖或手动安装 lit。`,
    );
  }

  const supported: SupportedUiLibrary[] = [];
  const report: UiLibraryReport = {
    cwd: packageJsonDir,
    packageJsonPath,
    supported,
  };

  if (vueInstalled) {
    const parsed = parseSemver(vueInstalled.version);
    if (!parsed) {
      throw new UiLibraryDetectionError(
        'UNSUPPORTED_VERSION',
        `无法解析 vue 版本号（${vueInstalled.version}）。请手动安装受支持的 vue 版本（2.7.16 或 3.x）。`,
      );
    }

    if (parsed.major === 2) {
      if (!semver.eq(parsed, '2.7.16')) {
        throw new UiLibraryDetectionError(
          'UNSUPPORTED_VERSION',
          `当前安装的 vue 版本为 ${vueInstalled.version}，本脚手架仅支持 Vue 2.7.16（Vue 2 最后版本）或 Vue 3.x。请手动安装符合要求的版本。`,
        );
      }
      supported.push('vue2');
      report.vue = {
        name: 'vue',
        kind: 'vue2',
        declaredRange: vueDeclaredRange,
        installedVersion: vueInstalled.version,
      };
    } else if (parsed.major === 3) {
      supported.push('vue3');
      report.vue = {
        name: 'vue',
        kind: 'vue3',
        declaredRange: vueDeclaredRange,
        installedVersion: vueInstalled.version,
      };
    } else {
      throw new UiLibraryDetectionError(
        'UNSUPPORTED_VERSION',
        `当前安装的 vue 版本为 ${vueInstalled.version}，本脚手架仅支持 Vue 2.7.16 或 Vue 3.x。请手动安装符合要求的版本。`,
      );
    }
  }

  if (reactInstalled) {
    const parsed = parseSemver(reactInstalled.version);
    if (!parsed || !semver.gte(parsed, '17.0.0')) {
      throw new UiLibraryDetectionError(
        'UNSUPPORTED_VERSION',
        `当前安装的 react 版本为 ${reactInstalled?.version ?? 'unknown'}，本脚手架仅支持 React 17+。请手动安装符合要求的版本。`,
      );
    }
    supported.push('react');
    report.react = {
      name: 'react',
      declaredRange: reactDeclaredRange,
      installedVersion: reactInstalled.version,
    };
  }

  if (litInstalled) {
    const parsed = parseSemver(litInstalled.version);
    if (!parsed || !semver.gte(parsed, '3.0.0')) {
      throw new UiLibraryDetectionError(
        'UNSUPPORTED_VERSION',
        `当前安装的 lit 版本为 ${litInstalled?.version ?? 'unknown'}，本脚手架仅支持 Lit 3+。请手动安装符合要求的版本。`,
      );
    }
    supported.push('lit');
    report.lit = {
      name: 'lit',
      declaredRange: litDeclaredRange,
      installedVersion: litInstalled.version,
    };
  }

  if (supported.length === 0) {
    throw new UiLibraryDetectionError(
      'NO_UI_LIBRARY',
      '未检测到 UI 库。请手动安装受支持的依赖：vue@2.7.16 或 vue@^3、react@^17、lit@^3。',
    );
  }

  return report;
}
