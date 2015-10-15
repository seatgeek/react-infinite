// This module provides runtime checking that the
// props passed to React Infinite make the minimum
// amount of sense.

module.exports = function(props) {
  if (!(props.computedHeight || props.useWindowAsScrollContainer)) {
    throw new Error('Either computedHeight or useWindowAsScrollContainer must be provided.');
  }
};
