window.onload = function () {
    'use strict';

    var count, images, dim, offset, center, angle, dist, shift,
        pressed, reference, amplitude, target, velocity, timeConstant,
        xform, frame, timestamp, ticker;

    function initialize() {
        pressed = false;
        timeConstant = 250; // ms
        dim = 200;
        offset = target = 0;
        angle = -60;
        dist = -150;
        shift = 10;
        count = 9;
        images = [];
        while (images.length < count) {
            images.push(document.getElementById(images.length));
        }
    }

    function setupEvents() {
        var view = document.getElementById('content');
        if (typeof window.ontouchstart !== 'undefined') {
            view.addEventListener('touchstart', tap);
            view.addEventListener('touchmove', drag);
            view.addEventListener('touchend', release);
        }
        view.addEventListener('mousedown', tap);
        view.addEventListener('mousemove', drag);
        view.addEventListener('mouseup', release);
        document.addEventListener('keydown', handleKey);
    }

    function xpos(e) {
        // touch event
        if (e.targetTouches && (e.targetTouches.length >= 1)) {
            return e.targetTouches[0].clientX;
        }

        // mouse event
        return e.clientX;
    }

    function wrap(x) {
        return (x >= count) ? (x % count) : (x < 0) ? wrap(count + (x % count)) : x;
    }

    function scroll(x) {
        var i, half, delta, dir, tween, el, alignment;

        offset = (typeof x === 'number') ? x : offset;
        center = Math.floor((offset + dim / 2) / dim);
        delta = offset - center * dim;
        dir = (delta < 0) ? 1 : -1;
        tween = -dir * delta * 2 / dim;

        alignment = 'translateX(' + (innerWidth - dim) / 2 + 'px) ';
        alignment += 'translateY(' + (innerHeight - dim) / 2 + 'px)';

        // center
        el = images[wrap(center)];
        el.style[xform] = alignment +
            ' translateX(' + (-delta / 2) + 'px)' +
            ' translateX(' + (dir * shift * tween) + 'px)' +
            ' translateZ(' + (dist * tween) + 'px)' +
            ' rotateY(' + (dir * angle * tween) + 'deg)';
        el.style.zIndex = 0;
        el.style.opacity = 1;

        half = count >> 1;
        for (i = 1; i <= half; ++i) {
            // right side
            el = images[wrap(center + i)];
            el.style[xform] = alignment +
                ' translateX(' + (shift + (dim * i - delta) / 2) + 'px)' +
                ' translateZ(' + dist + 'px)' +
                ' rotateY(' + angle + 'deg)';
            el.style.zIndex = -i;
            el.style.opacity = (i === half && delta < 0) ? 1 - tween : 1;

            // left side
            el = images[wrap(center - i)];
            el.style[xform] = alignment +
                ' translateX(' + (-shift + (-dim * i - delta) / 2) + 'px)' +
                ' translateZ(' + dist + 'px)' +
                ' rotateY(' + -angle + 'deg)';
            el.style.zIndex = -i;
            el.style.opacity = (i === half && delta > 0) ? 1 - tween : 1;
        }

        // center
        el = images[wrap(center)];
        el.style[xform] = alignment +
            ' translateX(' + (-delta / 2) + 'px)' +
            ' translateX(' + (dir * shift * tween) + 'px)' +
            ' translateZ(' + (dist * tween) + 'px)' +
            ' rotateY(' + (dir * angle * tween) + 'deg)';
        el.style.zIndex = 0;
        el.style.opacity = 1;
    }

    function track() {
        var now, elapsed, delta, v;

        now = Date.now();
        elapsed = now - timestamp;
        timestamp = now;
        delta = offset - frame;
        frame = offset;

        v = 1000 * delta / (1 + elapsed);
        velocity = 0.8 * v + 0.2 * velocity;
    }

    function autoScroll() {
        var elapsed, delta;

        if (amplitude) {
            elapsed = Date.now() - timestamp;
            delta = amplitude * Math.exp(-elapsed / timeConstant);
            if (delta > 4 || delta < -4) {
                scroll(target - delta);
                requestAnimationFrame(autoScroll);
            } else {
                scroll(target);
            }
        }
    }

    function tap(e) {
        pressed = true;
        reference = xpos(e);

        velocity = amplitude = 0;
        frame = offset;
        timestamp = Date.now();
        clearInterval(ticker);
        ticker = setInterval(track, 100);

        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    function drag(e) {
        var x, delta;
        if (pressed) {
            x = xpos(e);
            delta = reference - x;
            if (delta > 2 || delta < -2) {
                reference = x;
                scroll(offset + delta);
            }
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    function release(e) {
        pressed = false;

        clearInterval(ticker);
        target = offset;
        if (velocity > 10 || velocity < -10) {
            amplitude = 0.9 * velocity;
            target = offset + amplitude;
        }
        target = Math.round(target / dim) * dim;
        amplitude = target - offset;
        timestamp = Date.now();
        requestAnimationFrame(autoScroll);

        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    function handleKey(e) {
        if (!pressed && (target === offset)) {
            // Space or PageDown or RightArrow or DownArrow
            if ([32, 34, 39, 40].indexOf(e.which) >= 0) {
                target = offset + dim;
            }
            // PageUp or LeftArrow or UpArrow
            if ([33, 37, 38].indexOf(e.which) >= 0) {
                target = offset - dim;
            }
            if (offset !== target) {
                amplitude = target - offset;
                timestamp = Date.now();
                requestAnimationFrame(autoScroll);
                return true;
            }
        }
    }

    xform = 'transform';
    ['webkit', 'Moz', 'O', 'ms'].every(function (prefix) {
        var e = prefix + 'Transform';
        if (typeof document.body.style[e] !== 'undefined') {
            xform = e;
            return false;
        }
        return true;
    });

    window.onresize = scroll;

    initialize();
    setupEvents();
    scroll(offset);
};
