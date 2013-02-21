/*!
 * qJax jQuery plugin v1.4.0 - https://github.com/PortableSheep/qJax
 * Copyright 2011-2013, Michael Gunderson - Dual licensed under the MIT or GPL Version 2 licenses.
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
            ajaxSettings: {
                url: '',
                timeout: 5000,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                type: 'POST'
            }
        }, o), _queue = [], _currentReq = null, _timeoutRef = null, _this = this, _started = false,
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
            if (_queue.length >= 1 && !_currentReq) {
                _currentReq = _queue.shift();
                if (_currentReq.options.isCallback) {
                    _currentReq.options.complete();
                } else {
                    TriggerStartEvent();
                    $.ajax(_currentReq.options);
                }
            }
        };
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
                    opt.onError.call(_currentReq.thisArg||this, request, status);
                }
                if (_currentReq) {
                    if (_currentReq.complete) {
                        _currentReq.complete.call(_currentReq.thisArg||this, request, status);
                    }
                    TriggerStopEvent();
                    _currentReq = null;
                    TriggerQueueChange();
                }
            };
            //Push the queue object into the queue, and notify the user that the queue length changed.
            _queue.push({ options: _o, complete: origComplete, thisArg: thisArg});
            TriggerQueueChange();
        };
        return this;
    };
})(jQuery);