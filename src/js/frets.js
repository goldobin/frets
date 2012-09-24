

(function($, _) {

var PITCH_NAMES = [ "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#" ],
    PERFECT_UNISON = 0,
    MINOR_SECOND = +1,
    MAJOR_SECOND = +2,
    MINOR_THIRD = +3,
    MAJOR_THIRD = +4,
    PERFECT_FOURTH = +5,
    TRITONE = +6,
    PERFECT_FIFTH = +7,
    MINOR_SIXTH = +8,
    MAJOR_SIXTH = +9,
    MINOR_SEVENTH = +10,
    MAJOR_SEVENTH = +11,
    PERFECT_OCTAVE_UNISON = +12,
    INTERVAL_CLASSES = [
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
    ],
    MAJOR_SCALE = [
        PERFECT_UNISON,
        MAJOR_SECOND,
        MAJOR_THIRD,
        PERFECT_FOURTH,
        PERFECT_FIFTH,
        MAJOR_SIXTH,
        MAJOR_SEVENTH
    ],
    MAJOR_PENTATONIC_SCALE = [
        PERFECT_UNISON,
        MAJOR_SECOND,
        MAJOR_THIRD,
        PERFECT_FIFTH,
        MAJOR_SIXTH
    ],
    NATURAL_MINOR_SCALE = [
        PERFECT_UNISON,
        MAJOR_SECOND,
        MINOR_THIRD,
        PERFECT_FOURTH,
        PERFECT_FIFTH,
        MINOR_SIXTH,
        MINOR_SEVENTH
    ],
    MAJOR_CHORD = [
        PERFECT_UNISON,
        MAJOR_THIRD,
        PERFECT_FIFTH
    ],
    MINOR_CHORD = [
        PERFECT_UNISON,
        MINOR_THIRD,
        PERFECT_FIFTH
    ],
    DOMINANT_SEVENTH_CHORD = [
        PERFECT_UNISON,
        MAJOR_THIRD,
        PERFECT_FIFTH,
        MINOR_SEVENTH
    ],
    MAJOR_SIXTH_CHORD = [
        PERFECT_UNISON,
        MAJOR_THIRD,
        PERFECT_FIFTH,
        MAJOR_SIXTH
    ],
    MAJOR_SEVENTH_CHORD = [
        PERFECT_UNISON,
        MAJOR_THIRD,
        PERFECT_FIFTH,
        MAJOR_SEVENTH
    ],
    MINOR_SEVENTH_CHORD = [
        PERFECT_UNISON,
        MINOR_THIRD,
        PERFECT_FIFTH,
        MAJOR_SEVENTH
    ],
    AEOLIAN_MODE = NATURAL_MINOR_SCALE,
    MIXOLYDIAN_MODE = [
        PERFECT_UNISON,
        MAJOR_SECOND,
        MAJOR_THIRD,
        PERFECT_FOURTH,
        PERFECT_FIFTH,
        MAJOR_SIXTH,
        MINOR_SEVENTH
    ];


function Pitch(nameOrIndex, octave) {

    if (typeof nameOrIndex === "number") {
        this.name = PITCH_NAMES[nameOrIndex];
        this.index = nameOrIndex;
    } else {
        this.index = PITCH_NAMES.indexOf(nameOrIndex.toUpperCase());
        this.name = nameOrIndex;
    }

    this.octave = typeof octave === "number" ? octave : 0;
}

Pitch.prototype = {
    increment: function() {
        var steps = arguments.length > 0
                ? arguments[0]
                : 1,
            index = this.index + steps,
            octave = this.octave;

        if (index >= PITCH_NAMES.length) {
            index = index - PITCH_NAMES.length;
            octave ++;
        } else if (index < 0) {
            index = index + PITCH_NAMES.length;
            octave --;
        }

        return new Pitch(index, octave);
    },
    toString: function() {
        return this.name + this.octave;
    }
};

function FretBoard(tuning, size) {
    var table = this.table = new Array(tuning.length),
        frets = this.frets = size + 1,
        strings = this.strings = tuning.length;

    _.times(tuning.length, function(i) {
        table[i] = new Array(frets)
    });

    _.each(tuning.reverse(), function(p, s) {
        _.times(frets, function(f) {
            table[s][f] = p;
            p = p.increment();
        });
    })
}

FretBoard.prototype = {
    at: function(pos) {
        return this.table[pos.string][pos.fret];
    },
    all: function(key) {
        var result = [];
        _.each(this.table, function(frets, s) {
            _.each(frets, function(pitch, f) {
                if (pitch.name == key) {
                    result.push({
                        string: s,
                        fret: f
                    });
                }
            })
        });

        return result;
    },
    scales: function(key, intervals) {
        var self = this,
            keyPitch = new Pitch(key),
            result = new Array(intervals.length);

        _.each(intervals, function(v, i) {
            var intervalPitch = keyPitch.increment(v);
            result[i] = self.all(intervalPitch.name);
        });
        return result;
    },
    majorScales: function(key) {
        return this.scales(
            key, MAJOR_SCALE)
    },
    majorChords: function(key) {
        return this.scales(
            key, MAJOR_CHORD)
    },
    minorChords: function(key) {
        return this.scales(
            key, MINOR_CHORD)
    },
    majorSvenChords: function(key) {

    },
    minorSevenChord: function(key) {

    },
    sixthMajorChord: function(key) {

    },
    sixthMinorChord: function(key) {

    }
};

var TUNING = {
        regular: [
            new Pitch("E", 2),
            new Pitch("A", 3),
            new Pitch("D", 3),
            new Pitch("G", 3),
            new Pitch("B", 4),
            new Pitch("E", 4)],
        celtic: [ "D", "A", "D", "G", "A", "D" ]
    },
    DEFAULTS = {
        tuning: "regular",
        size: 22,
        displayNumbers: true
    };

function nutToFretDistance(scale, fret) {
    return scale - (scale / (Math.pow(2, (fret / 12))));
}

function bridgeToFretDistance(scale, fret) {
    return scale - nutToFretDistance(scale, fret);
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
    return p.name.toLowerCase().replace("#", "-sharp") + "-pitch";
}

function buildOctaveClass(p) {
    return "octave-" + p.octave;
}

function buildIntervalClass(interval) {
    return INTERVAL_CLASSES[interval];
}


$.fn.frets = function() {
    var self = this,
        settings = $.extend({}, DEFAULTS, arguments[0]),
        tuning = TUNING[settings.tuning],
        fretBoard = new FretBoard(tuning, settings.size),
        elements = [];

    _.times(tuning.length, function(s) {
        elements[s] = [];
    });

    function createPitchElement(p) {
        return $("<div>")
        .addClass("pitch")
        .addClass(buildPitchClass(p))
        .addClass(buildOctaveClass(p))
        .html(p.toString())
    }

    if (settings.displayNumbers) {
        var fretNumbersLine = $("<div>").addClass("line fret-numbers").appendTo(self);

        $("<div>")
            .html("&nbsp;")
            .css("width", "2%")
            .appendTo(fretNumbersLine);

        var SCALE = buildFretLengthsScaleInPercents(settings.size, 98);

        for (var i = 0; i < settings.size; i++) {

            $("<div>")
                .css("width", SCALE[i] + "%")
                .addClass("note")
                .html(i + 1)
                .appendTo(fretNumbersLine);
        }
    }

    _.times(fretBoard.strings, function(s) {
        var line = $("<div>").addClass("line").appendTo(self);
        _.times(fretBoard.frets, function(f) {
            var pitch = fretBoard.at({
                string: s,
                fret: f
            });

            elements[s][f] = createPitchElement(pitch)
                .click(function() {
                    var pitches = self.find(".pitch");
                    pitches.removeClass("key");

                    _.each(INTERVAL_CLASSES, function(className) {
                        pitches.removeClass(className);
                    });
                    var samePitches = fretBoard.all(pitch.name);
                    _.each(samePitches, function(v, i) {
                        elements[v.string][v.fret].addClass("key");
                    });

                    var intervals = NATURAL_MINOR_SCALE;
                    var positionsOfIntervals = fretBoard.scales(pitch.name, intervals);
                    _.each(positionsOfIntervals, function(coords, intervalIndex) {
                        _.each(coords, function(v) {
                            elements[v.string][v.fret].addClass(buildIntervalClass(intervals[intervalIndex]));
                        });
                    })

                })
                .appendTo(line);
        });
    });
};

})(jQuery, _);