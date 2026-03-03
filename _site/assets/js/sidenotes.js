/*
 * @author: Kaushik Gopal
 * @author: Michal Jirku
 *
 * A jQuery function that displays the footnotes
 * on the side (sidenotes) for easier reading.
 *
 * This is as recommended by Edward Tufte's style sidenotes:
 * https://edwardtufte.github.io/tufte-css/#sidenotes
 *
 * ---
 *
 *  Changelog:
 *  - 2020-12-26, Michal Jirku
 *    - switch to resizing (rather than removing and re-initializing)
 *    - run resize triggers via setInterval and from resize/font hooks
 *    - setInterval finally fixes iOS sizing issues for stlviewer
 *    - remove bunch of "global" vars
 *  - 2020-11-23, Michal Jirku
 *    - make sidenotes flexible width
 *    - make sidenotes not overlap one another
 *    - make sidenotes reload on font load (to help with &previous)
 *    - make sidenotes compatible with multiple links to the same note
 *  - 2020-09-07, Kaushik Gopal
 *    - initial version from https://blog.jkl.gg/jekyll-footnote-tufte-sidenote/
 *
 */

/*
 * Jekyll / kramdown sidenotes
 * Fixed and hardened version
 */

console.log("✅ sidenotes.js is executing");

(function () {

    function showSidenote(index, sup, fnli, prev) {
        // Guard
        if (!fnli.eq(index).length) return prev;

        // Extract footnote HTML
        let content = fnli.eq(index).html();

        // Construct sidenote
        let div = document.createElement("div");
        div.className = "sidenote";
        div.innerHTML =
            `<span class="sidenote-header">${index + 1}. </span>${content}`;

        let $div = $(div);

        let sizeit = function () {
            let $post = $(".post").first();
            if (!$post.length) return;

            let ww = $post.outerWidth() + $post.offset().left;
            let position = sup.offset();

            let minh = 0;
            if (prev) {
                minh = prev.position().top + prev.outerHeight() + 5;
            }

            $div.css({
                position: "absolute",
                left: ww,
                top: Math.max(minh, position.top),
                "min-width": ww > 420 ? ww / 4 : ww / 3,
                "max-width": ww / 3,
            });

            if (ww > 420) {
                $div.removeClass("sidenote-perma-hover");

                sup.hover(
                    () => $div.addClass("sidenote-hover"),
                    () => $div.removeClass("sidenote-hover")
                );
            } else {
                $div.addClass("sidenote-hover sidenote-perma-hover");
            }
        };

        sizeit();

        $div.data("sizing-func", sizeit);
        setInterval(sizeit, 3000);

        $(document.body).append($div);

        return $div;
    }

    $(window).on("load", function () {
        // Ensure footnotes are measurable even if hidden
        let $footnotes = $(".footnotes");
        if (!$footnotes.length) return;

        let originalDisplay = $footnotes.css("display");
        $footnotes.css("display", "block");

        let fnli = $footnotes.find("ol > li");

        // Match Jekyll/kramdown footnote references
        let prev = null;
        $("sup").has("a[href^='#fn:']").each(function (index) {
            prev = showSidenote(index, $(this), fnli, prev);
        });

        // Restore original visibility
        $footnotes.css("display", originalDisplay);

        // Resize hooks
        $(window).on("resize", function () {
            $(".sidenote").each(function () {
                let f = $(this).data("sizing-func");
                if (f) f();
            });
        });

        if (document.fonts) {
            document.fonts.onloadingdone = function () {
                $(".sidenote").each(function () {
                    let f = $(this).data("sizing-func");
                    if (f) f();
                });
            };
        }
    });

})();
