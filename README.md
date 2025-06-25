# Panel Date Format for GNOME Shell

Allows you to fully customize the date and time format in the GNOME panel through an easy-to-use graphical interface.

**Note:** You should replace the screenshot below with a new one showing your updated settings panel!

![New Settings Panel](./screenshot.png?raw=true)

## Features

*   **Easy-to-use graphical settings:** No more command-line editing required!
*   Toggle display elements like the weekday, date, and seconds.
*   Switch between 24-hour and 12-hour (AM/PM) clock formats.
*   Choose the order: display the date first or the time first.
*   **Advanced Mode:** A separate option for power users to input a custom `strftime` format string for maximum control.

## How to Configure

1.  Open the **Extensions** application.
2.  Find "Panel Date Format" in your list of installed extensions.
3.  Click on settings to open the preferences window.

### Display Options (Easy Mode)

By default, you can use the simple switches and dropdowns to build your preferred format:

*   **Show Day of the Week:** Toggles showing names like `Mon`, `Tue`, etc.
*   **Show Date:** Toggles showing the month and day, like `Oct 27`.
*   **Show Seconds:** Toggles the seconds in the time display.
*   **Use 12-Hour Clock:** Switches between `14:30` and `02:30 PM`.
*   **Display Order:** Lets you choose between `Date, Time` and `Time, Date`.

### Advanced Mode

If the options above are not enough, you can use a custom format string:

1.  In the settings window, find the **Advanced** section.
2.  Enable the **Use Custom Format String** switch. This will disable the easy mode options.
3.  Enter your desired format string in the text box that appears.

The format strings for the Advanced Mode follow the `strftime()` syntax. You can find a complete list of available format specifiers in the [GLib.DateTime format documentation](https://docs.gtk.org/glib/method.DateTime.format.html).

**Examples for Advanced Mode:**
*   `%Y-%m-%d %H:%M`  →  `2023-10-27 14:30`
*   `%A, %B %d`       →  `Friday, October 27`
*   `%I:%M:%S %p`     →  `02:30:45 PM`

## Installation

This repository is intended for development. For regular installation, please get this extension from the official [GNOME Extensions website](https://extensions.gnome.org/extension/1462/panel-date-format/).