function compare( a, b ) {
    if ( a.fps < b.fps ){
      return 1; //-1 to order ...  1 to order reverse
    }
    if ( a.fps > b.fps ){
      return -1; //1 to order ...  -1 to order reverse
    }
    return 0;
  }

function compare2( a, b ) {
    if (a.height < b.height)
    {
        return 1;
    }
    else if (a.height > b.height)
    {
        return -1;
    }
    else
    {
        if (a.fps < b.fps)
        {
            return 1;
        }
        else if (a.fps > b.fps)
        {
            return -1;
        }
        return 0;
    }
  }
  

module.exports = function (from, to, context, options) {
    var item = "";
    to = context.length-1
    context.sort(compare2)
    
    for (var i = from, j = to; i < j; i++) {
        item = item + options.fn(context[i]);
    }
    
    return item;
}

