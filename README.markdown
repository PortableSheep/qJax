	             __
	  ____ _    / /___ __  __
	 / __ `/_  / / __ `/ |/_/
	/ /_/ / /_/ / /_/ />  <
	\__, /\____/\__,_/_/|_|
	  /_/  Ajax/Function Queuing for jQuery and Angular
================================

qJax is an ajax/function queuing library that allows async calls to be queued so they fire and complete in the order added to the queue, but without making them synchronous.

**Now available for both jQuery and Angular/RxJS!**

## Versions

### **v2.0 - Angular/RxJS Support** 🎉 NEW!

A modern Angular/RxJS implementation with full TypeScript support. Features include:

- ✓ Queue async HTTP requests that respond in order (like sync)
- ✓ Max pending requests limit with user cooldown
- ✓ Progress events via RxJS Observables
- ✓ Full TypeScript support
- ✓ Compatible with Angular HttpClient

**[Read the Angular/RxJS Documentation →](./ANGULAR-README.md)**

**Quick Example:**
```typescript
import { QJaxService } from 'queuejax';

const qjax = new QJaxService({
  maxPendingRequests: 5,
  onQueueChange: (length) => console.log('Queue:', length)
});

// Fire off 20 requests - they execute in order!
for (let i = 0; i < 20; i++) {
  qjax.queue(() => this.http.get(`/api/data/${i}`))
    .subscribe(data => console.log(`Response ${i}:`, data));
}
```

### **v1.x - jQuery Plugin**

The original jQuery plugin implementation continues to be available and maintained.

qJax is a jQuery plugin that allows ajax or function calls to be queued in the sense that they fire and complete in the order added to the queue, but without making them synchronous.

Additionally, events are exposed to let you handle queue limits and other things you might want.

You can find documentation and usage examples on the Wiki.

A small demo can be found in the source itself, and more examples will follow in the future.

- - -

## Installation

```bash
npm install queuejax
```

For Angular projects, see [Angular/RxJS Documentation](./ANGULAR-README.md).

For jQuery usage, include the script:
```html
<script src="jquery.qjax.js"></script>
```

## 🎯 Live Examples

### 🌐 Standalone Browser Demo (Easiest - No Setup!)
**Just open in your browser - no installation needed:**

```bash
open demo-standalone.html
```

This demo uses RxJS from CDN and demonstrates all QJax features in a single HTML file.

### Angular/RxJS Example (v2.0)
A complete, runnable Angular application demonstrating QJaxService:

```bash
cd angular-example
npm install
npm start
```

**Note:** Requires Node.js and Angular CLI. May take a few minutes to install dependencies.

**[View Angular Example →](./angular-example/)**

### jQuery Example (v1.x)
Classic jQuery example - just open in your browser:

```bash
cd jquery-example
open index.html
```

**[View jQuery Example →](./jquery-example/)**

- - -

Change Log
---------------------
* **2.0.0**
	* Added full Angular/RxJS support with TypeScript
	* New QJaxService for Angular applications
	* Built-in max pending requests limit
	* Progress observables for queue monitoring
	* RxJS-based implementation with Observable support
	* Maintains ordered async execution
	* Example Angular component included
* **1.5.2**
	* Added config for bower.
* **1.5.1**
	* Changed default $.ajax settings to their proper defaults.
* **1.5.0**
	* Changed internal queue object to expose promise methods, and added auto binding of promise events to $.ajax during queue change.
	* Changed Queue to return queue object, so promise methods can be used for event binding.
	* Added queueChangeDelay option to control the delay of kicking off the next ajax call, allowing time for promise usage.
* **1.4.0**
	* Changed the onStart/onStop/onError events to be aware of only their instance, instead of global ajax calls outside of qjax.
		* If this is a breaking change for some, just wire up to $.ajaxStart/$.ajaxStop, since it's the same as the existing functionality.
* **1.3.2**
	* Fixed manifest error.
* **1.3.1**
	* Added manifest for plugins.jquery.com
	* Updated for jQuery 1.9.1, and worked around an example issue with mockjax and the latest jQuery.
* **1.3.0**
    * Refactored plugin, cleaning up code duplication, complexity.
    * Added support for queuing functions in addition to ajax calls.
* **1.2.0**
    * Changed the plugin to be instanced, instead of a global call similar to $.ajax.

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/PortableSheep/qjax/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

