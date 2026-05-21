export const updateAttributes = (attributes, setAttributes) => {
    return (object, val, ...props) => {
        setAttributes({ [object]: updateData(attributes[object], val, ...props) });
    };
};