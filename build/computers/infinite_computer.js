// An infinite computer must be able to do the following things:
//  1. getTotalScrollableHeight()
//  2. getDisplayIndexStart()
//  3. getDisplayIndexEnd()


  function InfiniteComputer(heightData, numberOfChildren) {"use strict";
    this.heightData = heightData;
    this.numberOfChildren = numberOfChildren;
  }

  Object.defineProperty(InfiniteComputer.prototype,"getTotalScrollableHeight",{writable:true,configurable:true,value:function() {"use strict";
    throw new Error('getTotalScrollableHeight not implemented.');
  }});

  /* eslint-disable no-unused-vars */
  Object.defineProperty(InfiniteComputer.prototype,"getDisplayIndexStart",{writable:true,configurable:true,value:function(windowTop) {"use strict";
  /* eslint-enable no-unused-vars */
    throw new Error('getDisplayIndexStart not implemented.');
  }});

  /* eslint-disable no-unused-vars */
  Object.defineProperty(InfiniteComputer.prototype,"getDisplayIndexEnd",{writable:true,configurable:true,value:function(windowBottom) {"use strict";
  /* eslint-enable no-unused-vars */
    throw new Error('getDisplayIndexEnd not implemented.');
  }});

  // These are helper methods, and can be calculated from
  // the above details.
  /* eslint-disable no-unused-vars */
  Object.defineProperty(InfiniteComputer.prototype,"getTopSpacerHeight",{writable:true,configurable:true,value:function(displayIndexStart) {"use strict";
  /* eslint-enable no-unused-vars */
    throw new Error('getTopSpacerHeight not implemented.');
  }});

  /* eslint-disable no-unused-vars */
  Object.defineProperty(InfiniteComputer.prototype,"getBottomSpacerHeight",{writable:true,configurable:true,value:function(displayIndexEnd) {"use strict";
  /* eslint-enable no-unused-vars */
    throw new Error('getBottomSpacerHeight not implemented.');
  }});


module.exports = InfiniteComputer;
