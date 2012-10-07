
var music = {};

(function(m, _) {

    var interval = {
        PERFECT_UNISON: 0,
        MINOR_SECOND: +1,
        MAJOR_SECOND: +2,
        MINOR_THIRD: +3,
        MAJOR_THIRD: +4,
        PERFECT_FOURTH: +5,
        TRITONE: +6,
        PERFECT_FIFTH: +7,
        MINOR_SIXTH: +8,
        MAJOR_SIXTH: +9,
        MINOR_SEVENTH: +10,
        MAJOR_SEVENTH: +11,
        PERFECT_OCTAVE_UNISON: +12
    },
    chord = {
        MAJOR_CHORD: [
            interval.PERFECT_UNISON,
            interval.MAJOR_THIRD,
            interval.PERFECT_FIFTH
        ],
        MINOR_CHORD: [
            interval.PERFECT_UNISON,
            interval.MINOR_THIRD,
            interval.PERFECT_FIFTH
        ],
        DOMINANT_SEVENTH_CHORD: [
            interval.PERFECT_UNISON,
            interval.MAJOR_THIRD,
            interval.PERFECT_FIFTH,
            interval.MINOR_SEVENTH
        ],
        MAJOR_SIXTH_CHORD: [
            interval.PERFECT_UNISON,
            interval.MAJOR_THIRD,
            interval.PERFECT_FIFTH,
            interval.MAJOR_SIXTH
        ],
        MAJOR_SEVENTH_CHORD: [
            interval.PERFECT_UNISON,
            interval.MAJOR_THIRD,
            interval.PERFECT_FIFTH,
            interval.MAJOR_SEVENTH
        ],
        MINOR_SEVENTH_CHORD: [
            interval.PERFECT_UNISON,
            interval.MINOR_THIRD,
            interval.PERFECT_FIFTH,
            interval.MAJOR_SEVENTH
        ]
    },
    scale = {
        MAJOR_SCALE: [
            interval.PERFECT_UNISON,
            interval.MAJOR_SECOND,
            interval.MAJOR_THIRD,
            interval.PERFECT_FOURTH,
            interval.PERFECT_FIFTH,
            interval.MAJOR_SIXTH,
            interval.MAJOR_SEVENTH
        ],
        MAJOR_PENTATONIC_SCALE: [
            interval.PERFECT_UNISON,
            interval.MAJOR_SECOND,
            interval.MAJOR_THIRD,
            interval.PERFECT_FIFTH,
            interval.MAJOR_SIXTH
        ],
        NATURAL_MINOR_SCALE: [
            interval.PERFECT_UNISON,
            interval.MAJOR_SECOND,
            interval.MINOR_THIRD,
            interval.PERFECT_FOURTH,
            interval.PERFECT_FIFTH,
            interval.MINOR_SIXTH,
            interval.MINOR_SEVENTH
        ]
    },
    mode = {
        AEOLIAN_MODE: scale.NATURAL_MINOR_SCALE,
        MIXOLYDIAN_MODE: [
            interval.PERFECT_UNISON,
            interval.MAJOR_SECOND,
            interval.MAJOR_THIRD,
            interval.PERFECT_FOURTH,
            interval.PERFECT_FIFTH,
            interval.MAJOR_SIXTH,
            interval.MINOR_SEVENTH
        ]
    };

    _.extend(m, {
        PITCH_NAMES: [ "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#" ],
        interval: interval,
        scale: scale,
        chord: chord,
        mode: mode
    });

    m.pitch = function(nameOrIndex, octave) {
        var _name,
            _index,
            _octave;

        if (typeof nameOrIndex === "number") {
            _name = m.PITCH_NAMES[nameOrIndex];
            _index = nameOrIndex;
        } else {
            _index = m.PITCH_NAMES.indexOf(nameOrIndex.toUpperCase());
            _name = nameOrIndex;
        }

        _octave = typeof octave === "number" ? octave : 0;

        return {
            increment: function() {
                var steps = arguments.length > 0
                        ? arguments[0]
                        : 1,
                    index = _index + steps,
                    octave = _octave;

                if (index >= m.PITCH_NAMES.length) {
                    index = index - m.PITCH_NAMES.length;
                    octave ++;
                } else if (index < 0) {
                    index = index + m.PITCH_NAMES.length;
                    octave --;
                }

                return m.pitch(index, octave);
            },
            toString: function() {
                return _name + _octave;
            },
            octave: function() {
                return _octave;
            },
            name: function() {
                return _name;
            }
        }
    };

    m.guitar = function(tuning, size) {
        var _pitchTable  = new Array(tuning.length),
            _octaveMapping = new Array(8),
            _pitchPerStringCount = size + 1;

        _.times(tuning.length, function(i) {
            _pitchTable[i] = new Array(_pitchPerStringCount)
        });

        _.times(_octaveMapping.length, function(i) {
            _octaveMapping[i] = {}
        });

        _.each(tuning.reverse(), function (p, s) {
            _.times(_pitchPerStringCount, function (f) {
                var octave = _octaveMapping[p.octave()];

                if (octave[p.name] == null) {
                    octave[p.name] = [];
                }

                octave[p.name].push({
                    string: s,
                    fret: f
                });

                _pitchTable[s][f] = p;
                p = p.increment();
            });
        });

        return {
            pithPerStringCount: function() {
                return _pitchPerStringCount;
            },
            fretCount: function() {
                return size;
            },
            stringCount: function() {
                return tuning.length
            },
            tuning: function() {
                return tuning;
            },
            at: function(pos) {
                return _pitchTable[pos.string][pos.fret];
            },
            position: function(key) {
                return _octaveMapping[key.octave()][key.name()];
            },
            positions: function(key) {
                var result = [];
                _.each(_pitchTable, function(frets, s) {
                    _.each(frets, function(pitch, f) {
                        if (pitch.name() == key.name()) {
                            result.push({
                                string: s,
                                fret: f
                            });
                        }
                    })
                });

                return result;
            },
            octavePositions: function(num) {
                var result = [];

                _.each(_octaveMapping[num], function(pitchPositions, k) {
                    _.each(pitchPositions, function(positions) {
                        _.each(positions, function(position) {
                            result.push(position)
                        });
                   })
                });
                return result;
            },
            intervalsPositions: function(key, intervals) {
                var self = this,
                    result = new Array(intervals.length);

                _.each(intervals, function(v, i) {
                    result[i] = self.positions(key.increment(v));
                });
                return result;
            }
        }
    };

    m.guitar.tuning = {
        regular: [
            m.pitch("E", 2),
            m.pitch("A", 3),
            m.pitch("D", 3),
            m.pitch("G", 3),
            m.pitch("B", 4),
            m.pitch("E", 4)],
        celtic: [ "D", "A", "D", "G", "A", "D" ]
    }

})(music, _);