var PropTypes = global.PropTypes || require('prop-types');

module.exports = {
  preloadType: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      type: PropTypes.oneOf(['containerHeightScaleFactor']).isRequired,
      amount: PropTypes.number.isRequired
    })
  ])
};
