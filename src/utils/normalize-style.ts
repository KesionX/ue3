import { isObject, isString } from "./common";

export type NormalizedStyle = Record<string, string | number>;
export const isArray = Array.isArray;
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:(.+)/;

export function normalizeStyle(
    value: unknown
): NormalizedStyle | string | undefined {
    if (isArray(value)) {
        const res: NormalizedStyle = {};
        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            const normalized = isString(item)
                ? parseStringStyle(item)
                : (normalizeStyle(item) as NormalizedStyle);
            if (normalized) {
                for (const key in normalized) {
                    res[key] = normalized[key];
                }
            }
        }
        return res;
    } else if (isString(value)) {
        return value;
    } else if (isObject(value)) {
        return value;
    }
}

export function parseStringStyle(cssText: string): NormalizedStyle {
    const ret: NormalizedStyle = {};
    cssText.split(listDelimiterRE).forEach(item => {
        if (item) {
            const tmp = item.split(propertyDelimiterRE);
            tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
        }
    });
    return ret;
}
