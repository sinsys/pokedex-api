getValidTypes = (arr) => {
  const types = [];
  arr.forEach((poke) => {
    poke.type.forEach((type) => {
      if( !types.includes(type) ) {
        types.push(type);
      }
    })
  });
  return(
    types.sort()
  );
};

module.exports = { getValidTypes };