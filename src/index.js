'use strict';

var typeofUndef = typeof undefined;
var typeofObj = typeof {};
var typeofFn = typeof function(){};

var isObj = function( x ){
  var type = typeof x;

  return x != null && ( type === typeofObj || type === typeofFn );
};

var isBool = function( x ){ return x === true || x === false; };

var castToBool = function( x ){ return x ? true : false };

var defaults = function( tgt ){
  for( var i = 1; i < arguments.length; i++ ){
    var obj = arguments[i];

    if( !obj ){ continue; }

    for( var k in tgt ){
      if( obj[k] !== undefined ){
        tgt[k] = obj[k];
      }
    }
  }

  return tgt;
};

var isListenerOptionsSupported = function(){
  // from https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection

  var supported = false;

  var get = function(){ supported = true; };

  try {
    var opts = {};

    Object.defineProperty( opts, 'capture', { get: get } );
    Object.defineProperty( opts, 'once',    { get: get } );
    Object.defineProperty( opts, 'passive', { get: get } );

    window.addEventListener( 'test', null, opts );
  } catch( err ){
    supported = false;
  }

  return supported;
};

var lisOptsSuppd;

var patch = function( proto ){
  var addEventListener = proto.addEventListener;

  proto.addEventListener = function( type, listener, useCaptureOrOptions ){
    var options = { // defaults
      capture: false,
      once: false,
      passive: false
    };

    if( !lisOptsSuppd ){
      if( isObj( useCaptureOrOptions ) ){
        options = castToBool( useCaptureOrOptions.capture );
      } else { // treat as truthy
        options = castToBool( useCaptureOrOptions );
      }
    } else if( isBool( useCaptureOrOptions ) ){
      defaults( options, { capture: useCaptureOrOptions } );
    } else if( isObj( useCaptureOrOptions ) ){
      defaults( options, useCaptureOrOptions );
    } else { // treat as truthy
      defaults( options, { capture: castToBool( useCaptureOrOptions ) } );
    }

    addEventListener.apply( this, [ type, listener, options ] );
  };
};

var norm = function( opts ){
  opts = defaults( {}, opts, {
    domOnly: true
  } );

  lisOptsSuppd = isListenerOptionsSupported();

  if( !opts.domOnly && typeof EventTarget !== typeofUndef ){
    patch( EventTarget.prototype );
  } else {
    patch( window );
    patch( document );
    patch( Element.prototype );
  }
};

module.exports = norm;
