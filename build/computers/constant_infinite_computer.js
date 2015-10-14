/* @flow */

var InfiniteComputer = require('./infinite_computer.js');

for(var InfiniteComputer____Key in InfiniteComputer){if(InfiniteComputer.hasOwnProperty(InfiniteComputer____Key)){ConstantInfiniteComputer[InfiniteComputer____Key]=InfiniteComputer[InfiniteComputer____Key];}}var ____SuperProtoOfInfiniteComputer=InfiniteComputer===null?null:InfiniteComputer.prototype;ConstantInfiniteComputer.prototype=Object.create(____SuperProtoOfInfiniteComputer);ConstantInfiniteComputer.prototype.constructor=ConstantInfiniteComputer;ConstantInfiniteComputer.__superConstructor__=InfiniteComputer;function ConstantInfiniteComputer(){"use strict";if(InfiniteComputer!==null){InfiniteComputer.apply(this,arguments);}}
  Object.defineProperty(ConstantInfiniteComputer.prototype,"getTotalScrollableHeight",{writable:true,configurable:true,value:function()/* : number */ {"use strict";
    return this.heightData * this.numberOfChildren;
  }});

  Object.defineProperty(ConstantInfiniteComputer.prototype,"getDisplayIndexStart",{writable:true,configurable:true,value:function(windowTop   )/* : number */ {"use strict";
    return Math.floor(windowTop / this.heightData);
  }});

  Object.defineProperty(ConstantInfiniteComputer.prototype,"getDisplayIndexEnd",{writable:true,configurable:true,value:function(windowBottom   )/* : number */ {"use strict";
    var nonZeroIndex = Math.ceil(windowBottom / this.heightData);
    if (nonZeroIndex > 0) {
      return nonZeroIndex - 1;
    }
    return nonZeroIndex;
  }});

  Object.defineProperty(ConstantInfiniteComputer.prototype,"getTopSpacerHeight",{writable:true,configurable:true,value:function(displayIndexStart   )/* : number */ {"use strict";
    return displayIndexStart * this.heightData;
  }});

  Object.defineProperty(ConstantInfiniteComputer.prototype,"getBottomSpacerHeight",{writable:true,configurable:true,value:function(displayIndexEnd   )/* : number */ {"use strict";
    var nonZeroIndex = displayIndexEnd + 1;
    return Math.max(0, (this.numberOfChildren - nonZeroIndex) * this.heightData);
  }});


module.exports = ConstantInfiniteComputer;
