var ReactTools = require('react-tools');

module.exports = {
  process: function(source) {
    return ReactTools.transform(source, {
      harmony: true
    });
  }
};
