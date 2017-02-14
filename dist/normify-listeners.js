(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.normifyListeners = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1])(1)
});