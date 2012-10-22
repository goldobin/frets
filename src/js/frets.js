

(function(m, $, _) {

var INTERVAL_SET_MAPPING = {};

function intervalNameToClassName(intervalName) {
    return intervalName.toLowerCase().replace(/_/g, "-")
}

function appendToIntervalSequenceMapping(intervalSequences) {
    _.each(intervalSequences, function(v, k) {
        INTERVAL_SET_MAPPING[intervalNameToClassName(k)] = v;
    })
}


appendToIntervalSequenceMapping(m.chord);
appendToIntervalSequenceMapping(m.scale);
appendToIntervalSequenceMapping(m.mode);

function highlightInterval(instance, intervals) {
    var intervalSetNames = m.intervals.exactMatch(intervals),
        intervalSetClasses = _.map(intervalSetNames, function(v) {
            return intervalNameToClassName(v);
        });


    instance.find(".interval-sequence-nav-element").each(function() {
        var element = $(this),
            intervalSetClass = element.data("interval-sequence-name");
        if (intervalSetClasses.indexOf(intervalSetClass) > -1) {
            element.parent().addClass("exact-match");
        } else {
            element.parent().removeClass("exact-match");
        }
    });
}

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
                var intervals = $(this).intervals("intervals");
                $(".fretboard").fretboard("intervals", intervals);
                highlightInterval(element, intervals);
            })
            .on("keyChange", function() {
                $(".fretboard").fretboard("key", $(this).intervals("key"))
            });


        element.find(".interval-sequence-nav-element").click(function() {
            var intervalSequenceName = $(this).data("interval-sequence-name"),
                intervals = INTERVAL_SET_MAPPING[intervalSequenceName];

            $(".intervals").intervals("intervals", intervals);
            $(".fretboard").fretboard("intervals", intervals);
            highlightInterval(element, intervals);

            return false;
        });

        var navVisible = true,
            showNav = element.find(".nav-intervals-show"),
            hideNav = element.find(".nav-intervals-hide"),
            navContent = element.find(".nav-intervals");

        function updateNavigationVisibility() {
            if (navVisible) {
                $(this).hide();
                navContent.show();
                showNav.hide();
            } else {
                $(this).show();
                navContent.hide();
                showNav.show();
            }
        }

        showNav.click(function() {
            navVisible = true;
            updateNavigationVisibility();
        });

        hideNav.click(function() {
            navVisible = false;
            updateNavigationVisibility();
        })

    });

    return this;
}

})(music, jQuery, _);

