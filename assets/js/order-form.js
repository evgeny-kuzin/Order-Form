/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues
 */
/* global window, document, define, jQuery, setInterval, clearInterval */
(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        factory(jQuery);
    }
}(function($) {
    'use strict';
    var Slick = window.Slick || {};
    Slick = (function() {
        var instanceUid = 0;
        function Slick(element, settings) {
            var _ = this,
                responsiveSettings, breakpoint;
            _.defaults = {
                accessibility: true,
                arrows: true,
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function(slider, i) {
                    return '<button type="button"><div class="slick-dots__number">' + (i + 1) + '<span>Step</span></div></button>';
                },
                dots: false,
                draggable: true,
                easing: 'linear',
                fade: false,
                infinite: true,
                lazyLoad: 'ondemand',
                onBeforeChange: null,
                onAfterChange: null,
                onInit: null,
                onReInit: null,
                pauseOnHover: true,
                responsive: null,
                slide: 'div',
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 300,
                swipe: true,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                vertical: false
            };
            _.initials = {
                animating: false,
                autoPlayTimer: null,
                currentSlide: 0,
                currentLeft: null,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                $list: null,
                touchObject: {},
                transformsEnabled: false
            };
            $.extend(_, _.initials);
            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.paused = false;
            _.positionProp = null;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.windowWidth = 0;
            _.windowTimer = null;
            _.options = $.extend({}, _.defaults, settings);
            _.originalSettings = _.options;
            responsiveSettings = _.options.responsive || null;
            if (responsiveSettings && responsiveSettings.length > -1) {
                for (breakpoint in responsiveSettings) {
                    if (responsiveSettings.hasOwnProperty(breakpoint)) {
                        _.breakpoints.push(responsiveSettings[
                            breakpoint].breakpoint);
                        _.breakpointSettings[responsiveSettings[
                            breakpoint].breakpoint] =
                            responsiveSettings[breakpoint].settings;
                    }
                }
                _.breakpoints.sort(function(a, b) {
                    return b - a;
                });
            }
            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
            _.instanceUid = instanceUid++;
            _.init();
        }
        return Slick;
    }());
    Slick.prototype.addSlide = function(markup, index, addBefore) {
        var _ = this;
        if (typeof(index) === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || (index >= _.slideCount)) {
            return false;
        }
        _.unload();
        if (typeof(index) === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }
        _.$slides = _.$slideTrack.children(this.options.slide);
        _.$slideTrack.children(this.options.slide).remove();
        _.$slideTrack.append(_.$slides);
        _.$slidesCache = _.$slides;
        _.reinit();
    };
    Slick.prototype.animateSlide = function(targetLeft,
                                            callback) {
        var animProps = {}, _ = this;
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }
        } else {
            if (_.cssTransitions === false) {
                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function(now) {
                        if (_.options.vertical === false) {
                            animProps[_.animType] = 'translate(' +
                                now + 'px, 0px)';
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = 'translate(0px,' +
                                now + 'px)';
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function() {
                        if (callback) {
                            callback.call();
                        }
                    }
                });
            } else {
                _.applyTransition();
                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);
                if (callback) {
                    setTimeout(function() {
                        _.disableTransition();
                        callback.call();
                    }, _.options.speed);
                }
            }
        }
    };
    Slick.prototype.applyTransition = function(slide) {
        var _ = this,
            transition = {};
        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }
        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }
    };
    Slick.prototype.autoPlay = function() {
        var _ = this;
        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }
        if (_.slideCount > _.options.slidesToShow && _.paused !== true) {
            _.autoPlayTimer = setInterval(_.autoPlayIterator,
                _.options.autoplaySpeed);
        }
    };
    Slick.prototype.autoPlayClear = function() {
        var _ = this;
        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }
    };
    Slick.prototype.autoPlayIterator = function() {
        var _ = this;
        if (_.options.infinite === false) {
            if (_.direction === 1) {
                if ((_.currentSlide + 1) === _.slideCount -
                    1) {
                    _.direction = 0;
                }
                _.slideHandler(_.currentSlide + _.options
                    .slidesToScroll);
            } else {
                if ((_.currentSlide - 1 === 0)) {
                    _.direction = 1;
                }
                _.slideHandler(_.currentSlide - _.options
                    .slidesToScroll);
            }
        } else {
            _.slideHandler(_.currentSlide + _.options.slidesToScroll);
        }
    };
    Slick.prototype.buildArrows = function() {
        var _ = this;
        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow = $(
                '<button type="button" class="slick-prev"><i class="wooicon-arrow-left10"></i></button>').appendTo(
                _.$slider);
            _.$nextArrow = $(
                '<button type="button" class="slick-next"><i class="wooicon-uniE626"></i></button>').appendTo(
                _.$slider);
            if (_.options.infinite !== true) {
                _.$prevArrow.addClass('slick-disabled');
            }
        }
    };
    Slick.prototype.buildDots = function() {
        var _ = this,
            i, dotString;
        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            dotString = '<ul class="slick-dots">';
            for (i = 0; i <= _.getDotCount(); i += 1) {
                dotString += '<li>' + _.options.customPaging.call(this, _, i) + '</li>';
            }
            dotString += '</ul>';
            _.$dots = $(dotString).appendTo(
                _.$slider);
            _.$dots.find('li').first().addClass(
                'slick-active');
        }
    };
    Slick.prototype.buildOut = function() {
        var _ = this;
        _.$slides = _.$slider.children(_.options.slide +
            ':not(.slick-cloned)').addClass(
            'slick-slide');
        _.slideCount = _.$slides.length;
        _.$slidesCache = _.$slides;
        _.$slider.addClass('slick-slider');
        _.$slideTrack = (_.slideCount === 0) ?
            $('<div class="slick-track"/>').appendTo(_.$slider) :
            _.$slides.wrapAll('<div class="slick-track"/>').parent();
        _.$list = _.$slideTrack.wrap(
            '<div class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);
        if (_.options.centerMode === true) {
            _.options.infinite = true;
            _.options.slidesToScroll = 1;
            if (_.options.slidesToShow % 2 === 0) {
                _.options.slidesToShow = 3;
            }
        }
        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');
        _.setupInfinite();
        _.buildArrows();
        _.buildDots();
        if (_.options.accessibility === true) {
            _.$list.prop('tabIndex', 0);
        }
        _.setSlideClasses(0);
        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }
    };
    Slick.prototype.checkResponsive = function() {
        var _ = this,
            breakpoint, targetBreakpoint;
        if (_.originalSettings.responsive && _.originalSettings
            .responsive.length > -1 && _.originalSettings.responsive !== null) {
            targetBreakpoint = null;
            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if ($(window).width() < _.breakpoints[
                        breakpoint]) {
                        targetBreakpoint = _.breakpoints[
                            breakpoint];
                    }
                }
            }
            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint) {
                        _.activeBreakpoint =
                            targetBreakpoint;
                        _.options = $.extend({}, _.defaults,
                            _.breakpointSettings[
                                targetBreakpoint]);
                        _.refresh();
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    _.options = $.extend({}, _.defaults,
                        _.breakpointSettings[
                            targetBreakpoint]);
                    _.refresh();
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = $.extend({}, _.defaults,
                        _.originalSettings);
                    _.refresh();
                }
            }
        }
    };
    Slick.prototype.changeSlide = function(event) {
        var _ = this;
        switch (event.data.message) {
            case 'previous':
                _.slideHandler(_.currentSlide - _.options
                    .slidesToScroll);
                break;
            case 'next':
                _.slideHandler(_.currentSlide + _.options
                    .slidesToScroll);
                break;
            case 'index':
                _.slideHandler($(event.target).parent().index() * _.options.slidesToScroll);
                break;
            default:
                return false;
        }
    };
    Slick.prototype.destroy = function() {
        var _ = this;
        _.autoPlayClear();
        _.touchObject = {};
        $('.slick-cloned', _.$slider).remove();
        if (_.$dots) {
            _.$dots.remove();
        }
        if (_.$prevArrow) {
            _.$prevArrow.remove();
            _.$nextArrow.remove();
        }
        _.$slides.unwrap().unwrap();
        _.$slides.removeClass(
            'slick-slide slick-active slick-visible').removeAttr('style');
        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');
        _.$list.off('.slick');
        $(window).off('.slick-' + _.instanceUid);
    };
    Slick.prototype.disableTransition = function(slide) {
        var _ = this,
            transition = {};
        transition[_.transitionType] = "";
        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }
    };
    Slick.prototype.fadeSlide = function(slideIndex, callback) {
        var _ = this;
        if (_.cssTransitions === false) {
            _.$slides.eq(slideIndex).css({
                zIndex: 1000
            });
            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);
        } else {
            _.applyTransition(slideIndex);
            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: 1000
            });
            if (callback) {
                setTimeout(function() {
                    _.disableTransition(slideIndex);
                    callback.call();
                }, _.options.speed);
            }
        }
    };
    Slick.prototype.filterSlides = function(filter) {
        var _ = this;
        if (filter !== null) {
            _.unload();
            _.$slideTrack.children(this.options.slide).remove();
            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);
            _.reinit();
        }
    };
    Slick.prototype.getCurrent = function() {
        var _ = this;
        return _.currentSlide;
    };
    Slick.prototype.getDotCount = function() {
        var _ = this,
            breaker = 0,
            dotCounter = 0,
            dotCount = 0,
            dotLimit;
        dotLimit = _.options.infinite === true ? _.slideCount + _.options.slidesToShow - _.options.slidesToScroll : _.slideCount;
        while (breaker < dotLimit) {
            dotCount++;
            dotCounter += _.options.slidesToScroll;
            breaker = dotCounter + _.options.slidesToShow;
        }
        return dotCount;
    };
    Slick.prototype.getLeft = function(slideIndex) {
        var _ = this,
            targetLeft,
            verticalHeight,
            verticalOffset = 0;
        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight();
        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;
                verticalOffset = (verticalHeight * _.options.slidesToShow) * -1;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    _.slideOffset = ((_.slideCount % _.options.slidesToShow) * _.slideWidth) * -1;
                    verticalOffset = ((_.slideCount % _.options.slidesToShow) * verticalHeight) * -1;
                }
            }
        } else {
            if (_.slideCount % _.options.slidesToShow !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    _.slideOffset = (_.options.slidesToShow * _.slideWidth) - ((_.slideCount % _.options.slidesToShow) * _.slideWidth);
                    verticalOffset = ((_.slideCount % _.options.slidesToShow) * verticalHeight);
                }
            }
        }
        if (_.options.centerMode === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        }
        if (_.options.vertical === false) {
            targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;
        } else {
            targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;
        }
        return targetLeft;
    };
    Slick.prototype.init = function() {
        var _ = this;
        if (!$(_.$slider).hasClass('slick-initialized')) {
            $(_.$slider).addClass('slick-initialized');
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.checkResponsive();
        }
        if (_.options.onInit !== null) {
            _.options.onInit.call(this, _);
        }
    };
    Slick.prototype.initArrowEvents = function() {
        var _ = this;
        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.on('click.slick', {
                message: 'previous'
            }, _.changeSlide);
            _.$nextArrow.on('click.slick', {
                message: 'next'
            }, _.changeSlide);
        }
    };
    Slick.prototype.initDotEvents = function() {
        var _ = this;
        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index'
            }, _.changeSlide);
        }
    };
    Slick.prototype.initializeEvents = function() {
        var _ = this;
        _.initArrowEvents();
        _.initDotEvents();
        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start'
        }, _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move'
        }, _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end'
        }, _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end'
        }, _.swipeHandler);
        if (_.options.pauseOnHover === true && _.options.autoplay === true) {
            _.$list.on('mouseenter.slick', _.autoPlayClear);
            _.$list.on('mouseleave.slick', _.autoPlay);
        }
        if(_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler);
        }
        $(window).on('orientationchange.slick.slick-' + _.instanceUid, function() {
            _.checkResponsive();
            _.setPosition();
        });
        $(window).on('resize.slick.slick-' + _.instanceUid, function() {
            if ($(window).width !== _.windowWidth) {
                clearTimeout(_.windowDelay);
                _.windowDelay = window.setTimeout(function() {
                    _.windowWidth = $(window).width();
                    _.checkResponsive();
                    _.setPosition();
                }, 50);
            }
        });
        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
    };
    Slick.prototype.initUI = function() {
        var _ = this;
        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.show();
            _.$nextArrow.show();
        }
        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            _.$dots.show();
        }
        if (_.options.autoplay === true) {
            _.autoPlay();
        }
    };
    Slick.prototype.keyHandler = function(event) {
        var _ = this;
        if (event.keyCode === 37) {
            _.changeSlide({
                data: {
                    message: 'previous'
                }
            });
        } else if (event.keyCode === 39) {
            _.changeSlide({
                data: {
                    message: 'next'
                }
            });
        }
    };
    Slick.prototype.lazyLoad = function() {
        var _ = this,
            loadRange, cloneRange, rangeStart, rangeEnd;
        if (_.options.centerMode === true) {
            rangeStart = _.options.slidesToShow + _.currentSlide - 1;
            rangeEnd = rangeStart + _.options.slidesToShow + 2;
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = rangeStart + _.options.slidesToShow;
        }
        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);
        $('img[data-lazy]', loadRange).not('[src]').each(function() {
            $(this).css({opacity: 0}).attr('src', $(this).attr('data-lazy')).removeClass('slick-loading').load(function(){
                $(this).animate({ opacity: 1 }, 200);
            });
        });
        if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
            $('img[data-lazy]', cloneRange).not('[src]').each(function() {
                $(this).css({opacity: 0}).attr('src', $(this).attr('data-lazy')).removeClass('slick-loading').load(function(){
                    $(this).animate({ opacity: 1 }, 200);
                });
            });
        } else if (_.currentSlide === 0) {
            cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
            $('img[data-lazy]', cloneRange).not('[src]').each(function() {
                $(this).css({opacity: 0}).attr('src', $(this).attr('data-lazy')).removeClass('slick-loading').load(function(){
                    $(this).animate({ opacity: 1 }, 200);
                });
            });
        }
    };
    Slick.prototype.loadSlider = function() {
        var _ = this;
        _.setPosition();
        _.$slideTrack.css({
            opacity: 1
        });
        _.$slider.removeClass('slick-loading');
        _.initUI();
        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }
    };
    Slick.prototype.postSlide = function(index) {
        var _ = this;
        if (_.options.onAfterChange !== null) {
            _.options.onAfterChange.call(this, _, index);
        }
        _.animating = false;
        _.setPosition();
        _.swipeLeft = null;
        if (_.options.autoplay === true && _.paused === false) {
            _.autoPlay();
        }
    };
    Slick.prototype.progressiveLazyLoad = function() {
        var _ = this,
            imgCount, targetImage;
        imgCount = $('img[data-lazy]').not('[src]').length;
        if (imgCount > 0) {
            targetImage = $($('img[data-lazy]', _.$slider).not('[src]').get(0));
            targetImage.attr('src', targetImage.attr('data-lazy')).removeClass('slick-loading').load(function() {
                _.progressiveLazyLoad();
            });
        }
    };
    Slick.prototype.refresh = function() {
        var _ = this;
        _.destroy();
        $.extend(_, _.initials);
        _.init();
    };
    Slick.prototype.reinit = function() {
        var _ = this;
        _.$slides = _.$slideTrack.children(_.options.slide).addClass(
            'slick-slide');
        _.slideCount = _.$slides.length;
        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }
        _.setProps();
        _.setupInfinite();
        _.buildArrows();
        _.updateArrows();
        _.initArrowEvents();
        _.buildDots();
        _.updateDots();
        _.initDotEvents();
        _.setSlideClasses(0);
        _.setPosition();
        if (_.options.onReInit !== null) {
            _.options.onReInit.call(this, _);
        }
    };
    Slick.prototype.removeSlide = function(index, removeBefore) {
        var _ = this;
        if (typeof(index) === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }
        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }
        _.unload();
        _.$slideTrack.children(this.options.slide).eq(index).remove();
        _.$slides = _.$slideTrack.children(this.options.slide);
        _.$slideTrack.children(this.options.slide).remove();
        _.$slideTrack.append(_.$slides);
        _.$slidesCache = _.$slides;
        _.reinit();
    };
    Slick.prototype.setCSS = function(position) {
        var _ = this,
            positionProps = {}, x, y;
        x = _.positionProp == 'left' ? position + 'px' : '0px';
        y = _.positionProp == 'top' ? position + 'px' : '0px';
        positionProps[_.positionProp] = position;
        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }
    };
    Slick.prototype.setDimensions = function() {
        var _ = this;
        if (_.options.centerMode === true) {
            _.$slideTrack.children('.slick-slide').width(_.slideWidth);
        } else {
            _.$slideTrack.children('.slick-slide').width(_.slideWidth);
        }
        if (_.options.vertical === false) {
            _.$slideTrack.width(Math.ceil((_.slideWidth * _
                .$slideTrack.children('.slick-slide').length)));
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: ('0px ' + _.options.centerPadding)
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight() * _.options.slidesToShow);
            _.$slideTrack.height(Math.ceil((_.$slides.first().outerHeight() * _
                .$slideTrack.children('.slick-slide').length)));
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: (_.options.centerPadding + ' 0px')
                });
            }
        }
    };
    Slick.prototype.setFade = function() {
        var _ = this,
            targetLeft;
        _.$slides.each(function(index, element) {
            targetLeft = (_.slideWidth * index) * -1;
            $(element).css({
                position: 'relative',
                left: targetLeft,
                top: 0,
                zIndex: 800,
                opacity: 0
            });
        });
        _.$slides.eq(_.currentSlide).css({
            zIndex: 900,
            opacity: 1
        });
    };
    Slick.prototype.setPosition = function() {
        var _ = this;
        _.setValues();
        _.setDimensions();
        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }
    };
    Slick.prototype.setProps = function() {
        var _ = this;
        _.positionProp = _.options.vertical === true ? 'top' : 'left';
        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }
        if (document.body.style.WebkitTransition !== undefined ||
            document.body.style.MozTransition !== undefined ||
            document.body.style.msTransition !== undefined) {
            if(_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }
        if (document.body.style.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = "-moz-transform";
            _.transitionType = 'MozTransition';
        }
        if (document.body.style.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = "-webkit-transform";
            _.transitionType = 'webkitTransition';
        }
        if (document.body.style.msTransform !== undefined) {
            _.animType = 'transform';
            _.transformType = "transform";
            _.transitionType = 'transition';
        }
        _.transformsEnabled = (_.animType !== null);
    };
    Slick.prototype.setValues = function() {
        var _ = this;
        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();
        if(_.options.vertical === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options
                .slidesToShow);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
        }
    };
    Slick.prototype.setSlideClasses = function(index) {
        var _ = this,
            centerOffset, allSlides, indexOffset;
        var animate = _.$slider.find('.slick-slide').data('animation');
        _.$slider.find('.slick-slide').removeClass(animate);
        _.$slider.find('.slick-slide').removeClass('slick-active').removeClass('slick-center');
        allSlides = _.$slider.find('.slick-slide');
        if (_.options.centerMode === true) {
            centerOffset = Math.floor(_.options.slidesToShow / 2);
            if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {
                _.$slides.slice(index - centerOffset, index + centerOffset + 1).addClass('slick-active');
            } else {
                indexOffset = _.options.slidesToShow + index;
                allSlides.slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2).addClass('slick-active');
            }
            if (index === 0) {
                allSlides.eq(allSlides.length - 1 - _.options.slidesToShow).addClass('slick-center');
            } else if (index === _.slideCount - 1) {
                allSlides.eq(_.options.slidesToShow).addClass('slick-center');
            }
            _.$slides.eq(index).addClass('slick-center');
        } else {
            if (index > 0 && index < (_.slideCount - _.options.slidesToShow)) {
                _.$slides.slice(index, index + _.options.slidesToShow).addClass('slick-active');
                var animate = _.$slides.slice(index, index + _.options.slidesToShow).data('animation');
                _.$slides.slice(index, index + _.options.slidesToShow).addClass(animate);
            } else {
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;
                allSlides.slice(indexOffset, indexOffset + _.options.slidesToShow).addClass('slick-active');
                var animate = allSlides.slice(indexOffset, indexOffset + _.options.slidesToShow).data('animation');
                allSlides.slice(indexOffset, indexOffset + _.options.slidesToShow).addClass(animate);
            }
        }
        if (_.options.lazyLoad === 'ondemand') {
            _.lazyLoad();
        }
    };
    Slick.prototype.setupInfinite = function() {
        var _ = this,
            i, slideIndex, infiniteCount;
        if (_.options.fade === true || _.options.vertical === true) {
            _.options.centerMode = false;
        }
        if (_.options.infinite === true && _.options.fade === false) {
            slideIndex = null;
            if (_.slideCount > _.options.slidesToShow) {
                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }
                for (i = _.slideCount; i > (_.slideCount -
                    infiniteCount); i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone().attr('id', '').prependTo(
                        _.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone().attr('id', '').appendTo(
                        _.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function() {
                    $(this).attr('id', '');
                });
            }
        }
    };
    Slick.prototype.slideHandler = function(index) {
        var targetSlide, animSlide, slideLeft, unevenOffset, targetLeft = null,
            _ = this;
        if (_.animating === true) {
            return false;
        }
        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);
        unevenOffset = _.slideCount % _.options.slidesToScroll !== 0 ? _.options.slidesToScroll : 0;
        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;
        if (_.options.infinite === false && (index < 0 || index > (_.slideCount - _.options.slidesToShow + unevenOffset))) {
            targetSlide = _.currentSlide;
            _.animateSlide(slideLeft, function() {
                _.postSlide(targetSlide);
            });
            return false;
        }
        if (_.options.autoplay === true) {
            clearInterval(_.autoPlayTimer);
        }
        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);
            } else {
                animSlide = _.slideCount - _.options.slidesToScroll;
            }
        } else if (targetSlide > (_.slideCount - 1)) {
            animSlide = 0;
        } else {
            animSlide = targetSlide;
        }
        _.animating = true;
        if (_.options.onBeforeChange !== null && index !== _.currentSlide) {
            _.options.onBeforeChange.call(this, _, _.currentSlide, animSlide);
        }
        _.currentSlide = animSlide;
        _.setSlideClasses(_.currentSlide);
        _.updateDots();
        _.updateArrows();
        if (_.options.fade === true) {
            _.fadeSlide(animSlide, function() {
                _.postSlide(animSlide);
            });
            return false;
        }
        _.animateSlide(targetLeft, function() {
            _.postSlide(animSlide);
        });
    };
    Slick.prototype.startLoad = function() {
        var _ = this;
        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.hide();
            _.$nextArrow.hide();
        }
        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            _.$dots.hide();
        }
        _.$slider.addClass('slick-loading');
    };
    Slick.prototype.swipeDirection = function() {
        var xDist, yDist, r, swipeAngle, _ = this;
        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);
        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }
        if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
            return 'left';
        }
        if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
            return 'left';
        }
        if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
            return 'right';
        }
        return 'vertical';
    };
    Slick.prototype.swipeEnd = function(event) {
        var _ = this;
        _.$list.removeClass('dragging');
        if (_.touchObject.curX === undefined) {
            return false;
        }
        if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {
            $(event.target).on('click.slick', function(event) {
                event.stopImmediatePropagation();
                event.stopPropagation();
                event.preventDefault();
                $(event.target).off('click.slick');
            });
            switch (_.swipeDirection()) {
                case 'left':
                    _.slideHandler(_.currentSlide + _.options.slidesToScroll);
                    _.touchObject = {};
                    break;
                case 'right':
                    _.slideHandler(_.currentSlide - _.options.slidesToScroll);
                    _.touchObject = {};
                    break;
            }
        } else {
            if(_.touchObject.startX !== _.touchObject.curX) {
                _.slideHandler(_.currentSlide);
                _.touchObject = {};
            }
        }
    };
    Slick.prototype.swipeHandler = function(event) {
        var _ = this;
        if ('ontouchend' in document && _.options.swipe === false) {
            return false;
        } else if (_.options.draggable === false && !event.originalEvent.touches) {
            return false;
        }
        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
            event.originalEvent.touches.length : 1;
        _.touchObject.minSwipe = _.listWidth / _.options
            .touchThreshold;
        switch (event.data.action) {
            case 'start':
                _.swipeStart(event);
                break;
            case 'move':
                _.swipeMove(event);
                break;
            case 'end':
                _.swipeEnd(event);
                break;
        }
    };
    Slick.prototype.swipeMove = function(event) {
        var _ = this,
            curLeft, swipeDirection, positionOffset, touches;
        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;
        curLeft = _.getLeft(_.currentSlide);
        if (!_.$list.hasClass('dragging') || touches && touches.length !== 1) {
            return false;
        }
        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;
        _.touchObject.swipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));
        swipeDirection = _.swipeDirection();
        if (swipeDirection === 'vertical') {
            return;
        }
        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            event.preventDefault();
        }
        positionOffset = _.touchObject.curX > _.touchObject.startX ? 1 : -1;
        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + _.touchObject.swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + (_.touchObject
                .swipeLength * (_.$list.height() / _.listWidth)) * positionOffset;
        }
        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }
        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }
        _.setCSS(_.swipeLeft);
    };
    Slick.prototype.swipeStart = function(event) {
        var _ = this,
            touches;
        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }
        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }
        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;
        _.$list.addClass('dragging');
    };
    Slick.prototype.unfilterSlides = function() {
        var _ = this;
        if (_.$slidesCache !== null) {
            _.unload();
            _.$slideTrack.children(this.options.slide).remove();
            _.$slidesCache.appendTo(_.$slideTrack);
            _.reinit();
        }
    };
    Slick.prototype.unload = function() {
        var _ = this;
        $('.slick-cloned', _.$slider).remove();
        if (_.$dots) {
            _.$dots.remove();
        }
        if (_.$prevArrow) {
            _.$prevArrow.remove();
            _.$nextArrow.remove();
        }
        _.$slides.removeClass(
            'slick-slide slick-active slick-visible').removeAttr('style');
    };
    Slick.prototype.updateArrows = function() {
        var _ = this;
        if (_.options.arrows === true && _.options.infinite !==
            true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.removeClass('slick-disabled');
            _.$nextArrow.removeClass('slick-disabled');
            if (_.currentSlide === 0) {
                _.$prevArrow.addClass('slick-disabled');
                _.$nextArrow.removeClass('slick-disabled');
            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
                _.$nextArrow.addClass('slick-disabled');
                _.$prevArrow.removeClass('slick-disabled');
            }
        }
    };
    Slick.prototype.updateDots = function() {
        var _ = this;
        if (_.$dots !== null) {
            _.$dots.find('li').removeClass('slick-active');
            _.$dots.find('li').eq(_.currentSlide / _.options.slidesToScroll).addClass(
                'slick-active');
        }
    };
    $.fn.slick = function(options) {
        var _ = this;
        return _.each(function(index, element) {
            element.slick = new Slick(element, options);
        });
    };
    $.fn.slickAdd = function(slide, slideIndex, addBefore) {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.addSlide(slide, slideIndex, addBefore);
        });
    };
    $.fn.slickCurrentSlide = function() {
        var _ = this;
        return _.get(0).slick.getCurrent();
    };
    $.fn.slickFilter = function(filter) {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.filterSlides(filter);
        });
    };
    $.fn.slickGoTo = function(slide) {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.slideHandler(slide);
        });
    };
    $.fn.slickNext = function() {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.changeSlide({
                data: {
                    message: 'next'
                }
            });
        });
    };
    $.fn.slickPause = function() {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.autoPlayClear();
            element.slick.paused = true;
        });
    };
    $.fn.slickPlay = function() {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.paused = false;
            element.slick.autoPlay();
        });
    };
    $.fn.slickPrev = function() {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.changeSlide({
                data: {
                    message: 'previous'
                }
            });
        });
    };
    $.fn.slickRemove = function(slideIndex, removeBefore) {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.removeSlide(slideIndex, removeBefore);
        });
    };
    $.fn.slickSetOption = function(option, value, refresh) {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.options[option] = value;
            if (refresh === true) {
                element.slick.unload();
                element.slick.reinit();
            }
        });
    };
    $.fn.slickUnfilter = function() {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.unfilterSlides();
        });
    };
    $.fn.unslick = function() {
        var _ = this;
        return _.each(function(index, element) {
            element.slick.destroy();
        });
    };
}));

