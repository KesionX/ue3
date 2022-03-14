// string、object、array
export default function normalizeClass(
    preClass:
        | string
        | Record<string, boolean>
        | Array<Record<string, boolean> | string>
        | undefined
) {
    if (!preClass) {
        return "";
    }
    if (typeof preClass === "string") {
        return preClass;
    }
    let result = "";
    if (preClass instanceof Array) {
        result = preClass.reduce((pre, mclass) => {
            if (typeof mclass === "string") {
                return pre + mclass + " ";
            }
            return pre + nomalizeClassByObject(mclass) + " ";
        }, "") as string;
    } else {
        result = nomalizeClassByObject(preClass);
    }
    return result;
}

function nomalizeClassByObject(obj: Record<string, boolean>) {
    let classStr = "";
    for (const key in obj) {
        const value = obj[key];
        classStr = classStr + value + " ";
    }
    return classStr;
}
