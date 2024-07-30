function requiredParam(paramName) {
    throw new Error(`Parameter "${paramName}" must be filled`);
}

export {requiredParam};