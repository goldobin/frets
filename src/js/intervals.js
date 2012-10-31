/*!
 * Copyright 2012 Oleksandr Goldobin
 */

(function(m, $, _) {

var DEFAULTS = {

};

function applyKey(instance, pitch) {
    instance.find(".btn-interval-pitch").each(function(i) {
        if (i == 0) {
            $(this).html(pitch.name());
            return;
        }

        $(this).html(pitch.increment(i).name());
    })
}

function applyIntervals(instance, intervals) {
    var pitchButtons = instance.find(".btn-interval-pitch");

    pitchButtons.each(function() {
        $(this).removeClass("btn-warning");

    });

    _.each(intervals, function(v) {
        $(pitchButtons.get(v)).addClass("btn-warning")
    })
}


$.fn.intervals = function() {
    var self = $(this),
        settings;

    if (arguments.length > 0 && typeof arguments[0] === "string") {
        var props = {
            key: function(v) {
                if (v == null) {
                    if (self.size() <= 0) {
                        return "";
                    }

                    return m.pitch($(self.get(0)).find(".btn-key").html());
                } else {
                    self.each(function() {
                        applyKey($(this), v)
                    })
                }
            },
            intervals: function(v) {
                if (v == null) {
                    if (self.size() <= 0) {
                        return [];
                    }

                    var instance = $(self.get(0)),
                        pitchButtons = instance.find(".btn-interval-pitch"),
                        result = [];

                    pitchButtons.each(function(i) {
                        if ($(this).hasClass("btn-warning")) {
                            result.push(i);
                        }
                    });

                    return result;
                } else {
                    self.each(function() {
                        applyIntervals($(this), v);
                    })
                }
            }
        },
        prop = props[arguments[0]];

        if (_.isFunction(prop)) {
            return prop(arguments[1]);
        }
        return;
    }

    settings = $.extend({}, DEFAULTS, arguments[0]);


    this.each(function() {
        var element = $(this),
            btnKey = element.find(".btn-key"),
            pitchButtons = element.find(".btn-interval-pitch");

        element.find(".dropdown-menu li a").click(function() {
            var instance = $(this),
                pitch = m.pitch(instance.html());

            btnKey.html(pitch.name());
            pitchButtons.each(function(i) {
                $(this).html(pitch.increment(i).name());
            });

            instance.trigger("keyChange");

        });

        element.find(".btn").click(function() {
            var instance = $(this);
            if (instance.hasClass("dropdown-toggle")) {
                return;
            }

            instance.toggleClass("btn-warning");
            element.trigger("intervalsChange");
        })
    });

    return self;
}

})(music, jQuery, _);