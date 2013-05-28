/*!           __
   ____ _    / /___ __  __
  / __ `/_  / / __ `/ |/_/
 / /_/ / /_/ / /_/ />  <
 \__, /\____/\__,_/_/|_|
   /_/  jQuery plugin v1.5.2 - https://github.com/PortableSheep/qJax
        Copyright 2011-2013, Michael Gunderson - Dual licensed under the MIT or GPL Version 2 licenses.
*/
(function($){
    $.qjax = function(o) {
        var opt = $.extend({
            timeout: null,
            onStart: null,
            onStop: null,
            onError: null,
            onTimeout: null,
            onQueueChange: null,
            queueChangeDelay: 0,
            ajaxSettings: {
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                type: 'GET'
            }
        }, o), _queue = [], _currentReq = null, _timeoutRef = null, _this = this, _started = false,
        /*      ____      __                        __   ______                 __  _
               /  _/___  / /____  _________  ____ _/ /  / ____/_  ______  _____/ /_(_)___  ____  _____
               / // __ \/ __/ _ \/ ___/ __ \/ __ `/ /  / /_  / / / / __ \/ ___/ __/ / __ \/ __ \/ ___/
             _/ // / / / /_/  __/ /  / / / / /_/ / /  / __/ / /_/ / / / / /__/ /_/ / /_/ / / / (__  )
            /___/_/ /_/\__/\___/_/  /_/ /_/\__,_/_/  /_/    \__,_/_/ /_/\___/\__/_/\____/_/ /_/____/
        */
        TriggerStartEvent = function() {
            if (!_started) {
                _started = true;
                //If we have a timeout handler, a timeout interval, and we have at least one thing in the queue...
                if (opt.onTimeout && opt.timeout && $.isFunction(opt.onTimeout)) {
                    //Kill the old timeout handle
                    if (_timeoutRef) {
                        clearTimeout(_timeoutRef);
                    }
                    //Create a new timeout, that calls the event when elapsed.
                    _timeoutRef = setTimeout($.proxy(function() {
                        opt.onTimeout.call(this, _currentReq.options);
                    }, this), opt.timeout);
                }
                //If we have an onStart handler, call it.
                if (opt.onStart && $.isFunction(opt.onStart)) {
                    opt.onStart(this, _currentReq.options);
                }
            }
        },
        TriggerStopEvent = function() {
            //If we've started, and the queue is empty...
            if (_started && _queue.length <= 0) {
                _started = false;
                if (_timeoutRef) {
                    clearTimeout(_timeoutRef);
                }
                //Mark as stopped, and fire the onStop handler if possible.
                if (opt.onStop && $.isFunction(opt.onStop)) {
                    opt.onStop(this, _currentReq.options);
                }
            }
        },
        TriggerQueueChange = function() {
            if (opt.onQueueChange) {
                opt.onQueueChange.call(_this, _queue.length);
            }
            //Only start a new request if we have at least one, and another isn't in progress.
            if (_queue.length >= 1 && !_currentReq) {
                //Pull off the next request.
                _currentReq = _queue.shift();
                if (_currentReq.options.isCallback) {
                    //It's a queued function... just call it.
                    _currentReq.options.complete();
                } else {
                    //Create the new ajax request, and assign any promise events.
                    TriggerStartEvent();
                    var request = $.ajax(_currentReq.options);
                    for(var i in _currentReq.promise) {
                        for(var x in _currentReq.promise[i]) {
                            request[i].call(this, _currentReq.promise[i][x]);
                        }
                    }
                }
            }
        };

        /*     ____                           ____  __      _           __
              / __ \__  _____  __  _____     / __ \/ /_    (_)__  _____/ /_
             / / / / / / / _ \/ / / / _ \   / / / / __ \  / / _ \/ ___/ __/
            / /_/ / /_/ /  __/ /_/ /  __/  / /_/ / /_/ / / /  __/ /__/ /_
            \___\_\__,_/\___/\__,_/\___/   \____/_.___/_/ /\___/\___/\__/
                                                     /___/
        */
        var QueueObject = function(options, complete, context) {
            this.options = options;
            this.complete = complete;
            this.context = context;
            this.promise = { done: [], then: [], always: [], fail: [] };
        };
        QueueObject.prototype._promise = function(n, h) {
            if (this.promise[n]) {
                this.promise[n].push(h);
            }
            return this;
        }
        QueueObject.prototype.done = function(handler) {
            return this._promise('done', handler);
        };
        QueueObject.prototype.then = function(handler) {
            return this._promise('then', handler);
        };
        QueueObject.prototype.always = function(handler) {
            return this._promise('always', handler);
        };
        QueueObject.prototype.fail = function(handler) {
            return this._promise('fail', handler);
        };

        /*      ____        __    ___         ______                 __  _
               / __ \__  __/ /_  / (_)____   / ____/_  ______  _____/ /_(_)___  ____  _____
              / /_/ / / / / __ \/ / / ___/  / /_  / / / / __ \/ ___/ __/ / __ \/ __ \/ ___/
             / ____/ /_/ / /_/ / / / /__   / __/ / /_/ / / / / /__/ /_/ / /_/ / / / (__  )
            /_/    \__,_/_.___/_/_/\___/  /_/    \__,_/_/ /_/\___/\__/_/\____/_/ /_/____/
        */
        this.Clear = function() {
            _queue = [];
        };
        this.Queue = function(obj, thisArg) {
            var _o = {}, origComplete = null;
            if (obj instanceof Function) {
                //If the obj var is a function, set the options to reflect that, and set the origComplete var to the passed function.
                _o = { isCallback: true };
                origComplete = obj;
            } else {
                //The obj is an object of ajax settings. Extend the options with the instance ones, and store the complete function.
                _o = $.extend({}, opt.ajaxSettings, obj||{});
                origComplete = _o.complete;
            }
            //Create our own custom complete handler...
            _o.complete = function(request, status) {
                if (status == 'error' && opt.onError && $.isFunction(opt.onError)) {
                    opt.onError.call(_currentReq.context||this, request, status);
                }
                if (_currentReq) {
                    if (_currentReq.complete) {
                        _currentReq.complete.call(_currentReq.context||this, request, status);
                    }
                    TriggerStopEvent();
                    _currentReq = null;
                    TriggerQueueChange();
                }
            };
            //Push the queue object into the queue, and notify the user that the queue length changed.
            var obj = new QueueObject(_o, origComplete, thisArg);
            _queue.push(obj);
            setTimeout(TriggerQueueChange, opt.queueChangeDelay);
            return obj;
        };
        return this;
    };
})(jQuery);