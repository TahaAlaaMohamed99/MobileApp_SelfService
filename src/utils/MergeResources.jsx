const MergeResources = (target = {}, source = {}) => {
    const output = { ...target };
  
    for (const key in source) {
      if (
        typeof source[key] === "object" &&
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        output[key] = MergeResources(output[key] ?? {}, source[key]);
      } else {
        output[key] = output[key] ?? source[key];
      }
    }
  
    return output;
  };
  
  export default MergeResources;
  