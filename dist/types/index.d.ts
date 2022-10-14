declare function _default(): {
    name: string;
    visitor: {
        CallExpression(path: any, { opts }: {
            opts: any;
        }): void;
    };
};
export default _default;
