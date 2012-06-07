/*!
 * qJax jQuery plugin v1.3 - http://portablesheep.github.com/qJax
 * Copyright 2011-2012, Michael Gunderson - Dual licensed under the MIT or GPL Version 2 licenses. Same as jQuery.
 */
(function($){
    $.qjax = function(o) {
        var opt = $.extend({
            timeout: null,
            onError: null,
            onStart: null,
            onStop: null,
            onTimeout: null,
            onQueueChange: null,
            ajaxSettings: {
                url: '',
                timeout: 5000,
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                type: 'POST'
            }
        }, o), _queue = [], _currentReq = null, _timeoutRef = null, _document = $(document), _this = this,
        TriggerQueueChange = function() {
            if (opt.onQueueChange) {
                opt.onQueueChange.call(_this, _queue.length);
            }
            if (_queue.length >= 1 && !_currentReq) {
                _currentReq = _queue.shift();
                if (_currentReq.options.isCallback) {
                    _currentReq.options.complete();
                } else {
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
                if (_currentReq) {
                    if (_currentReq.complete) {
                        _currentReq.complete.call(_currentReq.thisArg||this, request, status);
                    }
                    _currentReq = null;
                    TriggerQueueChange();
                }
            };
            //Push the queue object into the queue, and notify the user that the queue length changed.
            _queue.push({ options: _o, complete: origComplete, thisArg: thisArg});
            TriggerQueueChange();
        };
        //Setup the onError handler event.
        if (opt.onError) {
            //Bind the handler to the documents ajaxError event.
            _document.ajaxError(opt.onError);
        }
        //Setup the onStart or timeout events.
        if (opt.onStart || opt.timeout) {
            //Bind the handler to the documents ajaxStart event.
            _document.ajaxStart(function() {
                //Only call out event handler if we've got one set.
                if (opt.onStart) {
                    opt.onStart.call(_this);
                }
                //Only set a timeout if we have a handler for the vent, and if there is at least one thing queued.
                if (opt.onTimeout && opt.timeout && _queue.length >= 1) {
                    if (_timeoutRef) {
                        clearTimeout(_timeoutRef);
                    }
                    _timeoutRef = setTimeout(opt.onTimeout, opt.timeout);
                }
            });
        }
        //Setup the onStop handler event.
        if (opt.onStop) {
            //Bind the handler to the documents ajaxStop event.
            _document.ajaxStop(function() {
                opt.onStop.call(_this);
            });
        }
        return this;
    };
})(jQuery);