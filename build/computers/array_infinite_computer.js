var InfiniteComputer = require('./infinite_computer.js'),
    bs = require('../utils/binary_index_search.js');

for(var InfiniteComputer____Key in InfiniteComputer){if(InfiniteComputer.hasOwnProperty(InfiniteComputer____Key)){ArrayInfiniteComputer[InfiniteComputer____Key]=InfiniteComputer[InfiniteComputer____Key];}}var ____SuperProtoOfInfiniteComputer=InfiniteComputer===null?null:InfiniteComputer.prototype;ArrayInfiniteComputer.prototype=Object.create(____SuperProtoOfInfiniteComputer);ArrayInfiniteComputer.prototype.constructor=ArrayInfiniteComputer;ArrayInfiniteComputer.__superConstructor__=InfiniteComputer;
  function ArrayInfiniteComputer(heightData, numberOfChildren) {"use strict";
    InfiniteComputer.call(this,heightData, numberOfChildren);
    this.prefixHeightData = this.heightData.reduce(function(acc, next)  {
      if (acc.length === 0) {
        return [next];
      } else {
        acc.push(acc[acc.length - 1] + next);
        return acc;
      }
    }, []);
  }

  Object.defineProperty(ArrayInfiniteComputer.prototype,"getTotalScrollableHeight",{writable:true,configurable:true,value:function() {"use strict";
    var length = this.prefixHeightData.length;
    return length === 0 ? 0 : this.prefixHeightData[length - 1];
  }});

  Object.defineProperty(ArrayInfiniteComputer.prototype,"getDisplayIndexStart",{writable:true,configurable:true,value:function(windowTop) {"use strict";
    return bs.binaryIndexSearch(this.prefixHeightData, windowTop, bs.opts.CLOSEST_HIGHER);
  }});

  Object.defineProperty(ArrayInfiniteComputer.prototype,"getDisplayIndexEnd",{writable:true,configurable:true,value:function(windowBottom) {"use strict";
    var foundIndex = bs.binaryIndexSearch(this.prefixHeightData, windowBottom, bs.opts.CLOSEST_HIGHER);
    return typeof foundIndex === 'undefined' ? this.prefixHeightData.length - 1 : foundIndex; 
  }});

  Object.defineProperty(ArrayInfiniteComputer.prototype,"getTopSpacerHeight",{writable:true,configurable:true,value:function(displayIndexStart) {"use strict";
    var previous = displayIndexStart - 1;
    return previous < 0 ? 0 : this.prefixHeightData[previous];
  }});

  Object.defineProperty(ArrayInfiniteComputer.prototype,"getBottomSpacerHeight",{writable:true,configurable:true,value:function(displayIndexEnd) {"use strict";
    if (displayIndexEnd === -1) return 0;
    return this.getTotalScrollableHeight() - this.prefixHeightData[displayIndexEnd];
  }});


module.exports = ArrayInfiniteComputer;
