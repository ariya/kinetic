window.onload = function () {
    'use strict';

    var view, indicator, relative,
        min, max, offset, reference, pressed, xform;

    function ypos(e) {
        // touch event
        if (e.targetTouches && (e.targetTouches.length >= 1)) {
            return e.targetTouches[0].clientY;
        }

        // mouse event
        return e.clientY;
    }

    function scroll(y) {
        offset = (y > max) ? max : (y < min) ? min : y;
        view.style[xform] = 'translateY(' + (-offset) + 'px)';
        indicator.style[xform] = 'translateY(' + (offset * relative) + 'px)';
    }

    function tap(e) {
        pressed = true;
        reference = ypos(e);
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    function drag(e) {
        var y, delta;
        if (pressed) {
            y = ypos(e);
            delta = reference - y;
            if (delta > 2 || delta < -2) {
                reference = y;
                scroll(offset + delta);
            }
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    function release(e) {
        pressed = false;
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    view = document.getElementById('view');
    if (typeof window.ontouchstart !== 'undefined') {
        view.addEventListener('touchstart', tap);
        view.addEventListener('touchmove', drag);
        view.addEventListener('touchend', release);
    }
    view.addEventListener('mousedown', tap);
    view.addEventListener('mousemove', drag);
    view.addEventListener('mouseup', release);

    max = parseInt(getComputedStyle(view).height, 10) - innerHeight;
    offset = min = 0;
    pressed = false;

    indicator = document.getElementById('indicator');
    relative = (innerHeight - 30) / max;

    xform = 'transform';
    ['webkit', 'Moz', 'O', 'ms'].every(function (prefix) {
        var e = prefix + 'Transform';
        if (typeof view.style[e] !== 'undefined') {
            xform = e;
            return false;
        }
        return true;
    });
};
