export default function omitNil(object: any): any {
    const output: any = {};

    Object.keys(object).forEach(key => {
        if (object[key] !== undefined) {
            output[key] = object[key];
        }
    });

    return output;
}
