# BORN Megamenu #

Allows to create mega menu functionality, featuring events, callbacks, and accessibility settings.

## Options and Callbacks ##

**menuSelector**: [String] [**REQUIRED**] Selector for the menu/navigation container.

**triggerSelector**: [String] [**REQUIRED**] Selector for the menu's triggers, i.e. the elements that you click or action on to open further navigation containers.

**targetSelector**: [String] [**REQUIRED**] Selector for the trigger's target container, i.e. the container that should appear after actioning on a trigger.

**events**: [String] *Default: 'touchstart click mouseenter'*. List of events the 'trigger' should listen to. Add a space between each event to specify more than one.

**keyBindings**: [Array] *Default: [13] (Enter key)*. Array of keyboard keyCodes to listen to when a navigation trigger is focused. Either the "keydown" or "keyup" events must be set on the `events` property.

**waitForTransition**: [Object | Boolean] Object containing `selector` and `property` values to determine if the `Menu` should be activated after a transition period is completed. Set to **false** to activate the Menu immediately after a trigger is actioned on.

**waitForTransition.selector**: [String] *Default: targetSelector's value*. Waits until the transition property specified in `waitForTransition.property` finishes on the matched `waitForTransition.selector` before setting the `Menu` as active.
**waitForTransition.property**: [String]

**clickThroughSelector**: [String] By default, Megamenu cancels (evt.preventDefault) link following on anchor tags that are also 'triggers'. You can specify a class name to force Megamenu to follow the link on click. **Note:** touch taps on anchor triggers will always be cancelled.

**unsetSiblingsSelector**: [String] When an element matching this selector is triggered, unset all of the element's relative (same level) menu items.

**unsetOnMouseleave**: [Boolean] *Default: true*. Unsets the Menu after hovering out of it. Set to **false** to keep Menu active.

**unsetOnClickOut**: [Boolean] *Default: false*. Unsets the Menu after clicking out of it.

**hoverDelay**: [Integer] *Default: 0*. When hovering, set a wait time (in milliseconds) before setting the 'trigger' and 'target' as active after hovering out of it.

**responsive**: [Object] Specify settings for specific breakpoints. This is great for when you need different viewports to have different functionality.  

Parameters:  
*breakpoint*:  [Integet] Number referencing the **max-width** these 'settings' will apply to.  
*settings*: [Object] Specify settings in the form of key: value. All options and callbacks available on Megamenu can be applied here.

**afterMenuSet**: [function] Runs every time the menu is initially set.

**afterMenuUnset**: [function] Runs every time the menu is closed (unset).

**beforeTriggerSet**: [function] Runs every time a 'trigger' is actioned on (set).

**afterTriggerUnset**: [function] Runs every time a 'trigger' is unset, i.e. before a *relative* trigger is set.

## Extras ##

–You can add the 'data-menu-close' attribute to an element inside a navigation 'target' container if you need to have a way to close (unset) the current navigation. This is specially useful on touch devices.  
–Also on touch devices, tapping on an active (set) 'trigger' will cause the same 'trigger' to be closed (unset).

## Usage ##

    var myMenu = new Megamenu({
        menuSelector: '.navigation',
        triggerSelector: '.navigation__trigger',
        targetSelector: '.navigation__target',
        clickThroughSelector: '.lvl1-anchor',
        unsetSiblingsSelector: '.no-submenu',
        hoverDelay: 150,
        afterMenuSet: function(trigger) { ... },
        responsive: [
            {
                breakpoint: 767,
                settings: {
                    events: 'click',
                    unsetOnMouseleave: false,
                    clickThroughSelector: false
                }
            }
        ]
    });