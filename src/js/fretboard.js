/*!
 * Copyright 2012 Oleksandr Goldobin
 */

(function(m, $, _) {


var DEFAULTS = {
        tuning: "regular",
        size: 22,
        displayNumbers: true
}, INTERVAL_CLASSES = [
    "perfect-unison",
    "minor-second",
    "major-second",
    "minor-third",
    "major-third",
    "perfect-fourth",
    "tritone",
    "perfect-fifth",
    "minor-sixth",
    "major-sixth",
    "minor-seventh",
    "major-seventh"
], ONE_DOT_MARK_POSITIONS = [
    3, 5, 7, 9
];

function nutToFretDistance(scale, fret) {
    return scale - (scale / (Math.pow(2, (fret / 12))));
}

function buildFretLengthsScaleInPercents(frets, coeff) {
    var SCALE = 25.5,
        LAST_NUT_TO_FRET_DISTANCE = nutToFretDistance(SCALE, frets + 2),
        result = new Array(frets),
        prevDistance = 0,
        distance;

    for (var i = 0; i < frets; i++) {
        distance = nutToFretDistance(SCALE, i + 1);
        result[i] = (distance - prevDistance)/LAST_NUT_TO_FRET_DISTANCE * coeff;
        prevDistance = distance;
    }

    return result;
}

function buildPitchClass(p) {
    return p.name().toLowerCase().replace("#", "-sharp") + "-pitch";
}

function buildOctaveClass(p) {
    return "octave-" + p.octave();
}

function buildIntervalClass(interval) {
    return INTERVAL_CLASSES[interval];
}

function createPitchElement(p) {
    var pitchNameElement = $("<span>")
            .addClass("pitch-name")
            .html(p.toString()),
        pitchIntervalElement = $("<div>").addClass("pitch-interval-name");

    return $("<div>")
    .addClass("pitch")
    .addClass(buildPitchClass(p))
    .addClass(buildOctaveClass(p))
    .append(pitchNameElement)
    .append(pitchIntervalElement)
    .data("pitch", p)
}

function update(instance) {
    var pitchElements = instance.find(".pitch"),
        keyPitch = instance.data("key"),
        intervals = instance.data("intervals"),
        guitar = instance.data("guitar"),
        pitchElementMatrix = instance.data("pitchElementMatrix");

    pitchElements.removeClass("key").removeClass("selected");

    _.each(INTERVAL_CLASSES, function(className) {
        pitchElements.removeClass(className);
    });

    var keyPitches = guitar.positions(keyPitch);
    _.each(keyPitches, function(v) {
        pitchElementMatrix[v.string][v.fret].addClass("key");
    });

    var positionsOfIntervals = guitar.intervalsPositions(keyPitch, intervals);
    _.each(positionsOfIntervals, function(coords, intervalIndex) {
        _.each(coords, function(v) {
            pitchElementMatrix[v.string][v.fret]
                .addClass("selected")
                .addClass(buildIntervalClass(intervals[intervalIndex]));
        });
    })
}

$.fn.fretboard = function() {
    var self = $(this),
        settings,
        tuning,
        guitar;


    if (arguments.length > 0 && typeof arguments[0] === "string") {
        var props = {
            key: function(v) {
                if (v == null) {
                    if (self.size() <= 0) {
                        return null;
                    }
                    return $(self.get(0)).data("key");
                } else {
                    self.each(function() {
                        var instance = $(this);
                        instance.data("key", v);
                        update(instance);
                    })
                }
            },
            intervals: function(v) {
                if (v == null) {
                    if (self.size() <= 0) {
                        return [];
                    }
                    return $(self.get(0)).data("intervals");
                } else {
                    self.each(function() {
                        var instance = $(this);
                        instance.data("intervals", v);
                        update(instance);
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
    tuning = m.guitar.tuning[settings.tuning];
    guitar = new m.guitar(tuning, settings.size);

    this.each(function() {
        var element = $(this),
            pitchElementMatrix = [];

        _.times(tuning.length, function(s) {
            pitchElementMatrix[s] = [];
        });

        element.data("guitar", guitar);
        element.data("pitchElementMatrix", pitchElementMatrix);
        element.data("key", m.pitch("A"));
        element.data("intervals", []);


        var fretNumbersLine = $("<div>").addClass("fret-numbers").appendTo(element);

        $("<div>")
            .html("&nbsp;")
            .addClass("fret-number")
            .css("width", "2%")
            .appendTo(fretNumbersLine);

        var SCALE = buildFretLengthsScaleInPercents(settings.size, 98);

        for (var i = 0; i < settings.size; i++) {

            $("<div>")
                .css("width", SCALE[i] + "%")
                .addClass("fret-number")
                .append(
                    $("<span>").addClass("fret-number-label").html(i + 1)
                )
                .appendTo(fretNumbersLine);
        }

        _.times(guitar.stringCount(), function(s) {
            var string = $("<div>")
                .addClass("string")
                .addClass("string-" + (s + 1))
                .appendTo(element);

            if (s == 0) {
                string.addClass("string-first");
            } else if (s == guitar.stringCount() - 1) {
                string.addClass("string-last")
            }

            _.times(guitar.pithPerStringCount(), function(f) {
                var pitch = guitar.at({
                    string: s,
                    fret: f
                });

                pitchElementMatrix[s][f] = createPitchElement(pitch)
                    .click(function() {
                        element.data("key", pitch);
                        update(element);
                        element.trigger("keyChange");

                    })
                    .appendTo(string);
            });
        });

        var fretMarksLine = $("<div>").addClass("fret-marks").appendTo(element),
            mark = "",
            fretIndex = 0;

        $("<div>")
            .html("&nbsp;")
            .addClass("fret-mark")
            .appendTo(fretMarksLine);


        for (i = 0; i < settings.size; i++) {

            fretIndex = i + 1;

            fretIndex = fretIndex - Math.floor(fretIndex / 12) * 12;

            if (fretIndex == 0)  {
                mark = "&middot;&nbsp;&middot;";
            } else if (ONE_DOT_MARK_POSITIONS.indexOf(fretIndex) > -1){
                mark = "&middot;";
            } else {
                mark = "&nbsp;"
            }
            $("<div>")
                .addClass("fret-mark")
                .append(
                $("<span>").addClass("fret-mark-label").html(mark))
            .appendTo(fretMarksLine);
        }

    });

    return this;
};

})(music, jQuery, _);