# normify-listeners

Makes event APIs behave in the standard way

## Installation

Install with npm:

```
npm install --save normify-listeners
```

## Usage

However you use the `normify-listeners` module, it is important that you call it before any of your other code so that its fixes are applied first.

### CommonJS `require()`:

```js
require('normify-listeners')();
```

### ES2015 `import`:

```js
import normifyListeners from 'normify-listeners';

normifyListeners();
```

### Browser globals:

Download `normify-listeners.js` from the `dist` directory, and include in your HTML file:

```html
<script src="normify-listeners.js"></script>
<script>normifyListeners();</script>
```

### AMD:

Use `normify-listeners.js` from the `dist` directory:

```js
require( ['normify-listeners'], function( normifyListeners ){
  normifyListeners();
} );
```

### Options

The `normifyListeners( options )` function takes an options object with the following fields:

- `domOnly`: If `true` (default), only `window`, `document`, and `Element` are patched.  If `false`, only `EventTarget` is patched.  Since `EventTarget` affects other prototypes like `AudioContext` and known issues only affect DOM objects, it's probably safer to use `domOnly: true`.

## Known issues this lib resolves

- Chrome 56 breaks support for the [`EventTarget.addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) function.  Chrome assumes that all touch events should be passive unless explicitly specified otherwise --- even though older apps wouldn't be aware of the options parameter to `addEventListener()`.  This makes all calls to `event.preventDefault()` fail.
  - The `addEventListener()` function is normalised to make browsers that assume nonstandard behaviour use the correct, default options.  The `addEventListener()` function is wrapped, passing the default options explicitly (`options = { capture: false, once: false, passive: false }`).  This makes Chrome behave in line with standard, well-established behaviour: `event.preventDefault()` works properly by default, as it always has done.
  - References: [W3C DOM Living Standard](https://dom.spec.whatwg.org/#dom-eventtarget-addeventlistener), [Chromium bug #639227](https://bugs.chromium.org/p/chromium/issues/detail?id=639227), [WICG/interventions#18](https://github.com/WICG/interventions/issues/18)
- The addition of the `options` parameter to the [`addEventListener()`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) function means that passing a function could be misinterpreted by older browsers as `useCapture == true`.
  - Browser support for the `options` parameter of `addEventListener()` is checked in tandem with the third argument of `addEventListener`.  This means you can always use the `options` parameter without having to worry about old browsers misinterpreting it as `useCapture == true`.
