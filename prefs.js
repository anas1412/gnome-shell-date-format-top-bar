'use strict';

const { Adw, Gio, Gtk, GObject } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;

// Helper function to create a compatible switch row
function createSwitchRow(title, settings, key) {
    const row = new Adw.ActionRow({ title: title });
    const aSwitch = new Gtk.Switch({
        active: settings.get_boolean(key),
        valign: Gtk.Align.CENTER,
    });
    settings.bind(key, aSwitch, 'active', Gio.SettingsBindFlags.DEFAULT);
    row.add_suffix(aSwitch);
    row.activatable_widget = aSwitch;
    return row;
}


const PanelDateFormatPrefsWidget = GObject.registerClass(
class PanelDateFormatPrefsWidget extends Adw.PreferencesPage {
    _init(settings) {
        super._init();
        this._settings = settings;

        // --- Basic Settings Group ---
        const basicGroup = new Adw.PreferencesGroup({
            title: 'Display Options',
            description: 'Configure the date and time display using the options below.',
        });
        this.add(basicGroup);

        const weekdayRow = createSwitchRow('Show Day of the Week', this._settings, 'show-weekday');
        basicGroup.add(weekdayRow);

        const dateRow = createSwitchRow('Show Date', this._settings, 'show-date');
        basicGroup.add(dateRow);

        const secondsRow = createSwitchRow('Show Seconds', this._settings, 'show-seconds');
        basicGroup.add(secondsRow);

        const clock12hRow = createSwitchRow('Use 12-Hour Clock (AM/PM)', this._settings, 'use-12h-clock');
        basicGroup.add(clock12hRow);

        const orderRow = new Adw.ActionRow({
            title: 'Display Order',
        });
        const orderOptions = ['Date, then Time', 'Time, then Date'];
        
        // --- THIS IS THE FIX ---
        // Create an empty list, then append items to it. This is universally compatible.
        const orderModel = new Gtk.StringList();
        orderOptions.forEach(opt => orderModel.append(opt));
        // --- END OF FIX ---
        
        const orderDropdown = new Gtk.DropDown({
            model: orderModel,
            valign: Gtk.Align.CENTER,
        });
        
        orderDropdown.connect('notify::selected', () => {
            const selectedValue = orderDropdown.selected === 0 ? 'date-time' : 'time-date';
            this._settings.set_string('date-order', selectedValue);
        });
        const currentOrder = this._settings.get_string('date-order');
        orderDropdown.selected = (currentOrder === 'date-time' ? 0 : 1);
        
        orderRow.add_suffix(orderDropdown);
        orderRow.activatable_widget = orderDropdown;
        basicGroup.add(orderRow);


        // --- Advanced Settings Group ---
        const advancedGroup = new Adw.PreferencesGroup({
            title: 'Advanced',
            description: 'For advanced users who want to specify a custom format string.',
        });
        this.add(advancedGroup);

        const useCustomRow = createSwitchRow('Use Custom Format String', this._settings, 'use-custom-format');
        advancedGroup.add(useCustomRow);

        const customFormatRow = new Adw.ActionRow({
            title: 'Custom Format String',
        });
        const customFormatEntry = new Gtk.Entry({
            hexpand: true,
            halign: Gtk.Align.END,
            valign: Gtk.Align.CENTER,
            placeholder_text: '%a, %H:%M',
        });
        customFormatRow.add_suffix(customFormatEntry);
        customFormatRow.activatable_widget = customFormatEntry;
        this._settings.bind('custom-format', customFormatEntry, 'text', Gio.SettingsBindFlags.DEFAULT);
        advancedGroup.add(customFormatRow);

        const updateSensitivity = () => {
            const useCustom = this._settings.get_boolean('use-custom-format');
            basicGroup.set_sensitive(!useCustom);
            customFormatRow.set_sensitive(useCustom);
        };
        
        this._settings.connect('changed::use-custom-format', updateSensitivity);
        updateSensitivity();
    }
});

function buildPrefsWidget() {
    return new PanelDateFormatPrefsWidget(ExtensionUtils.getSettings());
}

function init() {}