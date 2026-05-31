/**
 * 首字母大写，其余小写
 * @param str 输入字符串
 * @returns 格式化后的字符串
 */
export function capitalize(str: string): string {
	if (!str) return "";
	return `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}`;
}

/**
 * @deprecated Use capitalize instead
 */
export const first_letter_upper = capitalize;
