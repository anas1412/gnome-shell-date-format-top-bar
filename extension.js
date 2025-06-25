const { GLib, St, Clutter, Pango } = imports.gi;
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;

let originalClockDisplay;
let formatClockDisplay;
let settings;
let timeoutID = 0;
// Store all setting connection IDs to disconnect them later
let settingsConnections = []; 

function enable() {
    originalClockDisplay = Main.panel.statusArea.dateMenu._clockDisplay;
    formatClockDisplay = new St.Label({ style_class: "clock" });
    formatClockDisplay.clutter_text.y_align = Clutter.ActorAlign.CENTER;
    formatClockDisplay.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;

    settings = ExtensionUtils.getSettings();

    originalClockDisplay.hide();
    originalClockDisplay
        .get_parent()
        .insert_child_below(formatClockDisplay, originalClockDisplay);
    
    // Connect to changes for all relevant settings
    const keys = [
        'use-custom-format', 'custom-format', 'show-weekday', 'show-date', 
        'show-seconds', 'use-12h-clock', 'date-order'
    ];
    for (const key of keys) {
        const id = settings.connect(`changed::${key}`, () => tick());
        settingsConnections.push(id);
    }

    tick(); // Initial update
    timeoutID = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 1, () => {
        tick();
        return GLib.SOURCE_CONTINUE;
    });
}

function disable() {
    // Disconnect all settings listeners
    for (const id of settingsConnections) {
        settings.disconnect(id);
    }
    settingsConnections = [];
    
    if (timeoutID) {
        GLib.Source.remove(timeoutID);
        timeoutID = 0;
    }

    if (formatClockDisplay) {
        originalClockDisplay.get_parent().remove_child(formatClockDisplay);
        formatClockDisplay.destroy();
        formatClockDisplay = null;
    }
    originalClockDisplay.show();
    
    settings = null;
}

/**
 * Builds the format string based on user preferences.
 * @returns {string} The final format string for GLib.DateTime.format().
 */
function getFormatString() {
    // If user wants a custom format, just return that.
    if (settings.get_boolean('use-custom-format')) {
        return settings.get_string('custom-format');
    }

    // --- Build the format string dynamically ---
    let timeParts = [];
    if (settings.get_boolean('use-12h-clock')) {
        timeParts.push('%I:%M'); // 12-hour
    } else {
        timeParts.push('%H:%M'); // 24-hour
    }

    if (settings.get_boolean('show-seconds')) {
        timeParts.push(':%S');
    }

    if (settings.get_boolean('use-12h-clock')) {
        timeParts.push(' %p'); // AM/PM
    }

    const timeFormat = timeParts.join('');

    let dateParts = [];
    if (settings.get_boolean('show-weekday')) {
        dateParts.push('%a'); // Short day name (e.g., Mon)
    }
    if (settings.get_boolean('show-date')) {
        dateParts.push('%b %d'); // Short month and day (e.g., Oct 27)
    }
    const dateFormat = dateParts.join(' ');
    
    // --- Combine date and time based on order preference ---
    const order = settings.get_string('date-order');
    let finalFormat;

    if (order === 'time-date') {
        finalFormat = [timeFormat, dateFormat];
    } else { // Default to 'date-time'
        finalFormat = [dateFormat, timeFormat];
    }

    // Join the parts with a comma and space, but only if both parts exist.
    return finalFormat.filter(part => part).join(', ');
}


function tick() {
    const format = getFormatString();
    const time = GLib.DateTime.new_now_local();
    formatClockDisplay.set_text(time.format(format) || ''); // Use empty string if format is empty
}

function init() {}