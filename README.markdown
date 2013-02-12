qJax - jQuery Ajax/Function Queuing Plugin
================================

qJax is a jQuery plugin that allows ajax or function calls to be queued in the sense that they fire and complete in the order added to the queue, but without making them synchronous.

Additionally, events are exposed to let you handle queue limits and other things you might want.

You can find documentation and usage examples on the Wiki.

A small demo can be found in the source itself, and more examples will follow in the future.

- - -

Change Log
---------------------
* **1.3.1**
	* Added manifest for plugins.jquery.com
	* Updated for jQuery 1.9.1, and worked around an example issue with mockjax and the latest jQuery.
* **1.3.0**
    * Refactored plugin, cleaning up code duplication, complexity.
    * Added support for queuing functions in addition to ajax calls.
* **1.2.0**
    * Changed the plugin to be instanced, instead of a global call similar to $.ajax.