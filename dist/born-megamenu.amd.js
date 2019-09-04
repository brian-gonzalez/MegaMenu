define(['exports', '@borngroup/born-utilities'], function (exports, _bornUtilities) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var Megamenu = function () {
        function Megamenu(options) {
            _classCallCheck(this, Megamenu);

            this.options = options || {};

            this.setProperties();

            this.menu = typeof this.options.menuSelector === 'string' ? document.querySelector(this.options.menuSelector) : this.options.menuSelector;

            if (!this.menu) {
                console.warn('Could not find target element');
                return;
            }

            this._beforeItemSet = this.options.beforeItemSet || function () {};
            this._afterItemSet = this.options.afterItemSet || function () {};
            this._afterMenuSet = this.options.afterMenuSet || function () {};
            this._afterItemUnset = this.options.afterItemUnset || function () {};
            this._afterMenuUnset = this.options.afterMenuUnset || function () {};

            var triggers = this.menu.querySelectorAll(this.options.triggerSelector);

            [].forEach.call(triggers, this.setupNavigation.bind(this));

            this.menu.addEventListener('mousemove', this.getCursorSpeed.bind(this));

            /**
             * Determines if 'menu' should be closed when hovering or clicking out of it.
             * This can be set on a breakpoint basis, so that the 'menu' is not closed when tapping out.
             */
            if (this.options.unsetOnMouseleave) {
                this.menu.addEventListener('mouseleave', this.unsetRelatives.bind(this));
            }

            if (this.options.unsetOnClickOut) {
                document.addEventListener('click', function (evt) {
                    if (this.menu.isActive && !this.menu.contains(evt.target)) {
                        this.unsetRelatives();
                    }
                }.bind(this));
            }

            this.menu.addEventListener('click', this.closeTargetHandler.bind(this));

            this.menu.addEventListener('keydown', function (evt) {
                if (evt.keyCode === 13 && evt.target.hasAttribute('data-menu-close')) {
                    var lastItemActive = this.getLastActiveItem();

                    this.closeTargetHandler(evt);

                    //Sets the focus back to the original trigger.
                    if (lastItemActive) {
                        lastItemActive.focus();
                    }
                }
            }.bind(this));
        }

        /**
         * Calculates the speed at which the cursor is moving inside the 'menu'.
         * If the curve is too fast and skewed (meaning not vertical/horizontal), then the hover action will be ignored.
         * @param  {[Object]} evt ['mousemove' event object]
         */


        _createClass(Megamenu, [{
            key: 'getCursorSpeed',
            value: function getCursorSpeed(evt) {
                var newX = Math.abs(evt.clientX),
                    newY = Math.abs(evt.clientY),
                    diffX = Math.abs((this._origX || 0) - newX),
                    diffY = Math.abs((this._origY || 0) - newY);

                this._origX = newX;
                this._origY = newY;

                this.isMouseMoveFast = diffX / diffY >= 0.5 ? true : false;
            }
        }, {
            key: 'setProperties',
            value: function setProperties() {
                this.options.events = this.options.events || 'touchstart click mouseenter';
                this.options.menuActiveClass = this.options.menuActiveClass || 'mega--active';
                this.options.itemActiveClass = this.options.itemActiveClass || 'mega-item--active';

                this.options.waitForTransition = this.options.hasOwnProperty('waitForTransition') ? this.options.waitForTransition : {};
                this.options.waitForTransition.selector = this.options.waitForTransition.selector || this.options.targetSelector;
                this.options.waitForTransition.property = this.options.waitForTransition.property || 'all';

                this.options.unsetOnMouseleave = this.options.hasOwnProperty('unsetOnMouseleave') ? this.options.unsetOnMouseleave : true;
                this.options.disableUnsetSelf = this.options.disableUnsetSelf || undefined;
                this.options.hoverDelay = this.options.hoverDelay || 0;
                this.options.keyBindings = this.options.keyBindings || [13];

                //Loops through the responsive array
                //to replace default settings with breakpoint specific settings. 
                if (this.options.responsive) {
                    this.options.responsive.sort(lowestBreakpoint);

                    //Not using forEach cause can't kill the loop.
                    for (var i = 0; i < this.options.responsive.length; i++) {
                        if (updateProperty.call(this, this.options.responsive[i])) {
                            break;
                        }
                    }
                }

                /**
                 * Updates properties with ones coming from a matching breakpoint.
                 * @param  {[Object]} breakpointOpts literal with all breakpoint specific settings
                 * @return {[Boolean]}
                 */
                function updateProperty(breakpointOpts) {
                    if (window.innerWidth <= breakpointOpts.breakpoint) {
                        for (var key in breakpointOpts.settings) {
                            this.options[key] = breakpointOpts.settings[key];
                        }

                        return true;
                    }

                    return false;
                }

                function lowestBreakpoint(a, b) {
                    return a.breakpoint > b.breakpoint;
                }
            }
        }, {
            key: 'setupNavigation',
            value: function setupNavigation(trigger) {
                trigger.megamenu = {
                    disableUnsetSelf: this.options.disableUnsetSelf ? typeof this.options.disableUnsetSelf === 'string' ? trigger.classList.contains(this.options.disableUnsetSelf) : true : false
                };

                this.getParent(trigger);
                this.getTarget(trigger);

                if (trigger.megamenu.target) {
                    this.setupHandlers(trigger);
                }

                //Unsets the relative items when the listener is fired on elements with the 'unsetRelativesSelector' class
                if (trigger.matches(this.options.unsetRelativesSelector)) {
                    var eventsArray = this.options.events.split(' ');

                    eventsArray.forEach(function (currentEvt) {
                        trigger.addEventListener(currentEvt, function () {
                            this.unsetRelatives(trigger);
                        }.bind(this));
                    }.bind(this));
                }
            }
        }, {
            key: 'getParent',
            value: function getParent(trigger) {
                trigger.megamenu.parent = trigger.parentNode;

                return trigger.megamenu.parent;
            }
        }, {
            key: 'getTarget',
            value: function getTarget(trigger) {
                trigger.megamenu.target = trigger.megamenu.parent.querySelector(this.options.targetSelector);

                return trigger.megamenu.target;
            }
        }, {
            key: 'setupHandlers',
            value: function setupHandlers(trigger) {
                var scope = this,
                    eventsArray = this.options.events.split(' ');

                eventsArray.forEach(function (currentEvt) {
                    trigger.addEventListener(currentEvt, function (evt) {
                        var evtType = evt.type,
                            isTouch = evtType.indexOf('touch') >= 0,
                            isKeyboard = evtType === 'keydown' || evtType === 'keyup',
                            allowClickThrough = scope.options.clickThroughSelector && trigger.matches(scope.options.clickThroughSelector);

                        //Check if click was on an allowed element, if so allow link through.
                        if (isTouch || (trigger.nodeName === 'A' || evt.target.nodeName === 'A') && !allowClickThrough && !isKeyboard) {
                            evt.preventDefault();
                        }

                        if (evtType === 'mouseenter' || evtType === 'mouseover') {
                            var minDelay = scope.isMouseMoveFast && !scope.options.hoverDelay ? 100 : scope.options.hoverDelay;

                            //Add a delay before toggleItemActive if isMouseMoveFast is true or hoverDelay is set and the menu is not yet active
                            if (scope.isMouseMoveFast || scope.options.hoverDelay && !scope.menu.isActive) {
                                scope.overstay = window.setTimeout(function () {
                                    scope.toggleItemActive(this, true);
                                }.bind(this), minDelay);

                                return;
                            } else {
                                scope.toggleItemActive(this, true);
                            }
                        } else if (isKeyboard) {
                            //If the keyCode matches an item on the options.keyBindings array, toggle the subnavigation.
                            if (scope.options.keyBindings.indexOf(evt.keyCode) !== -1) {
                                evt.preventDefault();
                                scope.toggleItemActive(this);
                            }
                            //Prevent clicks/Enter key on "allowClickThrough" elements from opening the subnavigation.
                        } else if (evt.type !== 'click' || !allowClickThrough) {
                            scope.toggleItemActive(this);
                        }

                        //Making sure further events are not fired after touch
                        if (isTouch) {
                            evt.stopImmediatePropagation();
                        }
                    });
                });

                trigger.megamenu.parent.addEventListener('mouseleave', function () {
                    clearInterval(scope.overstay);
                });

                // trigger.megamenu.target.addEventListener('mouseleave', function() {
                //     scope.isMouseMoveFast = false;
                // });
            }
        }, {
            key: 'toggleItemActive',
            value: function toggleItemActive(trigger, isMousehover) {
                if (trigger.classList.contains(this.options.itemActiveClass)) {
                    if (!isMousehover && !trigger.megamenu.disableUnsetSelf) {
                        this.unsetRelatives(trigger);
                    }
                } else {
                    this._beforeItemSet(trigger);
                    this.unsetRelatives(trigger, this.setItemActive.bind(this));
                    this._afterItemSet(trigger);
                }
            }
        }, {
            key: 'setItemActive',
            value: function setItemActive(trigger) {
                var SCOPE = this;

                trigger.classList.add(this.options.itemActiveClass);
                trigger.megamenu.target.classList.add(this.options.itemActiveClass);
                trigger.megamenu.parent.classList.add(this.options.itemActiveClass);

                this.setLastItemActive(trigger);

                //This needs revision.
                if (!this.menu.isActive) {
                    var activeWaitEl = this.options.waitForTransition ? this.menu.querySelector(this.options.waitForTransition.selector + '.' + this.options.itemActiveClass) : false,
                        canDetectTransition = activeWaitEl && window.getComputedStyle(activeWaitEl).transitionDuration !== '0s';

                    if (canDetectTransition) {
                        activeWaitEl.addEventListener((0, _bornUtilities.whichTransition)(), transitionEndHandler);
                    } else {
                        this.setMenuActive();
                    }
                }

                function transitionEndHandler(evt) {
                    if (SCOPE.options.waitForTransition.property === evt.propertyName || SCOPE.options.waitForTransition.property === 'all') {
                        SCOPE.setMenuActive();

                        this.removeEventListener((0, _bornUtilities.whichTransition)(), transitionEndHandler);
                    }
                }
            }
        }, {
            key: 'closeTargetHandler',
            value: function closeTargetHandler(evt) {
                if (evt.target.hasAttribute('data-menu-close')) {
                    var lastItemActive = this.getLastActiveItem();

                    //If this element exists inside a MegaMenu target, close that target.
                    //Otherwise close the full menu.
                    if (evt.target.closest(this.options.targetSelector)) {
                        this.unsetRelatives(lastItemActive);
                    } else {
                        this.unsetRelatives();
                    }
                }
            }
        }, {
            key: 'setLastItemActive',
            value: function setLastItemActive(trigger) {
                this._activeItem = this._activeItem || [];

                this._activeItem.push(trigger);
            }
        }, {
            key: 'removeLastItemActive',
            value: function removeLastItemActive() {
                if (this._activeItem) {
                    this._activeItem.pop();
                }
            }
        }, {
            key: 'getLastActiveItem',
            value: function getLastActiveItem() {
                return this._activeItem && this._activeItem.length ? this._activeItem[this._activeItem.length - 1] : null;
            }
        }, {
            key: 'setMenuActive',
            value: function setMenuActive() {
                if (this.menu.querySelector('.' + this.options.itemActiveClass)) {
                    this.menu.isActive = true;
                    this.menu.classList.add(this.options.menuActiveClass);
                    this._afterMenuSet(this.menu);
                }
            }
        }, {
            key: 'unsetRelatives',
            value: function unsetRelatives(trigger, callback) {
                var commonContainer = trigger ? trigger.megamenu.parent.parentNode : this.menu,
                    activeElements = commonContainer.querySelectorAll('.' + this.options.itemActiveClass);

                [].forEach.call(activeElements, function (el) {
                    el.classList.remove(this.options.itemActiveClass);

                    //If this element is a trigger, fire _afterItemUnset.
                    if (el.megamenu) {
                        this._afterItemUnset(el);
                    }
                }.bind(this));

                this.removeLastItemActive();

                //Run callback after all relative menu items have been unset.
                if (typeof callback === 'function') {
                    callback(trigger);
                }

                //If there are no more active items, unset the nav.
                if (!this.menu.querySelector('.' + this.options.itemActiveClass)) {
                    this.menu.isActive = false;
                    this.menu.classList.remove(this.options.menuActiveClass);
                    this._afterMenuUnset(this.menu);
                }
            }
        }]);

        return Megamenu;
    }();

    exports.default = Megamenu;
});
