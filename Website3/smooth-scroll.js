/*! SmoothScroll v16.1.4 | (c) 2020 Chris Ferdinandi | MIT License | http://github.com/cferdinandi/smooth-scroll */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.SmoothScroll = factory());
}(this, (function () { 'use strict';

    var defaults = {
        ignore: '[data-scroll-ignore]',
        header: null,
        topOnEmptyHash: true,
        speed: 1000,
        speedAsDuration: false,
        durationMax: null,
        durationMin: null,
        clip: true,
        offset: 50,
        easing: 'linear', // Changed to linear
        customEasing: null,
        updateURL: true,
        popstate: true,
        emitEvents: true
    };

    var supports = function () {
        return (
            'querySelector' in document &&
            'addEventListener' in window &&
            'requestAnimationFrame' in window &&
            'closest' in window.Element.prototype
        );
    };

    var extend = function () {
        var merged = {};
        Array.prototype.forEach.call(arguments, function (obj) {
            for (var key in obj) {
                if (!obj.hasOwnProperty(key)) return;
                merged[key] = obj[key];
            }
        });
        return merged;
    };

    var getHeight = function (elem) {
        return parseInt(window.getComputedStyle(elem).height, 10);
    };

    var easingPattern = function (settings, time) {
        return time; // Linear easing
    };

    var getSpeed = function (distance, settings) {
        return settings.speed; // Fixed speed for consistency
    };

    var SmoothScroll = function (selector, options) {
        var smoothScroll = {};
        var settings, toggle, fixedHeader, animationInterval;

        smoothScroll.animateScroll = function (anchor, toggle, options) {
            smoothScroll.cancelScroll();

            var _settings = extend(settings || defaults, options || {});
            var isNum = Object.prototype.toString.call(anchor) === '[object Number]';
            var anchorElem = isNum || !anchor.tagName ? null : anchor;

            if (!isNum && !anchorElem) return;
            var startLocation = window.pageYOffset;
            if (_settings.header && !fixedHeader) {
                fixedHeader = document.querySelector(_settings.header);
            }
            var headerHeight = getHeaderHeight(fixedHeader);
            var endLocation = isNum ? anchor : getEndLocation(anchorElem, headerHeight, parseInt(_settings.offset, 10), _settings.clip);
            var distance = endLocation - startLocation;
            var timeLapsed = 0;
            var speed = getSpeed(distance, _settings);
            var start, percentage, position;

            var loopAnimateScroll = function (timestamp) {
                if (!start) { start = timestamp; }
                timeLapsed += timestamp - start;
                percentage = timeLapsed / speed;
                percentage = (percentage > 1) ? 1 : percentage;
                position = startLocation + (distance * easingPattern(_settings, percentage));
                window.scrollTo(0, Math.floor(position));
                if (percentage < 1) {
                    animationInterval = window.requestAnimationFrame(loopAnimateScroll);
                    start = timestamp;
                } else {
                    smoothScroll.cancelScroll(true);
                    adjustFocus(anchor, endLocation, isNum);
                    emitEvent('scrollStop', _settings, anchor, toggle);
                }
            };

            if (window.pageYOffset === 0) {
                window.scrollTo(0, 0);
            }

            updateURL(anchor, isNum, _settings);
            emitEvent('scrollStart', _settings, anchor, toggle);
            smoothScroll.cancelScroll(true);
            window.requestAnimationFrame(loopAnimateScroll);
        };

        var init = function () {
            if (!supports()) throw 'Smooth Scroll: This browser does not support the required JavaScript methods and browser APIs.';
            smoothScroll.destroy();
            settings = extend(defaults, options || {});
            fixedHeader = settings.header ? document.querySelector(settings.header) : null;
            document.addEventListener('click', clickHandler, false);
            if (settings.updateURL && settings.popstate) {
                window.addEventListener('popstate', popstateHandler, false);
            }
        };

        init();
        return smoothScroll;
    };

    return SmoothScroll;

})));
