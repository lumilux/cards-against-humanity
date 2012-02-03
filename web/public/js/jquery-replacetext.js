$.fn.replaceText = function( search, replace, text_only ) {
    return this.each(function(){
      var node = this.firstChild,
        val,
        new_val,
        remove = [];
      if ( node ) {
        do {
          if ( node.nodeType === 3 ) {
            val = node.nodeValue;
            new_val = val.replace( search, replace );
            if ( new_val !== val ) {
              if ( !text_only && /</.test( new_val ) ) {
                $(node).before( new_val );
                remove.push( node );
              } else {
                node.nodeValue = new_val;
              }
            }
          }
        } while ( node = node.nextSibling );
      }
      remove.length && $(remove).remove();
    });
  };