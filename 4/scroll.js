window.onload = function () {
    'use strict';

    var view, images, left, center, right,
        index, count, offset, snap,
        pressed, reference, amplitude, target, velocity, timeConstant,
        xform, frame, timestamp, ticker;

    function initialize() {
        var i, stash, el;

        count = 10;
        images = [];
        index = 5;
        offset = 0;
        timeConstant = 125; // ms
        pressed = false;

        snap = window.innerWidth;

        view = document.getElementById('content');
        left = document.getElementById('left');
        center = document.getElementById('center');
        right = document.getElementById('right');

        left.setAttribute('width', snap + 'px');
        center.setAttribute('width', snap + 'px');
        right.setAttribute('width', snap + 'px');


        // Predownloads some images.
        stash = document.getElementById('stash');
        for (i = 0; i < count; ++i) {
            el = document.createElement('img');
            el.setAttribute('src', 'images/' + i + '.jpg');
            stash.appendChild(el);
            images.push(el);
        }
    }

    function setupEvents() {
        if (typeof window.ontouchstart !== 'undefined') {
            view.addEventListener('touchstart', tap);
            view.addEventListener('touchmove', drag);
            view.addEventListener('touchend', release);
        }
        view.addEventListener('mousedown', tap);
        view.addEventListener('mousemove', drag);
        view.addEventListener('mouseup', release);
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
        return (x >= count) ? (x - count) : (x < 0) ? x + count : x;
    }

    function display(i) {
        offset = 0;
        index = i;
        center.style[xform] = 'translate3d(0, 0, 0)';
        center.setAttribute('src', images[wrap(index)].getAttribute('src'));
        scroll(0);
        left.setAttribute('src', images[wrap(index - 1)].getAttribute('src'));
        right.setAttribute('src', images[wrap(index + 1)].getAttribute('src'));
    }

    function scroll(x) {
        var slow, fast;

        offset = x;
        slow = -Math.round(offset / 2);
        fast = -Math.round(offset);

        left.style[xform] = 'translate3d(' + (fast - snap) + 'px, 0, 0)';
        center.style[xform] = 'translate3d(' + slow + 'px, 0, 0)';
        right.style[xform] = 'translate3d(' + (fast + snap) + 'px, 0, 0)';
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
            if (delta > 10 || delta < -10) {
                scroll(target - delta);
                requestAnimationFrame(autoScroll);
            } else {
                display(wrap(index + target / snap));
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
            amplitude = 1.2 * velocity;
            target = offset + amplitude;
        }
        target = Math.round(target / snap) * snap;
        target = (target < -snap) ? -snap : (target > snap) ? snap : target;
        amplitude = target - offset;
        timestamp = Date.now();
        requestAnimationFrame(autoScroll);

        e.preventDefault();
        e.stopPropagation();
        return false;
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

    initialize();
    setupEvents();
    display(0);
};
