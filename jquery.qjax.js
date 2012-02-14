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
        };

        //Public clear method for aborting the current ajax request, and resetting the queue.
        this.clear = function() {
            if (_currentReq) {
                _currentReq.abort();
                _currentReq = null;
            }
            _queue = [];
        };

        //Public queue method. Options is a lit obj identical to the $.ajax options object. thisArg is the "this" context you want passed to the complete handler.
        this.Queue = function(options, thisArg) {
            //Setup options, and store the original complete event handler for later.
            var _o = $.extend({}, opt.ajaxSettings, options||{}), origComplete = _o.complete;
            //Assign our own complete handler.
            _o.complete = function(request, status) {
                //Pull off the first request.
                var req = _queue.shift();
                //If the request has an original complete handler assigned, call it.
                if (req.complete) {
                    req.complete.call(req.thisArg||this, request, status);
                }
                //Trigger the queue change event, and null out the current request.
                TriggerQueueChange();
                _currentReq = null;
                //Start the next request in line.
                if (_queue.length >= 1 && !_currentReq) {
                    _currentReq = $.ajax(_queue[0].options);
                }
            };
            //Add the ajax call to the queue.
            _queue.push({options: _o, complete: origComplete, thisArg: thisArg});
            //Trigger the queue change event.
            TriggerQueueChange();
            //Kick off the ajax call if it's the first one.
            if (_queue.length == 1 && !_currentReq) {
                _currentReq = $.ajax(_queue[0].options);
            }
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