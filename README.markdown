	             __
	  ____ _    / /___ __  __
	 / __ `/_  / / __ `/ |/_/
	/ /_/ / /_/ / /_/ />  <
	\__, /\____/\__,_/_/|_|
	  /_/  jQuery Ajax/Function Queuing Plugin
================================

qJax is a jQuery plugin that allows ajax or function calls to be queued in the sense that they fire and complete in the order added to the queue, but without making them synchronous.

Additionally, events are exposed to let you handle queue limits and other things you might want.

You can find documentation and usage examples on the Wiki.

A small demo can be found in the source itself, and more examples will follow in the future.

- - -

Change Log
---------------------
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