var DateFormatter;!function(){"use strict";var e,t,a,n,r,o,i;o=864e5,i=3600,e=function(e,t){return"string"==typeof e&&"string"==typeof t&&e.toLowerCase()===t.toLowerCase()},t=function(e,a,n){var r=n||"0",o=e.toString();return o.length<a?t(r+o,a):o},a=function(e){var t,n;for(e=e||{},t=1;t<arguments.length;t++)if(n=arguments[t])for(var r in n)n.hasOwnProperty(r)&&("object"==typeof n[r]?a(e[r],n[r]):e[r]=n[r]);return e},n=function(e,t){for(var a=0;a<t.length;a++)if(t[a].toLowerCase()===e.toLowerCase())return a;return-1},r={dateSettings:{days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],daysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],monthsShort:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],meridiem:["AM","PM"],ordinal:function(e){var t=e%10,a={1:"st",2:"nd",3:"rd"};return 1!==Math.floor(e%100/10)&&a[t]?a[t]:"th"}},separators:/[ \-+\/\.T:@]/g,validParts:/[dDjlNSwzWFmMntLoYyaABgGhHisueTIOPZcrU]/g,intParts:/[djwNzmnyYhHgGis]/g,tzParts:/\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,tzClip:/[^-+\dA-Z]/g},(DateFormatter=function(e){var t=this,n=a(r,e);t.dateSettings=n.dateSettings,t.separators=n.separators,t.validParts=n.validParts,t.intParts=n.intParts,t.tzParts=n.tzParts,t.tzClip=n.tzClip}).prototype={constructor:DateFormatter,getMonth:function(e){var t,a=this;return 0===(t=n(e,a.dateSettings.monthsShort)+1)&&(t=n(e,a.dateSettings.months)+1),t},parseDate:function(t,a){var n,r,o,i,s,d,u,l,f,c,m=this,h=!1,g=!1,p=m.dateSettings,y={date:null,year:null,month:null,day:null,hour:0,min:0,sec:0};if(!t)return null;if(t instanceof Date)return t;if("U"===a)return(o=parseInt(t))?new Date(1e3*o):t;switch(typeof t){case"number":return new Date(t);case"string":break;default:return null}if(!(n=a.match(m.validParts))||0===n.length)throw new Error("Invalid date format definition.");for(r=t.replace(m.separators,"\0").split("\0"),o=0;o<r.length;o++)switch(i=r[o],s=parseInt(i),n[o]){case"y":case"Y":if(!s)return null;f=i.length,y.year=2===f?parseInt((70>s?"20":"19")+i):s,h=!0;break;case"m":case"n":case"M":case"F":if(isNaN(s)){if(!((d=m.getMonth(i))>0))return null;y.month=d}else{if(!(s>=1&&12>=s))return null;y.month=s}h=!0;break;case"d":case"j":if(!(s>=1&&31>=s))return null;y.day=s,h=!0;break;case"g":case"h":if(u=n.indexOf("a")>-1?n.indexOf("a"):n.indexOf("A")>-1?n.indexOf("A"):-1,c=r[u],u>-1)l=e(c,p.meridiem[0])?0:e(c,p.meridiem[1])?12:-1,s>=1&&12>=s&&l>-1?y.hour=s+l-1:s>=0&&23>=s&&(y.hour=s);else{if(!(s>=0&&23>=s))return null;y.hour=s}g=!0;break;case"G":case"H":if(!(s>=0&&23>=s))return null;y.hour=s,g=!0;break;case"i":if(!(s>=0&&59>=s))return null;y.min=s,g=!0;break;case"s":if(!(s>=0&&59>=s))return null;y.sec=s,g=!0}if(!0===h&&y.year&&y.month&&y.day)y.date=new Date(y.year,y.month-1,y.day,y.hour,y.min,y.sec,0);else{if(!0!==g)return null;y.date=new Date(0,0,0,y.hour,y.min,y.sec,0)}return y.date},guessDate:function(e,t){if("string"!=typeof e)return e;var a,n,r,o,i,s,d=this,u=e.replace(d.separators,"\0").split("\0"),l=/^[djmn]/g,f=t.match(d.validParts),c=new Date,m=0;if(!l.test(f[0]))return e;for(r=0;r<u.length;r++){if(m=2,i=u[r],s=parseInt(i.substr(0,2)),isNaN(s))return null;switch(r){case 0:"m"===f[0]||"n"===f[0]?c.setMonth(s-1):c.setDate(s);break;case 1:"m"===f[0]||"n"===f[0]?c.setDate(s):c.setMonth(s-1);break;case 2:if(n=c.getFullYear(),a=i.length,m=4>a?a:4,!(n=parseInt(4>a?n.toString().substr(0,4-a)+i:i.substr(0,4))))return null;c.setFullYear(n);break;case 3:c.setHours(s);break;case 4:c.setMinutes(s);break;case 5:c.setSeconds(s)}(o=i.substr(m)).length>0&&u.splice(r+1,0,o)}return c},parseFormat:function(e,a){var n,r=this,s=r.dateSettings,d=/\\?(.?)/gi,u=function(e,t){return n[e]?n[e]():t};return n={d:function(){return t(n.j(),2)},D:function(){return s.daysShort[n.w()]},j:function(){return a.getDate()},l:function(){return s.days[n.w()]},N:function(){return n.w()||7},w:function(){return a.getDay()},z:function(){var e=new Date(n.Y(),n.n()-1,n.j()),t=new Date(n.Y(),0,1);return Math.round((e-t)/o)},W:function(){var e=new Date(n.Y(),n.n()-1,n.j()-n.N()+3),a=new Date(e.getFullYear(),0,4);return t(1+Math.round((e-a)/o/7),2)},F:function(){return s.months[a.getMonth()]},m:function(){return t(n.n(),2)},M:function(){return s.monthsShort[a.getMonth()]},n:function(){return a.getMonth()+1},t:function(){return new Date(n.Y(),n.n(),0).getDate()},L:function(){var e=n.Y();return e%4==0&&e%100!=0||e%400==0?1:0},o:function(){var e=n.n(),t=n.W();return n.Y()+(12===e&&9>t?1:1===e&&t>9?-1:0)},Y:function(){return a.getFullYear()},y:function(){return n.Y().toString().slice(-2)},a:function(){return n.A().toLowerCase()},A:function(){var e=n.G()<12?0:1;return s.meridiem[e]},B:function(){var e=a.getUTCHours()*i,n=60*a.getUTCMinutes(),r=a.getUTCSeconds();return t(Math.floor((e+n+r+i)/86.4)%1e3,3)},g:function(){return n.G()%12||12},G:function(){return a.getHours()},h:function(){return t(n.g(),2)},H:function(){return t(n.G(),2)},i:function(){return t(a.getMinutes(),2)},s:function(){return t(a.getSeconds(),2)},u:function(){return t(1e3*a.getMilliseconds(),6)},e:function(){return/\((.*)\)/.exec(String(a))[1]||"Coordinated Universal Time"},I:function(){return new Date(n.Y(),0)-Date.UTC(n.Y(),0)!=new Date(n.Y(),6)-Date.UTC(n.Y(),6)?1:0},O:function(){var e=a.getTimezoneOffset(),n=Math.abs(e);return(e>0?"-":"+")+t(100*Math.floor(n/60)+n%60,4)},P:function(){var e=n.O();return e.substr(0,3)+":"+e.substr(3,2)},T:function(){return(String(a).match(r.tzParts)||[""]).pop().replace(r.tzClip,"")||"UTC"},Z:function(){return 60*-a.getTimezoneOffset()},c:function(){return"Y-m-d\\TH:i:sP".replace(d,u)},r:function(){return"D, d M Y H:i:s O".replace(d,u)},U:function(){return a.getTime()/1e3||0}},u(e,e)},formatDate:function(e,t){var a,n,r,o,i,s=this,d="";if("string"==typeof e&&!(e=s.parseDate(e,t)))return null;if(e instanceof Date){for(r=t.length,a=0;r>a;a++)"S"!==(i=t.charAt(a))&&"\\"!==i&&(a>0&&"\\"===t.charAt(a-1)?d+=i:(o=s.parseFormat(i,e),a!==r-1&&s.intParts.test(i)&&"S"===t.charAt(a+1)&&(n=parseInt(o)||0,o+=s.dateSettings.ordinal(n)),d+=o));return d}return""}}}();var datetimepickerFactory=function(e){"use strict";function t(e,t,a){this.date=e,this.desc=t,this.style=a}var a={i18n:{ar:{months:["كانون الثاني","شباط","آذار","نيسان","مايو","حزيران","تموز","آب","أيلول","تشرين الأول","تشرين الثاني","كانون الأول"],dayOfWeekShort:["ن","ث","ع","خ","ج","س","ح"],dayOfWeek:["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت","الأحد"]},ro:{months:["Ianuarie","Februarie","Martie","Aprilie","Mai","Iunie","Iulie","August","Septembrie","Octombrie","Noiembrie","Decembrie"],dayOfWeekShort:["Du","Lu","Ma","Mi","Jo","Vi","Sâ"],dayOfWeek:["Duminică","Luni","Marţi","Miercuri","Joi","Vineri","Sâmbătă"]},id:{months:["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"],dayOfWeekShort:["Min","Sen","Sel","Rab","Kam","Jum","Sab"],dayOfWeek:["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"]},is:{months:["Janúar","Febrúar","Mars","Apríl","Maí","Júní","Júlí","Ágúst","September","Október","Nóvember","Desember"],dayOfWeekShort:["Sun","Mán","Þrið","Mið","Fim","Fös","Lau"],dayOfWeek:["Sunnudagur","Mánudagur","Þriðjudagur","Miðvikudagur","Fimmtudagur","Föstudagur","Laugardagur"]},bg:{months:["Януари","Февруари","Март","Април","Май","Юни","Юли","Август","Септември","Октомври","Ноември","Декември"],dayOfWeekShort:["Нд","Пн","Вт","Ср","Чт","Пт","Сб"],dayOfWeek:["Неделя","Понеделник","Вторник","Сряда","Четвъртък","Петък","Събота"]},fa:{months:["فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور","مهر","آبان","آذر","دی","بهمن","اسفند"],dayOfWeekShort:["یکشنبه","دوشنبه","سه شنبه","چهارشنبه","پنجشنبه","جمعه","شنبه"],dayOfWeek:["یک‌شنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنج‌شنبه","جمعه","شنبه","یک‌شنبه"]},ru:{months:["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],dayOfWeekShort:["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],dayOfWeek:["Воскресенье","Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"]},uk:{months:["Січень","Лютий","Березень","Квітень","Травень","Червень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"],dayOfWeekShort:["Ндл","Пнд","Втр","Срд","Чтв","Птн","Сбт"],dayOfWeek:["Неділя","Понеділок","Вівторок","Середа","Четвер","П'ятниця","Субота"]},en:{months:["January","February","March","April","May","June","July","August","September","October","November","December"],dayOfWeekShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dayOfWeek:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]},el:{months:["Ιανουάριος","Φεβρουάριος","Μάρτιος","Απρίλιος","Μάιος","Ιούνιος","Ιούλιος","Αύγουστος","Σεπτέμβριος","Οκτώβριος","Νοέμβριος","Δεκέμβριος"],dayOfWeekShort:["Κυρ","Δευ","Τρι","Τετ","Πεμ","Παρ","Σαβ"],dayOfWeek:["Κυριακή","Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο"]},de:{months:["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],dayOfWeekShort:["So","Mo","Di","Mi","Do","Fr","Sa"],dayOfWeek:["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"]},nl:{months:["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"],dayOfWeekShort:["zo","ma","di","wo","do","vr","za"],dayOfWeek:["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"]},tr:{months:["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"],dayOfWeekShort:["Paz","Pts","Sal","Çar","Per","Cum","Cts"],dayOfWeek:["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"]},fr:{months:["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],dayOfWeekShort:["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"],dayOfWeek:["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"]},es:{months:["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],dayOfWeekShort:["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"],dayOfWeek:["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"]},th:{months:["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"],dayOfWeekShort:["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."],dayOfWeek:["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์","อาทิตย์"]},pl:{months:["styczeń","luty","marzec","kwiecień","maj","czerwiec","lipiec","sierpień","wrzesień","październik","listopad","grudzień"],dayOfWeekShort:["nd","pn","wt","śr","cz","pt","sb"],dayOfWeek:["niedziela","poniedziałek","wtorek","środa","czwartek","piątek","sobota"]},pt:{months:["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],dayOfWeekShort:["Dom","Seg","Ter","Qua","Qui","Sex","Sab"],dayOfWeek:["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"]},ch:{months:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],dayOfWeekShort:["日","一","二","三","四","五","六"]},se:{months:["Januari","Februari","Mars","April","Maj","Juni","Juli","Augusti","September","Oktober","November","December"],dayOfWeekShort:["Sön","Mån","Tis","Ons","Tor","Fre","Lör"]},km:{months:["មករា​","កុម្ភៈ","មិនា​","មេសា​","ឧសភា​","មិថុនា​","កក្កដា​","សីហា​","កញ្ញា​","តុលា​","វិច្ឆិកា","ធ្នូ​"],dayOfWeekShort:["អាទិ​","ច័ន្ទ​","អង្គារ​","ពុធ​","ព្រហ​​","សុក្រ​","សៅរ៍"],dayOfWeek:["អាទិត្យ​","ច័ន្ទ​","អង្គារ​","ពុធ​","ព្រហស្បតិ៍​","សុក្រ​","សៅរ៍"]},kr:{months:["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],dayOfWeekShort:["일","월","화","수","목","금","토"],dayOfWeek:["일요일","월요일","화요일","수요일","목요일","금요일","토요일"]},it:{months:["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"],dayOfWeekShort:["Dom","Lun","Mar","Mer","Gio","Ven","Sab"],dayOfWeek:["Domenica","Lunedì","Martedì","Mercoledì","Giovedì","Venerdì","Sabato"]},da:{months:["Januar","Februar","Marts","April","Maj","Juni","Juli","August","September","Oktober","November","December"],dayOfWeekShort:["Søn","Man","Tir","Ons","Tor","Fre","Lør"],dayOfWeek:["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"]},no:{months:["Januar","Februar","Mars","April","Mai","Juni","Juli","August","September","Oktober","November","Desember"],dayOfWeekShort:["Søn","Man","Tir","Ons","Tor","Fre","Lør"],dayOfWeek:["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"]},ja:{months:["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"],dayOfWeekShort:["日","月","火","水","木","金","土"],dayOfWeek:["日曜","月曜","火曜","水曜","木曜","金曜","土曜"]},vi:{months:["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"],dayOfWeekShort:["CN","T2","T3","T4","T5","T6","T7"],dayOfWeek:["Chủ nhật","Thứ hai","Thứ ba","Thứ tư","Thứ năm","Thứ sáu","Thứ bảy"]},sl:{months:["Januar","Februar","Marec","April","Maj","Junij","Julij","Avgust","September","Oktober","November","December"],dayOfWeekShort:["Ned","Pon","Tor","Sre","Čet","Pet","Sob"],dayOfWeek:["Nedelja","Ponedeljek","Torek","Sreda","Četrtek","Petek","Sobota"]},cs:{months:["Leden","Únor","Březen","Duben","Květen","Červen","Červenec","Srpen","Září","Říjen","Listopad","Prosinec"],dayOfWeekShort:["Ne","Po","Út","St","Čt","Pá","So"]},hu:{months:["Január","Február","Március","Április","Május","Június","Július","Augusztus","Szeptember","Október","November","December"],dayOfWeekShort:["Va","Hé","Ke","Sze","Cs","Pé","Szo"],dayOfWeek:["vasárnap","hétfő","kedd","szerda","csütörtök","péntek","szombat"]},az:{months:["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avqust","Sentyabr","Oktyabr","Noyabr","Dekabr"],dayOfWeekShort:["B","Be","Ça","Ç","Ca","C","Ş"],dayOfWeek:["Bazar","Bazar ertəsi","Çərşənbə axşamı","Çərşənbə","Cümə axşamı","Cümə","Şənbə"]},bs:{months:["Januar","Februar","Mart","April","Maj","Jun","Jul","Avgust","Septembar","Oktobar","Novembar","Decembar"],dayOfWeekShort:["Ned","Pon","Uto","Sri","Čet","Pet","Sub"],dayOfWeek:["Nedjelja","Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak","Subota"]},ca:{months:["Gener","Febrer","Març","Abril","Maig","Juny","Juliol","Agost","Setembre","Octubre","Novembre","Desembre"],dayOfWeekShort:["Dg","Dl","Dt","Dc","Dj","Dv","Ds"],dayOfWeek:["Diumenge","Dilluns","Dimarts","Dimecres","Dijous","Divendres","Dissabte"]},"en-GB":{months:["January","February","March","April","May","June","July","August","September","October","November","December"],dayOfWeekShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dayOfWeek:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]},et:{months:["Jaanuar","Veebruar","Märts","Aprill","Mai","Juuni","Juuli","August","September","Oktoober","November","Detsember"],dayOfWeekShort:["P","E","T","K","N","R","L"],dayOfWeek:["Pühapäev","Esmaspäev","Teisipäev","Kolmapäev","Neljapäev","Reede","Laupäev"]},eu:{months:["Urtarrila","Otsaila","Martxoa","Apirila","Maiatza","Ekaina","Uztaila","Abuztua","Iraila","Urria","Azaroa","Abendua"],dayOfWeekShort:["Ig.","Al.","Ar.","Az.","Og.","Or.","La."],dayOfWeek:["Igandea","Astelehena","Asteartea","Asteazkena","Osteguna","Ostirala","Larunbata"]},fi:{months:["Tammikuu","Helmikuu","Maaliskuu","Huhtikuu","Toukokuu","Kesäkuu","Heinäkuu","Elokuu","Syyskuu","Lokakuu","Marraskuu","Joulukuu"],dayOfWeekShort:["Su","Ma","Ti","Ke","To","Pe","La"],dayOfWeek:["sunnuntai","maanantai","tiistai","keskiviikko","torstai","perjantai","lauantai"]},gl:{months:["Xan","Feb","Maz","Abr","Mai","Xun","Xul","Ago","Set","Out","Nov","Dec"],dayOfWeekShort:["Dom","Lun","Mar","Mer","Xov","Ven","Sab"],dayOfWeek:["Domingo","Luns","Martes","Mércores","Xoves","Venres","Sábado"]},hr:{months:["Siječanj","Veljača","Ožujak","Travanj","Svibanj","Lipanj","Srpanj","Kolovoz","Rujan","Listopad","Studeni","Prosinac"],dayOfWeekShort:["Ned","Pon","Uto","Sri","Čet","Pet","Sub"],dayOfWeek:["Nedjelja","Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak","Subota"]},ko:{months:["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],dayOfWeekShort:["일","월","화","수","목","금","토"],dayOfWeek:["일요일","월요일","화요일","수요일","목요일","금요일","토요일"]},lt:{months:["Sausio","Vasario","Kovo","Balandžio","Gegužės","Birželio","Liepos","Rugpjūčio","Rugsėjo","Spalio","Lapkričio","Gruodžio"],dayOfWeekShort:["Sek","Pir","Ant","Tre","Ket","Pen","Šeš"],dayOfWeek:["Sekmadienis","Pirmadienis","Antradienis","Trečiadienis","Ketvirtadienis","Penktadienis","Šeštadienis"]},lv:{months:["Janvāris","Februāris","Marts","Aprīlis ","Maijs","Jūnijs","Jūlijs","Augusts","Septembris","Oktobris","Novembris","Decembris"],dayOfWeekShort:["Sv","Pr","Ot","Tr","Ct","Pk","St"],dayOfWeek:["Svētdiena","Pirmdiena","Otrdiena","Trešdiena","Ceturtdiena","Piektdiena","Sestdiena"]},mk:{months:["јануари","февруари","март","април","мај","јуни","јули","август","септември","октомври","ноември","декември"],dayOfWeekShort:["нед","пон","вто","сре","чет","пет","саб"],dayOfWeek:["Недела","Понеделник","Вторник","Среда","Четврток","Петок","Сабота"]},mn:{months:["1-р сар","2-р сар","3-р сар","4-р сар","5-р сар","6-р сар","7-р сар","8-р сар","9-р сар","10-р сар","11-р сар","12-р сар"],dayOfWeekShort:["Дав","Мяг","Лха","Пүр","Бсн","Бям","Ням"],dayOfWeek:["Даваа","Мягмар","Лхагва","Пүрэв","Баасан","Бямба","Ням"]},"pt-BR":{months:["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],dayOfWeekShort:["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],dayOfWeek:["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"]},sk:{months:["Január","Február","Marec","Apríl","Máj","Jún","Júl","August","September","Október","November","December"],dayOfWeekShort:["Ne","Po","Ut","St","Št","Pi","So"],dayOfWeek:["Nedeľa","Pondelok","Utorok","Streda","Štvrtok","Piatok","Sobota"]},sq:{months:["Janar","Shkurt","Mars","Prill","Maj","Qershor","Korrik","Gusht","Shtator","Tetor","Nëntor","Dhjetor"],dayOfWeekShort:["Die","Hën","Mar","Mër","Enj","Pre","Shtu"],dayOfWeek:["E Diel","E Hënë","E Martē","E Mërkurë","E Enjte","E Premte","E Shtunë"]},"sr-YU":{months:["Januar","Februar","Mart","April","Maj","Jun","Jul","Avgust","Septembar","Oktobar","Novembar","Decembar"],dayOfWeekShort:["Ned","Pon","Uto","Sre","čet","Pet","Sub"],dayOfWeek:["Nedelja","Ponedeljak","Utorak","Sreda","Četvrtak","Petak","Subota"]},sr:{months:["јануар","фебруар","март","април","мај","јун","јул","август","септембар","октобар","новембар","децембар"],dayOfWeekShort:["нед","пон","уто","сре","чет","пет","суб"],dayOfWeek:["Недеља","Понедељак","Уторак","Среда","Четвртак","Петак","Субота"]},sv:{months:["Januari","Februari","Mars","April","Maj","Juni","Juli","Augusti","September","Oktober","November","December"],dayOfWeekShort:["Sön","Mån","Tis","Ons","Tor","Fre","Lör"],dayOfWeek:["Söndag","Måndag","Tisdag","Onsdag","Torsdag","Fredag","Lördag"]},"zh-TW":{months:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],dayOfWeekShort:["日","一","二","三","四","五","六"],dayOfWeek:["星期日","星期一","星期二","星期三","星期四","星期五","星期六"]},zh:{months:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],dayOfWeekShort:["日","一","二","三","四","五","六"],dayOfWeek:["星期日","星期一","星期二","星期三","星期四","星期五","星期六"]},ug:{months:["1-ئاي","2-ئاي","3-ئاي","4-ئاي","5-ئاي","6-ئاي","7-ئاي","8-ئاي","9-ئاي","10-ئاي","11-ئاي","12-ئاي"],dayOfWeek:["يەكشەنبە","دۈشەنبە","سەيشەنبە","چارشەنبە","پەيشەنبە","جۈمە","شەنبە"]},he:{months:["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"],dayOfWeekShort:["א'","ב'","ג'","ד'","ה'","ו'","שבת"],dayOfWeek:["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת","ראשון"]},hy:{months:["Հունվար","Փետրվար","Մարտ","Ապրիլ","Մայիս","Հունիս","Հուլիս","Օգոստոս","Սեպտեմբեր","Հոկտեմբեր","Նոյեմբեր","Դեկտեմբեր"],dayOfWeekShort:["Կի","Երկ","Երք","Չոր","Հնգ","Ուրբ","Շբթ"],dayOfWeek:["Կիրակի","Երկուշաբթի","Երեքշաբթի","Չորեքշաբթի","Հինգշաբթի","Ուրբաթ","Շաբաթ"]},kg:{months:["Үчтүн айы","Бирдин айы","Жалган Куран","Чын Куран","Бугу","Кулжа","Теке","Баш Оона","Аяк Оона","Тогуздун айы","Жетинин айы","Бештин айы"],dayOfWeekShort:["Жек","Дүй","Шей","Шар","Бей","Жум","Ише"],dayOfWeek:["Жекшемб","Дүйшөмб","Шейшемб","Шаршемб","Бейшемби","Жума","Ишенб"]},rm:{months:["Schaner","Favrer","Mars","Avrigl","Matg","Zercladur","Fanadur","Avust","Settember","October","November","December"],dayOfWeekShort:["Du","Gli","Ma","Me","Gie","Ve","So"],dayOfWeek:["Dumengia","Glindesdi","Mardi","Mesemna","Gievgia","Venderdi","Sonda"]},ka:{months:["იანვარი","თებერვალი","მარტი","აპრილი","მაისი","ივნისი","ივლისი","აგვისტო","სექტემბერი","ოქტომბერი","ნოემბერი","დეკემბერი"],dayOfWeekShort:["კვ","ორშ","სამშ","ოთხ","ხუთ","პარ","შაბ"],dayOfWeek:["კვირა","ორშაბათი","სამშაბათი","ოთხშაბათი","ხუთშაბათი","პარასკევი","შაბათი"]}},ownerDocument:document,contentWindow:window,value:"",rtl:!1,format:"Y/m/d H:i",formatTime:"H:i",formatDate:"Y/m/d",startDate:!1,step:60,monthChangeSpinner:!0,closeOnDateSelect:!1,closeOnTimeSelect:!0,closeOnWithoutClick:!0,closeOnInputClick:!0,timepicker:!0,datepicker:!0,weeks:!1,defaultTime:!1,defaultDate:!1,minDate:!1,maxDate:!1,minTime:!1,maxTime:!1,minDateTime:!1,disabledMinTime:!1,disabledMaxTime:!1,allowTimes:[],opened:!1,initTime:!0,inline:!1,theme:"",onSelectDate:function(){},onSelectTime:function(){},onChangeMonth:function(){},onGetWeekOfYear:function(){},onChangeYear:function(){},onChangeDateTime:function(){},onShow:function(){},onClose:function(){},onGenerate:function(){},withoutCopyright:!0,inverseButton:!1,hours12:!1,next:"xdsoft_next",prev:"xdsoft_prev",dayOfWeekStart:0,parentID:"body",timeHeightInTimePicker:25,timepickerScrollbar:!0,todayButton:!0,prevButton:!0,nextButton:!0,defaultSelect:!0,scrollMonth:!0,scrollTime:!0,scrollInput:!0,lazyInit:!1,mask:!1,validateOnBlur:!0,allowBlank:!0,yearStart:1950,yearEnd:2050,monthStart:0,monthEnd:11,style:"",id:"",fixed:!1,roundTime:"round",className:"",weekends:[],highlightedDates:[],highlightedPeriods:[],allowDates:[],allowDateRe:null,disabledDates:[],disabledWeekDays:[],yearOffset:0,beforeShowDay:null,enterLikeTab:!0,showApplyButton:!1},n=null,r="en",o={meridiem:["AM","PM"]},i=function(){var t=a.i18n[r],i={days:t.dayOfWeek,daysShort:t.dayOfWeekShort,months:t.months,monthsShort:e.map(t.months,function(e){return e.substring(0,3)})};"function"==typeof DateFormatter&&(n=new DateFormatter({dateSettings:e.extend({},o,i)}))};e.datetimepicker={setLocale:function(e){var t=a.i18n[e]?e:"en";r!==t&&(r=t,i())},setDateFormatter:function(e){n=e},RFC_2822:"D, d M Y H:i:s O",ATOM:"Y-m-dTH:i:sP",ISO_8601:"Y-m-dTH:i:sO",RFC_822:"D, d M y H:i:s O",RFC_850:"l, d-M-y H:i:s T",RFC_1036:"D, d M y H:i:s O",RFC_1123:"D, d M Y H:i:s O",RSS:"D, d M Y H:i:s O",W3C:"Y-m-dTH:i:sP"},i(),window.getComputedStyle||(window.getComputedStyle=function(e){return this.el=e,this.getPropertyValue=function(t){var a=/(-([a-z]))/g;return"float"===t&&(t="styleFloat"),a.test(t)&&(t=t.replace(a,function(e,t,a){return a.toUpperCase()})),e.currentStyle[t]||null},this}),Array.prototype.indexOf||(Array.prototype.indexOf=function(e,t){var a,n;for(a=t||0,n=this.length;a<n;a+=1)if(this[a]===e)return a;return-1}),Date.prototype.countDaysInMonth=function(){return new Date(this.getFullYear(),this.getMonth()+1,0).getDate()},e.fn.xdsoftScroller=function(t,a){return this.each(function(){var n,r,o,i,s,d=e(this),u=function(e){var t,a={x:0,y:0};return"touchstart"===e.type||"touchmove"===e.type||"touchend"===e.type||"touchcancel"===e.type?(t=e.originalEvent.touches[0]||e.originalEvent.changedTouches[0],a.x=t.clientX,a.y=t.clientY):"mousedown"!==e.type&&"mouseup"!==e.type&&"mousemove"!==e.type&&"mouseover"!==e.type&&"mouseout"!==e.type&&"mouseenter"!==e.type&&"mouseleave"!==e.type||(a.x=e.clientX,a.y=e.clientY),a},l=100,f=!1,c=0,m=0,h=0,g=!1,p=0,y=function(){};"hide"!==a?(e(this).hasClass("xdsoft_scroller_box")||(n=d.children().eq(0),r=d[0].clientHeight,o=n[0].offsetHeight,i=e('<div class="xdsoft_scrollbar"></div>'),s=e('<div class="xdsoft_scroller"></div>'),i.append(s),d.addClass("xdsoft_scroller_box").append(i),y=function(e){var t=u(e).y-c+p;t<0&&(t=0),t+s[0].offsetHeight>h&&(t=h-s[0].offsetHeight),d.trigger("scroll_element.xdsoft_scroller",[l?t/l:0])},s.on("touchstart.xdsoft_scroller mousedown.xdsoft_scroller",function(n){r||d.trigger("resize_scroll.xdsoft_scroller",[a]),c=u(n).y,p=parseInt(s.css("margin-top"),10),h=i[0].offsetHeight,"mousedown"===n.type||"touchstart"===n.type?(t.ownerDocument&&e(t.ownerDocument.body).addClass("xdsoft_noselect"),e([t.ownerDocument.body,t.contentWindow]).on("touchend mouseup.xdsoft_scroller",function a(){e([t.ownerDocument.body,t.contentWindow]).off("touchend mouseup.xdsoft_scroller",a).off("mousemove.xdsoft_scroller",y).removeClass("xdsoft_noselect")}),e(t.ownerDocument.body).on("mousemove.xdsoft_scroller",y)):(g=!0,n.stopPropagation(),n.preventDefault())}).on("touchmove",function(e){g&&(e.preventDefault(),y(e))}).on("touchend touchcancel",function(){g=!1,p=0}),d.on("scroll_element.xdsoft_scroller",function(e,t){r||d.trigger("resize_scroll.xdsoft_scroller",[t,!0]),t=t>1?1:t<0||isNaN(t)?0:t,s.css("margin-top",l*t),setTimeout(function(){n.css("marginTop",-parseInt((n[0].offsetHeight-r)*t,10))},10)}).on("resize_scroll.xdsoft_scroller",function(e,t,a){var u,f;r=d[0].clientHeight,o=n[0].offsetHeight,f=(u=r/o)*i[0].offsetHeight,u>1?s.hide():(s.show(),s.css("height",parseInt(f>10?f:10,10)),l=i[0].offsetHeight-s[0].offsetHeight,!0!==a&&d.trigger("scroll_element.xdsoft_scroller",[t||Math.abs(parseInt(n.css("marginTop"),10))/(o-r)]))}),d.on("mousewheel",function(e){var t=Math.abs(parseInt(n.css("marginTop"),10));return(t-=20*e.deltaY)<0&&(t=0),d.trigger("scroll_element.xdsoft_scroller",[t/(o-r)]),e.stopPropagation(),!1}),d.on("touchstart",function(e){f=u(e),m=Math.abs(parseInt(n.css("marginTop"),10))}),d.on("touchmove",function(e){if(f){e.preventDefault();var t=u(e);d.trigger("scroll_element.xdsoft_scroller",[(m-(t.y-f.y))/(o-r)])}}),d.on("touchend touchcancel",function(){f=!1,m=0})),d.trigger("resize_scroll.xdsoft_scroller",[a])):d.find(".xdsoft_scrollbar").hide()})},e.fn.datetimepicker=function(o,i){var s,d,u=this,l=48,f=57,c=96,m=105,h=17,g=46,p=13,y=27,D=8,v=37,b=38,k=39,x=40,T=9,S=116,w=65,M=67,O=86,W=90,_=89,F=!1,C=e.isPlainObject(o)||!o?e.extend(!0,{},a,o):e.extend(!0,{},a),P=0,A=function(e){e.on("open.xdsoft focusin.xdsoft mousedown.xdsoft touchstart",function t(){e.is(":disabled")||e.data("xdsoft_datetimepicker")||(clearTimeout(P),P=setTimeout(function(){e.data("xdsoft_datetimepicker")||s(e),e.off("open.xdsoft focusin.xdsoft mousedown.xdsoft touchstart",t).trigger("open.xdsoft")},100))})};return s=function(a){function i(){var e,t=!1;return C.startDate?t=Y.strToDate(C.startDate):(t=C.value||(a&&a.val&&a.val()?a.val():""))?t=Y.strToDateTime(t):C.defaultDate&&(t=Y.strToDateTime(C.defaultDate),C.defaultTime&&(e=Y.strtotime(C.defaultTime),t.setHours(e.getHours()),t.setMinutes(e.getMinutes()))),t&&Y.isValidDate(t)?H.data("changed",!0):t="",t||0}function s(t){var n=function(e,t){var a=e.replace(/([\[\]\/\{\}\(\)\-\.\+]{1})/g,"\\$1").replace(/_/g,"{digit+}").replace(/([0-9]{1})/g,"{digit$1}").replace(/\{digit([0-9]{1})\}/g,"[0-$1_]{1}").replace(/\{digit[\+]\}/g,"[0-9_]{1}");return new RegExp(a).test(t)},r=function(e){try{if(t.ownerDocument.selection&&t.ownerDocument.selection.createRange)return t.ownerDocument.selection.createRange().getBookmark().charCodeAt(2)-2;if(e.setSelectionRange)return e.selectionStart}catch(e){return 0}},o=function(e,a){if(!(e="string"==typeof e||e instanceof String?t.ownerDocument.getElementById(e):e))return!1;if(e.createTextRange){var n=e.createTextRange();return n.collapse(!0),n.moveEnd("character",a),n.moveStart("character",a),n.select(),!0}return!!e.setSelectionRange&&(e.setSelectionRange(a,a),!0)};t.mask&&a.off("keydown.xdsoft"),!0===t.mask&&("undefined"!=typeof moment?t.mask=t.format.replace(/Y{4}/g,"9999").replace(/Y{2}/g,"99").replace(/M{2}/g,"19").replace(/D{2}/g,"39").replace(/H{2}/g,"29").replace(/m{2}/g,"59").replace(/s{2}/g,"59"):t.mask=t.format.replace(/Y/g,"9999").replace(/F/g,"9999").replace(/m/g,"19").replace(/d/g,"39").replace(/H/g,"29").replace(/i/g,"59").replace(/s/g,"59")),"string"===e.type(t.mask)&&(n(t.mask,a.val())||(a.val(t.mask.replace(/[0-9]/g,"_")),o(a[0],0)),a.on("keydown.xdsoft",function(i){var s,d,u=this.value,C=i.which;if(C>=l&&C<=f||C>=c&&C<=m||C===D||C===g){for(s=r(this),d=C!==D&&C!==g?String.fromCharCode(c<=C&&C<=m?C-l:C):"_",C!==D&&C!==g||!s||(s-=1,d="_");/[^0-9_]/.test(t.mask.substr(s,1))&&s<t.mask.length&&s>0;)s+=C===D||C===g?-1:1;if(u=u.substr(0,s)+d+u.substr(s+1),""===e.trim(u))u=t.mask.replace(/[0-9]/g,"_");else if(s===t.mask.length)return i.preventDefault(),!1;for(s+=C===D||C===g?0:1;/[^0-9_]/.test(t.mask.substr(s,1))&&s<t.mask.length&&s>0;)s+=C===D||C===g?-1:1;n(t.mask,u)?(this.value=u,o(this,s)):""===e.trim(u)?this.value=t.mask.replace(/[0-9]/g,"_"):a.trigger("error_input.xdsoft")}else if(-1!==[w,M,O,W,_].indexOf(C)&&F||-1!==[y,b,x,v,k,S,h,T,p].indexOf(C))return!0;return i.preventDefault(),!1}))}var d,u,P,A,Y,j,H=e('<div class="xdsoft_datetimepicker xdsoft_noselect"></div>'),J=e('<div class="xdsoft_copyright"><a target="_blank" href="http://xdsoft.net/jqplugins/datetimepicker/">xdsoft.net</a></div>'),z=e('<div class="xdsoft_datepicker active"></div>'),I=e('<div class="xdsoft_monthpicker"><button type="button" class="xdsoft_prev"></button><button type="button" class="xdsoft_today_button"></button><div class="xdsoft_label xdsoft_month"><span></span><i></i></div><div class="xdsoft_label xdsoft_year"><span></span><i></i></div><button type="button" class="xdsoft_next"></button></div>'),N=e('<div class="xdsoft_calendar"></div>'),L=e('<div class="xdsoft_timepicker active"><button type="button" class="xdsoft_prev"></button><div class="xdsoft_time_box"></div><button type="button" class="xdsoft_next"></button></div>'),E=L.find(".xdsoft_time_box").eq(0),R=e('<div class="xdsoft_time_variant"></div>'),B=e('<button type="button" class="xdsoft_save_selected blue-gradient-button">Save Selected</button>'),V=e('<div class="xdsoft_select xdsoft_monthselect"><div></div></div>'),G=e('<div class="xdsoft_select xdsoft_yearselect"><div></div></div>'),U=!1,q=0;C.id&&H.attr("id",C.id),C.style&&H.attr("style",C.style),C.weeks&&H.addClass("xdsoft_showweeks"),C.rtl&&H.addClass("xdsoft_rtl"),H.addClass("xdsoft_"+C.theme),H.addClass(C.className),I.find(".xdsoft_month span").after(V),I.find(".xdsoft_year span").after(G),I.find(".xdsoft_month,.xdsoft_year").on("touchstart mousedown.xdsoft",function(t){var a,n,r=e(this).find(".xdsoft_select").eq(0),o=0,i=0,s=r.is(":visible");for(I.find(".xdsoft_select").hide(),Y.currentTime&&(o=Y.currentTime[e(this).hasClass("xdsoft_month")?"getMonth":"getFullYear"]()),r[s?"hide":"show"](),a=r.find("div.xdsoft_option"),n=0;n<a.length&&a.eq(n).data("value")!==o;n+=1)i+=a[0].offsetHeight;return r.xdsoftScroller(C,i/(r.children()[0].offsetHeight-r[0].clientHeight)),t.stopPropagation(),!1}),I.find(".xdsoft_select").xdsoftScroller(C).on("touchstart mousedown.xdsoft",function(e){e.stopPropagation(),e.preventDefault()}).on("touchstart mousedown.xdsoft",".xdsoft_option",function(){void 0!==Y.currentTime&&null!==Y.currentTime||(Y.currentTime=Y.now());var t=Y.currentTime.getFullYear();Y&&Y.currentTime&&Y.currentTime[e(this).parent().parent().hasClass("xdsoft_monthselect")?"setMonth":"setFullYear"](e(this).data("value")),e(this).parent().parent().hide(),H.trigger("xchange.xdsoft"),C.onChangeMonth&&e.isFunction(C.onChangeMonth)&&C.onChangeMonth.call(H,Y.currentTime,H.data("input")),t!==Y.currentTime.getFullYear()&&e.isFunction(C.onChangeYear)&&C.onChangeYear.call(H,Y.currentTime,H.data("input"))}),H.getValue=function(){return Y.getCurrentTime()},H.setOptions=function(r){var o={};C=e.extend(!0,{},C,r),r.allowTimes&&e.isArray(r.allowTimes)&&r.allowTimes.length&&(C.allowTimes=e.extend(!0,[],r.allowTimes)),r.weekends&&e.isArray(r.weekends)&&r.weekends.length&&(C.weekends=e.extend(!0,[],r.weekends)),r.allowDates&&e.isArray(r.allowDates)&&r.allowDates.length&&(C.allowDates=e.extend(!0,[],r.allowDates)),r.allowDateRe&&"[object String]"===Object.prototype.toString.call(r.allowDateRe)&&(C.allowDateRe=new RegExp(r.allowDateRe)),r.highlightedDates&&e.isArray(r.highlightedDates)&&r.highlightedDates.length&&(e.each(r.highlightedDates,function(a,r){var i,s=e.map(r.split(","),e.trim),d=new t(n.parseDate(s[0],C.formatDate),s[1],s[2]),u=n.formatDate(d.date,C.formatDate);void 0!==o[u]?(i=o[u].desc)&&i.length&&d.desc&&d.desc.length&&(o[u].desc=i+"\n"+d.desc):o[u]=d}),C.highlightedDates=e.extend(!0,[],o)),r.highlightedPeriods&&e.isArray(r.highlightedPeriods)&&r.highlightedPeriods.length&&(o=e.extend(!0,[],C.highlightedDates),e.each(r.highlightedPeriods,function(a,r){var i,s,d,u,l,f,c;if(e.isArray(r))i=r[0],s=r[1],d=r[2],c=r[3];else{var m=e.map(r.split(","),e.trim);i=n.parseDate(m[0],C.formatDate),s=n.parseDate(m[1],C.formatDate),d=m[2],c=m[3]}for(;i<=s;)u=new t(i,d,c),l=n.formatDate(i,C.formatDate),i.setDate(i.getDate()+1),void 0!==o[l]?(f=o[l].desc)&&f.length&&u.desc&&u.desc.length&&(o[l].desc=f+"\n"+u.desc):o[l]=u}),C.highlightedDates=e.extend(!0,[],o)),r.disabledDates&&e.isArray(r.disabledDates)&&r.disabledDates.length&&(C.disabledDates=e.extend(!0,[],r.disabledDates)),r.disabledWeekDays&&e.isArray(r.disabledWeekDays)&&r.disabledWeekDays.length&&(C.disabledWeekDays=e.extend(!0,[],r.disabledWeekDays)),!C.open&&!C.opened||C.inline||a.trigger("open.xdsoft"),C.inline&&(U=!0,H.addClass("xdsoft_inline"),a.after(H).hide()),C.inverseButton&&(C.next="xdsoft_prev",C.prev="xdsoft_next"),C.datepicker?z.addClass("active"):z.removeClass("active"),C.timepicker?L.addClass("active"):L.removeClass("active"),C.value&&(Y.setCurrentTime(C.value),a&&a.val&&a.val(Y.str)),isNaN(C.dayOfWeekStart)?C.dayOfWeekStart=0:C.dayOfWeekStart=parseInt(C.dayOfWeekStart,10)%7,C.timepickerScrollbar||E.xdsoftScroller(C,"hide"),C.minDate&&/^[\+\-](.*)$/.test(C.minDate)&&(C.minDate=n.formatDate(Y.strToDateTime(C.minDate),C.formatDate)),C.maxDate&&/^[\+\-](.*)$/.test(C.maxDate)&&(C.maxDate=n.formatDate(Y.strToDateTime(C.maxDate),C.formatDate)),C.minDateTime&&/^\+(.*)$/.test(C.minDateTime)&&(C.minDateTime=Y.strToDateTime(C.minDateTime).dateFormat(C.formatDate)),B.toggle(C.showApplyButton),I.find(".xdsoft_today_button").css("visibility",C.todayButton?"visible":"hidden"),I.find("."+C.prev).css("visibility",C.prevButton?"visible":"hidden"),I.find("."+C.next).css("visibility",C.nextButton?"visible":"hidden"),s(C),C.validateOnBlur&&a.off("blur.xdsoft").on("blur.xdsoft",function(){if(C.allowBlank&&(!e.trim(e(this).val()).length||"string"==typeof C.mask&&e.trim(e(this).val())===C.mask.replace(/[0-9]/g,"_")))e(this).val(null),H.data("xdsoft_datetime").empty();else{var t=n.parseDate(e(this).val(),C.format);if(t)e(this).val(n.formatDate(t,C.format));else{var a=+[e(this).val()[0],e(this).val()[1]].join(""),r=+[e(this).val()[2],e(this).val()[3]].join("");!C.datepicker&&C.timepicker&&a>=0&&a<24&&r>=0&&r<60?e(this).val([a,r].map(function(e){return e>9?e:"0"+e}).join(":")):e(this).val(n.formatDate(Y.now(),C.format))}H.data("xdsoft_datetime").setCurrentTime(e(this).val())}H.trigger("changedatetime.xdsoft"),H.trigger("close.xdsoft")}),C.dayOfWeekStartPrev=0===C.dayOfWeekStart?6:C.dayOfWeekStart-1,H.trigger("xchange.xdsoft").trigger("afterOpen.xdsoft")},H.data("options",C).on("touchstart mousedown.xdsoft",function(e){return e.stopPropagation(),e.preventDefault(),G.hide(),V.hide(),!1}),E.append(R),E.xdsoftScroller(C),H.on("afterOpen.xdsoft",function(){E.xdsoftScroller(C)}),H.append(z).append(L),!0!==C.withoutCopyright&&H.append(J),z.append(I).append(N).append(B),e(C.parentID).append(H),Y=new function(){var t=this;t.now=function(e){var a,n,r=new Date;return!e&&C.defaultDate&&(a=t.strToDateTime(C.defaultDate),r.setFullYear(a.getFullYear()),r.setMonth(a.getMonth()),r.setDate(a.getDate())),C.yearOffset&&r.setFullYear(r.getFullYear()+C.yearOffset),!e&&C.defaultTime&&(n=t.strtotime(C.defaultTime),r.setHours(n.getHours()),r.setMinutes(n.getMinutes())),r},t.isValidDate=function(e){return"[object Date]"===Object.prototype.toString.call(e)&&!isNaN(e.getTime())},t.setCurrentTime=function(e,a){"string"==typeof e?t.currentTime=t.strToDateTime(e):t.isValidDate(e)?t.currentTime=e:e||a||!C.allowBlank||C.inline?t.currentTime=t.now():t.currentTime=null,H.trigger("xchange.xdsoft")},t.empty=function(){t.currentTime=null},t.getCurrentTime=function(){return t.currentTime},t.nextMonth=function(){void 0!==t.currentTime&&null!==t.currentTime||(t.currentTime=t.now());var a,n=t.currentTime.getMonth()+1;return 12===n&&(t.currentTime.setFullYear(t.currentTime.getFullYear()+1),n=0),a=t.currentTime.getFullYear(),t.currentTime.setDate(Math.min(new Date(t.currentTime.getFullYear(),n+1,0).getDate(),t.currentTime.getDate())),t.currentTime.setMonth(n),C.onChangeMonth&&e.isFunction(C.onChangeMonth)&&C.onChangeMonth.call(H,Y.currentTime,H.data("input")),a!==t.currentTime.getFullYear()&&e.isFunction(C.onChangeYear)&&C.onChangeYear.call(H,Y.currentTime,H.data("input")),H.trigger("xchange.xdsoft"),n},t.prevMonth=function(){void 0!==t.currentTime&&null!==t.currentTime||(t.currentTime=t.now());var a=t.currentTime.getMonth()-1;return-1===a&&(t.currentTime.setFullYear(t.currentTime.getFullYear()-1),a=11),t.currentTime.setDate(Math.min(new Date(t.currentTime.getFullYear(),a+1,0).getDate(),t.currentTime.getDate())),t.currentTime.setMonth(a),C.onChangeMonth&&e.isFunction(C.onChangeMonth)&&C.onChangeMonth.call(H,Y.currentTime,H.data("input")),H.trigger("xchange.xdsoft"),a},t.getWeekOfYear=function(t){if(C.onGetWeekOfYear&&e.isFunction(C.onGetWeekOfYear)){var a=C.onGetWeekOfYear.call(H,t);if(void 0!==a)return a}var n=new Date(t.getFullYear(),0,1);return 4!==n.getDay()&&n.setMonth(0,1+(4-n.getDay()+7)%7),Math.ceil(((t-n)/864e5+n.getDay()+1)/7)},t.strToDateTime=function(e){var a,r,o=[];return e&&e instanceof Date&&t.isValidDate(e)?e:((o=/^([+-]{1})(.*)$/.exec(e))&&(o[2]=n.parseDate(o[2],C.formatDate)),o&&o[2]?(a=o[2].getTime()-6e4*o[2].getTimezoneOffset(),r=new Date(t.now(!0).getTime()+parseInt(o[1]+"1",10)*a)):r=e?n.parseDate(e,C.format):t.now(),t.isValidDate(r)||(r=t.now()),r)},t.strToDate=function(e){if(e&&e instanceof Date&&t.isValidDate(e))return e;var a=e?n.parseDate(e,C.formatDate):t.now(!0);return t.isValidDate(a)||(a=t.now(!0)),a},t.strtotime=function(e){if(e&&e instanceof Date&&t.isValidDate(e))return e;var a=e?n.parseDate(e,C.formatTime):t.now(!0);return t.isValidDate(a)||(a=t.now(!0)),a},t.str=function(){return n.formatDate(t.currentTime,C.format)},t.currentTime=this.now()},B.on("touchend click",function(e){e.preventDefault(),H.data("changed",!0),Y.setCurrentTime(i()),a.val(Y.str()),H.trigger("close.xdsoft")}),I.find(".xdsoft_today_button").on("touchend mousedown.xdsoft",function(){H.data("changed",!0),Y.setCurrentTime(0,!0),H.trigger("afterOpen.xdsoft")}).on("dblclick.xdsoft",function(){var e,t,n=Y.getCurrentTime();n=new Date(n.getFullYear(),n.getMonth(),n.getDate()),e=Y.strToDate(C.minDate),n<(e=new Date(e.getFullYear(),e.getMonth(),e.getDate()))||(t=Y.strToDate(C.maxDate),n>(t=new Date(t.getFullYear(),t.getMonth(),t.getDate()))||(a.val(Y.str()),a.trigger("change"),H.trigger("close.xdsoft")))}),I.find(".xdsoft_prev,.xdsoft_next").on("touchend mousedown.xdsoft",function(){var t=e(this),a=0,n=!1;!function e(r){t.hasClass(C.next)?Y.nextMonth():t.hasClass(C.prev)&&Y.prevMonth(),C.monthChangeSpinner&&(n||(a=setTimeout(e,r||100)))}(500),e([C.ownerDocument.body,C.contentWindow]).on("touchend mouseup.xdsoft",function t(){clearTimeout(a),n=!0,e([C.ownerDocument.body,C.contentWindow]).off("touchend mouseup.xdsoft",t)})}),L.find(".xdsoft_prev,.xdsoft_next").on("touchend mousedown.xdsoft",function(){var t=e(this),a=0,n=!1,r=110;!function e(o){var i=E[0].clientHeight,s=R[0].offsetHeight,d=Math.abs(parseInt(R.css("marginTop"),10));t.hasClass(C.next)&&s-i-C.timeHeightInTimePicker>=d?R.css("marginTop","-"+(d+C.timeHeightInTimePicker)+"px"):t.hasClass(C.prev)&&d-C.timeHeightInTimePicker>=0&&R.css("marginTop","-"+(d-C.timeHeightInTimePicker)+"px"),E.trigger("scroll_element.xdsoft_scroller",[Math.abs(parseInt(R[0].style.marginTop,10)/(s-i))]),r=r>10?10:r-10,n||(a=setTimeout(e,o||r))}(500),e([C.ownerDocument.body,C.contentWindow]).on("touchend mouseup.xdsoft",function t(){clearTimeout(a),n=!0,e([C.ownerDocument.body,C.contentWindow]).off("touchend mouseup.xdsoft",t)})}),d=0,H.on("xchange.xdsoft",function(t){clearTimeout(d),d=setTimeout(function(){void 0!==Y.currentTime&&null!==Y.currentTime||(Y.currentTime=Y.now());for(var t,i,s,d,u,l,f,c,m,h,g="",p=new Date(Y.currentTime.getFullYear(),Y.currentTime.getMonth(),1,12,0,0),y=0,D=Y.now(),v=!1,b=!1,k=!1,x=[],T=!0,S="";p.getDay()!==C.dayOfWeekStart;)p.setDate(p.getDate()-1);for(g+="<table><thead><tr>",C.weeks&&(g+="<th></th>"),t=0;t<7;t+=1)g+="<th>"+C.i18n[r].dayOfWeekShort[(t+C.dayOfWeekStart)%7]+"</th>";for(g+="</tr></thead>",g+="<tbody>",!1!==C.maxDate&&(v=Y.strToDate(C.maxDate),v=new Date(v.getFullYear(),v.getMonth(),v.getDate(),23,59,59,999)),!1!==C.minDate&&(b=Y.strToDate(C.minDate),b=new Date(b.getFullYear(),b.getMonth(),b.getDate())),!1!==C.minDateTime&&(k=Y.strToDate(C.minDateTime),k=new Date(k.getFullYear(),k.getMonth(),k.getDate(),k.getHours(),k.getMinutes(),k.getSeconds()));y<Y.currentTime.countDaysInMonth()||p.getDay()!==C.dayOfWeekStart||Y.currentTime.getMonth()===p.getMonth();)x=[],y+=1,s=p.getDay(),d=p.getDate(),u=p.getFullYear(),l=p.getMonth(),f=Y.getWeekOfYear(p),h="",x.push("xdsoft_date"),c=C.beforeShowDay&&e.isFunction(C.beforeShowDay.call)?C.beforeShowDay.call(H,p):null,C.allowDateRe&&"[object RegExp]"===Object.prototype.toString.call(C.allowDateRe)?C.allowDateRe.test(n.formatDate(p,C.formatDate))||x.push("xdsoft_disabled"):C.allowDates&&C.allowDates.length>0?-1===C.allowDates.indexOf(n.formatDate(p,C.formatDate))&&x.push("xdsoft_disabled"):!1!==v&&p>v||!1!==k&&p<k||!1!==b&&p<b||c&&!1===c[0]?x.push("xdsoft_disabled"):-1!==C.disabledDates.indexOf(n.formatDate(p,C.formatDate))?x.push("xdsoft_disabled"):-1!==C.disabledWeekDays.indexOf(s)?x.push("xdsoft_disabled"):a.is("[disabled]")&&x.push("xdsoft_disabled"),c&&""!==c[1]&&x.push(c[1]),Y.currentTime.getMonth()!==l&&x.push("xdsoft_other_month"),(C.defaultSelect||H.data("changed"))&&n.formatDate(Y.currentTime,C.formatDate)===n.formatDate(p,C.formatDate)&&x.push("xdsoft_current"),n.formatDate(D,C.formatDate)===n.formatDate(p,C.formatDate)&&x.push("xdsoft_today"),0!==p.getDay()&&6!==p.getDay()&&-1===C.weekends.indexOf(n.formatDate(p,C.formatDate))||x.push("xdsoft_weekend"),void 0!==C.highlightedDates[n.formatDate(p,C.formatDate)]&&(i=C.highlightedDates[n.formatDate(p,C.formatDate)],x.push(void 0===i.style?"xdsoft_highlighted_default":i.style),h=void 0===i.desc?"":i.desc),C.beforeShowDay&&e.isFunction(C.beforeShowDay)&&x.push(C.beforeShowDay(p)),T&&(g+="<tr>",T=!1,C.weeks&&(g+="<th>"+f+"</th>")),g+='<td data-date="'+d+'" data-month="'+l+'" data-year="'+u+'" class="xdsoft_date xdsoft_day_of_week'+p.getDay()+" "+x.join(" ")+'" title="'+h+'"><div>'+d+"</div></td>",p.getDay()===C.dayOfWeekStartPrev&&(g+="</tr>",T=!0),p.setDate(d+1);if(g+="</tbody></table>",N.html(g),I.find(".xdsoft_label span").eq(0).text(C.i18n[r].months[Y.currentTime.getMonth()]),I.find(".xdsoft_label span").eq(1).text(Y.currentTime.getFullYear()),S="","",l="",m=function(t,r){var o,i,s=Y.now(),d=C.allowTimes&&e.isArray(C.allowTimes)&&C.allowTimes.length;s.setHours(t),t=parseInt(s.getHours(),10),s.setMinutes(r),r=parseInt(s.getMinutes(),10),(o=new Date(Y.currentTime)).setHours(t),o.setMinutes(r),x=[],!1!==C.minDateTime&&C.minDateTime>o||!1!==C.maxTime&&Y.strtotime(C.maxTime).getTime()<s.getTime()||!1!==C.minTime&&Y.strtotime(C.minTime).getTime()>s.getTime()?x.push("xdsoft_disabled"):!1!==C.minDateTime&&C.minDateTime>o||!1!==C.disabledMinTime&&s.getTime()>Y.strtotime(C.disabledMinTime).getTime()&&!1!==C.disabledMaxTime&&s.getTime()<Y.strtotime(C.disabledMaxTime).getTime()?x.push("xdsoft_disabled"):a.is("[disabled]")&&x.push("xdsoft_disabled"),(i=new Date(Y.currentTime)).setHours(parseInt(Y.currentTime.getHours(),10)),d||i.setMinutes(Math[C.roundTime](Y.currentTime.getMinutes()/C.step)*C.step),(C.initTime||C.defaultSelect||H.data("changed"))&&i.getHours()===parseInt(t,10)&&(!d&&C.step>59||i.getMinutes()===parseInt(r,10))&&(C.defaultSelect||H.data("changed")?x.push("xdsoft_current"):C.initTime&&x.push("xdsoft_init_time")),parseInt(D.getHours(),10)===parseInt(t,10)&&parseInt(D.getMinutes(),10)===parseInt(r,10)&&x.push("xdsoft_today"),S+='<div class="xdsoft_time '+x.join(" ")+'" data-hour="'+t+'" data-minute="'+r+'">'+n.formatDate(s,C.formatTime)+"</div>"},C.allowTimes&&e.isArray(C.allowTimes)&&C.allowTimes.length)for(y=0;y<C.allowTimes.length;y+=1)m(Y.strtotime(C.allowTimes[y]).getHours(),l=Y.strtotime(C.allowTimes[y]).getMinutes());else for(y=0,t=0;y<(C.hours12?12:24);y+=1)for(t=0;t<60;t+=C.step)m((y<10?"0":"")+y,l=(t<10?Y.now().getMinutes():"")+t);for(R.html(S),o="",y=parseInt(C.yearStart,10)+C.yearOffset;y<=parseInt(C.yearEnd,10)+C.yearOffset;y+=1)o+='<div class="xdsoft_option '+(Y.currentTime.getFullYear()===y?"xdsoft_current":"")+'" data-value="'+y+'">'+y+"</div>";for(G.children().eq(0).html(o),y=parseInt(C.monthStart,10),o="";y<=parseInt(C.monthEnd,10);y+=1)o+='<div class="xdsoft_option '+(Y.currentTime.getMonth()===y?"xdsoft_current":"")+'" data-value="'+y+'">'+C.i18n[r].months[y]+"</div>";V.children().eq(0).html(o),e(H).trigger("generate.xdsoft")},10),t.stopPropagation()}).on("afterOpen.xdsoft",function(){if(C.timepicker){var e,t,a,n;R.find(".xdsoft_current").length?e=".xdsoft_current":R.find(".xdsoft_init_time").length&&(e=".xdsoft_init_time"),e?(t=E[0].clientHeight,(a=R[0].offsetHeight)-t<(n=R.find(e).index()*C.timeHeightInTimePicker+1)&&(n=a-t),E.trigger("scroll_element.xdsoft_scroller",[parseInt(n,10)/(a-t)])):E.trigger("scroll_element.xdsoft_scroller",[0])}}),u=0,N.on("touchend click.xdsoft","td",function(t){t.stopPropagation(),u+=1;var n=e(this),r=Y.currentTime;if(void 0!==r&&null!==r||(Y.currentTime=Y.now(),r=Y.currentTime),n.hasClass("xdsoft_disabled"))return!1;r.setDate(1),r.setFullYear(n.data("year")),r.setMonth(n.data("month")),r.setDate(n.data("date")),H.trigger("select.xdsoft",[r]),a.val(Y.str()),C.onSelectDate&&e.isFunction(C.onSelectDate)&&C.onSelectDate.call(H,Y.currentTime,H.data("input"),t),H.data("changed",!0),H.trigger("xchange.xdsoft"),H.trigger("changedatetime.xdsoft"),(u>1||!0===C.closeOnDateSelect||!1===C.closeOnDateSelect&&!C.timepicker)&&!C.inline&&H.trigger("close.xdsoft"),setTimeout(function(){u=0},200)}),R.on("touchend click.xdsoft","div",function(t){t.stopPropagation();var a=e(this),n=Y.currentTime;if(void 0!==n&&null!==n||(Y.currentTime=Y.now(),n=Y.currentTime),a.hasClass("xdsoft_disabled"))return!1;n.setHours(a.data("hour")),n.setMinutes(a.data("minute")),H.trigger("select.xdsoft",[n]),H.data("input").val(Y.str()),C.onSelectTime&&e.isFunction(C.onSelectTime)&&C.onSelectTime.call(H,Y.currentTime,H.data("input"),t),H.data("changed",!0),H.trigger("xchange.xdsoft"),H.trigger("changedatetime.xdsoft"),!0!==C.inline&&!0===C.closeOnTimeSelect&&H.trigger("close.xdsoft")}),z.on("mousewheel.xdsoft",function(e){return!C.scrollMonth||(e.deltaY<0?Y.nextMonth():Y.prevMonth(),!1)}),a.on("mousewheel.xdsoft",function(e){return!C.scrollInput||(!C.datepicker&&C.timepicker?((P=R.find(".xdsoft_current").length?R.find(".xdsoft_current").eq(0).index():0)+e.deltaY>=0&&P+e.deltaY<R.children().length&&(P+=e.deltaY),R.children().eq(P).length&&R.children().eq(P).trigger("mousedown"),!1):C.datepicker&&!C.timepicker?(z.trigger(e,[e.deltaY,e.deltaX,e.deltaY]),a.val&&a.val(Y.str()),H.trigger("changedatetime.xdsoft"),!1):void 0)}),H.on("changedatetime.xdsoft",function(t){if(C.onChangeDateTime&&e.isFunction(C.onChangeDateTime)){var a=H.data("input");C.onChangeDateTime.call(H,Y.currentTime,a,t),delete C.value,a.trigger("change")}}).on("generate.xdsoft",function(){C.onGenerate&&e.isFunction(C.onGenerate)&&C.onGenerate.call(H,Y.currentTime,H.data("input")),U&&(H.trigger("afterOpen.xdsoft"),U=!1)}).on("click.xdsoft",function(e){e.stopPropagation()}),P=0,j=function(e,t){do{if(!(e=e.parentNode)||!1===t(e))break}while("HTML"!==e.nodeName)},A=function(){var t,a,n,r,o,i,s,d,u,l,f,c,m;if(d=H.data("input"),t=d.offset(),a=d[0],l="top",n=t.top+a.offsetHeight-1,r=t.left,o="absolute",u=e(C.contentWindow).width(),c=e(C.contentWindow).height(),m=e(C.contentWindow).scrollTop(),C.ownerDocument.documentElement.clientWidth-t.left<z.parent().outerWidth(!0)){var h=z.parent().outerWidth(!0)-a.offsetWidth;r-=h}"rtl"===d.parent().css("direction")&&(r-=H.outerWidth()-d.outerWidth()),C.fixed?(n-=m,r-=e(C.contentWindow).scrollLeft(),o="fixed"):(s=!1,j(a,function(e){return null!==e&&("fixed"===C.contentWindow.getComputedStyle(e).getPropertyValue("position")?(s=!0,!1):void 0)}),s?(o="fixed",n+H.outerHeight()>c+m?(l="bottom",n=c+m-t.top):n-=m):n+H[0].offsetHeight>c+m&&(n=t.top-H[0].offsetHeight+1),n<0&&(n=0),r+a.offsetWidth>u&&(r=u-a.offsetWidth)),i=H[0],j(i,function(e){if("relative"===C.contentWindow.getComputedStyle(e).getPropertyValue("position")&&u>=e.offsetWidth)return r-=(u-e.offsetWidth)/2,!1}),(f={position:o,left:r,top:"",bottom:""})[l]=n,H.css(f)},H.on("open.xdsoft",function(t){var a=!0;C.onShow&&e.isFunction(C.onShow)&&(a=C.onShow.call(H,Y.currentTime,H.data("input"),t)),!1!==a&&(H.show(),A(),e(C.contentWindow).off("resize.xdsoft",A).on("resize.xdsoft",A),C.closeOnWithoutClick&&e([C.ownerDocument.body,C.contentWindow]).on("touchstart mousedown.xdsoft",function t(){H.trigger("close.xdsoft"),e([C.ownerDocument.body,C.contentWindow]).off("touchstart mousedown.xdsoft",t)}))}).on("close.xdsoft",function(t){var a=!0;I.find(".xdsoft_month,.xdsoft_year").find(".xdsoft_select").hide(),C.onClose&&e.isFunction(C.onClose)&&(a=C.onClose.call(H,Y.currentTime,H.data("input"),t)),!1===a||C.opened||C.inline||H.hide(),t.stopPropagation()}).on("toggle.xdsoft",function(){H.is(":visible")?H.trigger("close.xdsoft"):H.trigger("open.xdsoft")}).data("input",a),q=0,H.data("xdsoft_datetime",Y),H.setOptions(C),Y.setCurrentTime(i()),a.data("xdsoft_datetimepicker",H).on("open.xdsoft focusin.xdsoft mousedown.xdsoft touchstart",function(){a.is(":disabled")||a.data("xdsoft_datetimepicker").is(":visible")&&C.closeOnInputClick||(clearTimeout(q),q=setTimeout(function(){a.is(":disabled")||(U=!0,Y.setCurrentTime(i(),!0),C.mask&&s(C),H.trigger("open.xdsoft"))},100))}).on("keydown.xdsoft",function(t){var a,n=t.which;return-1!==[p].indexOf(n)&&C.enterLikeTab?(a=e("input:visible,textarea:visible,button:visible,a:visible"),H.trigger("close.xdsoft"),a.eq(a.index(this)+1).focus(),!1):-1!==[T].indexOf(n)?(H.trigger("close.xdsoft"),!0):void 0}).on("blur.xdsoft",function(){H.trigger("close.xdsoft")})},d=function(t){var a=t.data("xdsoft_datetimepicker");a&&(a.data("xdsoft_datetime",null),a.remove(),t.data("xdsoft_datetimepicker",null).off(".xdsoft"),e(C.contentWindow).off("resize.xdsoft"),e([C.contentWindow,C.ownerDocument.body]).off("mousedown.xdsoft touchstart"),t.unmousewheel&&t.unmousewheel())},e(C.ownerDocument).off("keydown.xdsoftctrl keyup.xdsoftctrl").on("keydown.xdsoftctrl",function(e){e.keyCode===h&&(F=!0)}).on("keyup.xdsoftctrl",function(e){e.keyCode===h&&(F=!1)}),this.each(function(){var t=e(this).data("xdsoft_datetimepicker");if(t){if("string"===e.type(o))switch(o){case"show":e(this).select().focus(),t.trigger("open.xdsoft");break;case"hide":t.trigger("close.xdsoft");break;case"toggle":t.trigger("toggle.xdsoft");break;case"destroy":d(e(this));break;case"reset":this.value=this.defaultValue,this.value&&t.data("xdsoft_datetime").isValidDate(n.parseDate(this.value,C.format))||t.data("changed",!1),t.data("xdsoft_datetime").setCurrentTime(this.value);break;case"validate":t.data("input").trigger("blur.xdsoft");break;default:t[o]&&e.isFunction(t[o])&&(u=t[o](i))}else t.setOptions(o);return 0}"string"!==e.type(o)&&(!C.lazyInit||C.open||C.inline?s(e(this)):A(e(this)))}),u},e.fn.datetimepicker.defaults=a};!function(e){"function"==typeof define&&define.amd?define(["jquery","jquery-mousewheel"],e):"object"==typeof exports?module.exports=e(require("jquery")):e(jQuery)}(datetimepickerFactory),function(e){"function"==typeof define&&define.amd?define(["jquery"],e):"object"==typeof exports?module.exports=e:e(jQuery)}(function(e){function t(t){var i=t||window.event,s=d.call(arguments,1),u=0,f=0,c=0,m=0,h=0,g=0;if(t=e.event.fix(i),t.type="mousewheel","detail"in i&&(c=-1*i.detail),"wheelDelta"in i&&(c=i.wheelDelta),"wheelDeltaY"in i&&(c=i.wheelDeltaY),"wheelDeltaX"in i&&(f=-1*i.wheelDeltaX),"axis"in i&&i.axis===i.HORIZONTAL_AXIS&&(f=-1*c,c=0),u=0===c?f:c,"deltaY"in i&&(u=c=-1*i.deltaY),"deltaX"in i&&(f=i.deltaX,0===c&&(u=-1*f)),0!==c||0!==f){if(1===i.deltaMode){var p=e.data(this,"mousewheel-line-height");u*=p,c*=p,f*=p}else if(2===i.deltaMode){var y=e.data(this,"mousewheel-page-height");u*=y,c*=y,f*=y}if(m=Math.max(Math.abs(c),Math.abs(f)),(!o||m<o)&&(o=m,n(i,m)&&(o/=40)),n(i,m)&&(u/=40,f/=40,c/=40),u=Math[u>=1?"floor":"ceil"](u/o),f=Math[f>=1?"floor":"ceil"](f/o),c=Math[c>=1?"floor":"ceil"](c/o),l.settings.normalizeOffset&&this.getBoundingClientRect){var D=this.getBoundingClientRect();h=t.clientX-D.left,g=t.clientY-D.top}return t.deltaX=f,t.deltaY=c,t.deltaFactor=o,t.offsetX=h,t.offsetY=g,t.deltaMode=0,s.unshift(t,u,f,c),r&&clearTimeout(r),r=setTimeout(a,200),(e.event.dispatch||e.event.handle).apply(this,s)}}function a(){o=null}function n(e,t){return l.settings.adjustOldDeltas&&"mousewheel"===e.type&&t%120==0}var r,o,i=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],s="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],d=Array.prototype.slice;if(e.event.fixHooks)for(var u=i.length;u;)e.event.fixHooks[i[--u]]=e.event.mouseHooks;var l=e.event.special.mousewheel={version:"3.1.12",setup:function(){if(this.addEventListener)for(var a=s.length;a;)this.addEventListener(s[--a],t,!1);else this.onmousewheel=t;e.data(this,"mousewheel-line-height",l.getLineHeight(this)),e.data(this,"mousewheel-page-height",l.getPageHeight(this))},teardown:function(){if(this.removeEventListener)for(var a=s.length;a;)this.removeEventListener(s[--a],t,!1);else this.onmousewheel=null;e.removeData(this,"mousewheel-line-height"),e.removeData(this,"mousewheel-page-height")},getLineHeight:function(t){var a=e(t),n=a["offsetParent"in e.fn?"offsetParent":"parent"]();return n.length||(n=e("body")),parseInt(n.css("fontSize"),10)||parseInt(a.css("fontSize"),10)||16},getPageHeight:function(t){return e(t).height()},settings:{adjustOldDeltas:!0,normalizeOffset:!0}};e.fn.extend({mousewheel:function(e){return e?this.bind("mousewheel",e):this.trigger("mousewheel")},unmousewheel:function(e){return this.unbind("mousewheel",e)}})});

(function ($) {

    $(function () {
        var o, e;

        function n(o, e) {
            if (o && e) {
                var n = o.offsetTop - window.pageYOffset - window.innerHeight;
                e.style.bottom = n <= 0 ? -1 * n + "px" : "0px"
            }
        }

        o = document.querySelector(".banner_up_footer"), e = document.querySelector(".banner_up_close"), o && (e.onclick = function () {
            o.style.opacity = "0"
        });
        var t = document.querySelector("footer"), c = document.querySelector(".banner_up_footer");
        n(t, c), window.onscroll = function () {
            n(t, c)
        }
    });

    function hideChat() {
        let chat = document.querySelector('.c-chat');
        let btnClose = document.querySelector('.c-chat__close');

        if (chat) {
            btnClose.onclick = function () {
                chat.style.display = 'none';
            }
        }
    }

    hideChat();

    function hideFooterBanner() {
        let bottomBanner = document.querySelector('.banner_up_footer');
        let btnClose = document.querySelector('.banner_up_close');

        if (bottomBanner) {
            btnClose.onclick = function () {
                bottomBanner.style.opacity = '0';
                bottomBanner.style.zIndex = 0;
            }
        }
    }

    hideFooterBanner();

    function elementInViewport(footer, banner) {
        if (footer && banner) {
            var ftop = footer.offsetTop;
            var visibleFooter = ftop - window.pageYOffset - window.innerHeight;

            if (visibleFooter <= 0) {
                banner.style.bottom = 0 - visibleFooter + 'px';
            } else {
                banner.style.bottom = '0px';
            }
        }
    }

    let footer = document.querySelector('footer');
    let banner = document.querySelector('.bot-banner');

    elementInViewport(footer, banner);

    window.onscroll = function () {
        elementInViewport(footer, banner);
    }

    $(function () {
        $('.btn-b-modal').fancybox({
            padding: 0,
            width: 595
        });
    })

    $('.b-modal i button').on('click', function () {
        $.fancybox.close();
    })

    function getCookie(name) {
        var matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    $(document).mouseleave(function (e) {
        if (e.clientY < 0) {
            var alertwin = getCookie("alertwin");

            if (alertwin != "no") {
                $.fancybox.open($('.b-modal_exit'));
                var date = new Date;
                date.setDate(date.getDate() + 1);
                document.cookie = "alertwin=no; path=/; expires=" + date.toUTCString();
            }
        }
    });

    $('.eltdf-fullscreen-search-close').on('click', function () {
        $('.eltdf-fullscreen-search-holder').removeClass('eltdf-animate');
    })

    $('.btn-number').on('click', function() {
        var input = $(this).parent().find('input');
        var inputValue = $(this).parent().find('input').val();

        if($(this).hasClass('btn-plus')) {
            inputValue++;

            if(inputValue >= 0 && inputValue <= 150) {
                input.val(inputValue);
            }else if(inputValue > 150) {
                $('.order-form__input input').next('.order-form__required').fadeIn();
                setTimeout(function() {
                    $('.order-form__required').fadeOut();
                }, 2000);
            }else {
                input.val(0);
            }
        }else if($(this).hasClass('btn-minus')) {
            inputValue--;

            if(inputValue > 0) {
                input.val(inputValue);
            }else {
                input.val(0);
            }
        }
    })


    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    current = dd+'.'+mm+'.'+yyyy;

    var hours = new Date().getHours() + 3;

    if( hours > 24 ) {
        hours = hours - 24;
        dd += 1;
    }

    jQuery('.order-form__date').datetimepicker({
        format:'d.m.Y',
        value: current,
        minDate:'+1970/01/01',
        timepicker:false,
    });

    jQuery('.order-form__time').datetimepicker({
        datepicker:false,
        format:'H:i',
        value: hours + ':00',
        minTime: hours + ':00',
        allowTimes:[
            '00:00', '01:00', '02:00',
            '03:00', '04:00', '05:00',
            '06:00', '07:00', '08:00',
            '09:00', '10:00', '11:00',
            '12:00', '13:00', '14:00',
            '15:00', '16:00', '17:00',
            '18:00', '19:00', '20:00',
            '21:00', '22:00', '23:00',
        ]
    });

    // if( $('.order-form__date').length > 0 ) {
    //     var hours = new Date().getHours() + 12;
    //     var days = $('.order-form__date').datetimepicker('getValue').getDate();
    //     if( hours > 24 ) {
    //         hours = hours - 24;
    //         days += 1;
    //         $('.order-form__date').datetimepicker({value:'+1970/01/05', minDate:'+1970/01/05'});
    //     }
    //     $('.order-form__time').val(hours + ':00');
    //     if( hours == 24 ) {
    //         $('.order-form__time').val('00:00');
    //     }
    // }

    $(function() {
        jQuery('#order-btn2').on('click', function() {
            jQuery.fancybox.open(jQuery('#order-modal'));
        });
    });

    $('#order-btn').on('click', function() {
        if( $('.order-form__input-pages input').val() <= 150 ) {
            jQuery.fancybox.open(jQuery('#order-modal'));
        }else{
            $('.order-form__input-pages .order-form__required').fadeIn();
            setTimeout(function() {
                $('.order-form__required').fadeOut();
            }, 2000);
        }
    });

    if( $('.order-slider__inner').length > 0 ) {
        $('.order-slider__inner').slick({
            dots: true,
            arrows: false,
            autoplay: true,
            autoplaySpeed: 4000,
        });
    }

    $('#slick-slide-control00').text('step 1');
    $('#slick-slide-control01').text('step 2');
    $('#slick-slide-control02').text('step 3');


    $('.btn-step1').on('click', function() {
        $(this).hide();
        $('.order-form__step_second').fadeIn();
        $('.order-form__step_second').css({
            'transform': 'translateY(0)'
        });
        var offsetTop = $(window).scrollTop();
        $('html, body').animate({
            scrollTop: offsetTop + 200
        }, 300);
    });

    $('.btn-step2').on('click', function() {
        if( $('.order-form__input-pages input').val() <= 150 ) {
            $(this).hide();
            $('.order-form__step_third').fadeIn();
            $('.order-form__step_third').css({
                'transform': 'translateY(0)'
            });
            var offsetTop = $(window).scrollTop();
            $('html, body').animate({
                scrollTop: offsetTop + 200
            }, 300);
        }else{
            $('.order-form__input-pages .order-form__required').fadeIn();
            setTimeout(function() {
                $('.order-form__required').fadeOut();
            }, 2000);
        }
    });

    // $('.order-form select').select2();

    let fields = document.querySelectorAll('input[type=number]');

    fields.forEach(function(el) {
        let placeholder = el.placeholder;

        el.onfocus = function() {
            el.placeholder = '';
        }

        el.onblur = function() {
            el.placeholder = placeholder;
        }

        el.onkeypress = function (event) {
            event = event || window.event;
            if (event.charCode && (event.charCode < 48 || event.charCode > 57)) {
                return false;
            }
        }
    })

    function formateDate(date) {
        var d = date;
        d = [
            '' + d.getFullYear(),
            '0' + (d.getMonth() + 1),
            '0' + d.getDate(),
            '0' + d.getHours(),
            '0' + d.getMinutes()
        ];
        for (var i = 0; i < d.length; i++) {
            d[i] = d[i].slice(-2);
        }
        return d.slice(0, 3).join('-') + ' ' + d.slice(3).join(':');
    }

    $('#order-modal button').on('click', function (e) {
        e.preventDefault();

        var time = formateDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 14));
        var deadlineDate = $('.order-form__date').val().split('.'),
            year = deadlineDate[2],
            month = deadlineDate[1],
            day = deadlineDate[0];

        var deadlineTime = encodeURIComponent($('.order-form__time').val());
        var date = year + '-' + month + '-' + day + '+' + deadlineTime;

        var link = 'https://my.syracusecoe.org';

        if( $('input[name="foc_u_email"]').val() != '' ) {
            link += '/fast-order?foc_u_email=' + $('input[name="foc_u_email"]').val();
        }else {
            link += '/fast-order?';
        }

        link += '&foc_o_paper_type=' + $('select[name="foc_o_paper_type"]').val();
        link += '&foc_o_name=' + encodeURIComponent($('input[name="foc_o_name"]').val());
        link += '&foc_o_subject=' + $('select[name="foc_o_subject"]').val();
        link += '&foc_o_pages=' + $('input[name="foc_o_pages"]').val();
        link += '&foc_o_service=' + $('input[name="foc_o_service"]:checked').val();
        link += '&foc_o_style=' + $('select[name="foc_o_style"]').val();
        link += '&foc_o_deadline=' + date;
        link += '&foc_o_sources=' + $('input[name="foc_o_sources"]').val();
        link += '&foc_o_desc=' + encodeURIComponent($('textarea[name="foc_o_desc"]').val());
        link += '&utm_source=syracusecoe.org&utm_campaign=custom-OF&utm_medium=ch_z&utm_term=order-now';

        if( $('input[name="foc_u_email"]').val() != '' ) {
            link += '&utm_content=fast-order';
        }else {
            link += '&utm_content=order_fast-order';
        }

        window.location.href = link;
    });

    // Hide text above order form on mobile

    $('.order__info-additional').addClass('hide-mobile');
    $('.order__more-toggle').on('click', function() {
        $('.order__info-additional').toggleClass('hide-mobile');
    });

    $('.order__show-more').text('Show More').click(function(e) {
        e.preventDefault();
        $(this).text($(this).text() == 'Show More' ? "Show Less" : "Show More");
    });
    // Hide text above order form on mobile END

}(jQuery));




