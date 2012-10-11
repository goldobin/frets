

(function(m, $, _) {

var INTERVAL_SEQUENCE_MAPPING = {};

function appendToIntervalSequenceMapping(intervalSequences) {
    _.each(intervalSequences, function(v, k) {
        INTERVAL_SEQUENCE_MAPPING[k.toLowerCase().replace(/_/g, "-")] = v;
    })
}

appendToIntervalSequenceMapping(m.chord);
appendToIntervalSequenceMapping(m.scale);
appendToIntervalSequenceMapping(m.mode);

$.fn.frets = function() {

    this.each(function() {
        var element = $(this);

        $(".fretboard")
            .fretboard({size: 24})
            .on("keyChange", function() {
                $(".intervals").intervals("key", $(this).fretboard("key"));
            });

        $(".intervals")
            .intervals()
            .on("intervalsChange", function() {
                $(".fretboard").fretboard("intervals", $(this).intervals("intervals"))
            })
            .on("keyChange", function() {
                $(".fretboard").fretboard("key", $(this).intervals("key"))
            });


        element.find(".interval-sequence-nav-element").click(function() {
            var intervalSequenceName = $(this).data("interval-sequence-name"),
                intervals = INTERVAL_SEQUENCE_MAPPING[intervalSequenceName];

            $(".intervals").intervals("intervals", intervals);
            $(".fretboard").fretboard("intervals", intervals);
        })
    });

    return this;
}

})(music, jQuery, _)
