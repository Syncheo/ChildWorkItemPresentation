define([
    "dojo/_base/declare",
    "dijit/form/DateTextBox"
], function(declare, DateTextBox) {
    // utilitaires (ES5)
    function pad(n, len) {
        n = String(n);
        while (n.length < (len || 2)) { n = "0" + n; }
        return n;
    }

    function formatWithOffset(date) {
        if (!date) { return ""; }
        // date components (local time fields)
        var y = date.getFullYear();
        var M = pad(date.getMonth() + 1);
        var d = pad(date.getDate());
        var hh = pad(date.getHours());
        var mm = pad(date.getMinutes());
        var ss = pad(date.getSeconds());
        var ms = pad(date.getMilliseconds(), 3);

        // timezone offset in minutes: getTimezoneOffset returns minutes *behind* UTC
        // we want sign and hours/min like +0100
        var offsetMin = -date.getTimezoneOffset(); // positive for UTC+1
        var sign = offsetMin >= 0 ? "+" : "-";
        var absOff = Math.abs(offsetMin);
        var offH = pad(Math.floor(absOff / 60));
        var offM = pad(absOff % 60);

        return y + "-" + M + "-" + d + "T" + hh + ":" + mm + ":" + ss + "." + ms + sign + offH + offM;
    }

    function parseCustomIso(str) {
        if (!str || typeof str !== "string") { return null; }
        // Regex for 2025-11-04T11:14:31.643+0100
        var m = str.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{1,3})([+-])(\d{2})(\d{2})$/);
        if (!m) { return null; }

        var year = parseInt(m[1], 10);
        var month = parseInt(m[2], 10) - 1;
        var day = parseInt(m[3], 10);
        var hour = parseInt(m[4], 10);
        var minute = parseInt(m[5], 10);
        var second = parseInt(m[6], 10);
        var millisecond = parseInt(pad(m[7], 3), 10); // normalize ms to 3 digits
        var sign = m[8];
        var offH = parseInt(m[9], 10);
        var offM = parseInt(m[10], 10);
        var offsetMinutes = offH * 60 + offM;

        // Build UTC ms from the given local-with-offset components
        // Date.UTC gives the timestamp for that moment assuming the fields are UTC.
        // But the input is a local time with an explicit offset.
        // UTCms = Date.UTC(fields) - (offsetMinutes * sign) * 60000
        var utcMs = Date.UTC(year, month, day, hour, minute, second, millisecond);
        var tzSign = (sign === "+") ? 1 : -1;
        // When sign is '+0100', the local time is UTC + 60min, so UTC = local - 60min
        utcMs -= tzSign * offsetMinutes * 60 * 1000;

        return new Date(utcMs);
    }

    return declare("custom.widgets.CustomDateTextBox", [DateTextBox], {
        // override format (Date -> string)
        format: function(date, constraints) {
            // dijit/form/DateTextBox sometimes passes undefined/null
            if (!date) { return ""; }
            try {
                return formatWithOffset(date);
            } catch (e) {
                // fallback to default behavior
                return this.inherited(arguments);
            }
        },

        // override parse (string -> Date)
        parse: function(value, constraints) {
            if (!value) { return null; }
            // try custom parser first
            var parsed = parseCustomIso(value);
            if (parsed) { return parsed; }
            // fallback to inherited parser (uses locale)
            return this.inherited(arguments);
        },

        // keep tokenization/validation behavior as DateTextBox expects
        // optionally override constraints default if you want to force rendering behavior
        _setValueAttr: function(value, priorityChange) {
            // accept Date or ISO string
            var d = value;
            if (typeof value === "string") {
                d = this.parse(value, this.constraints);
            }
            this.inherited(arguments, [d, priorityChange]);
        }
    });
});
