jQuery.sap.declare("sap.app.localstorage");

/*
 * Use window.localStorage to store user preferences per browser. The user can define preferences (as backend type) in
 * the settings dialog.
 */
sap.app.localStorage = {

    PREF_SHOW_WELCOME: "preferences.welcome",
    PREF_TILE_HELP_SHOW_PREFIX: "preferences.tile.help.",

    storePreference: function(sKey, value) {
        if (window.localStorage) {
            localStorage.setItem(sKey, value);
            return value;
        } else {
            return null;
        }
    },
    /*
     * Returns window.localStorage value for item sKey. If window.localStorage does not exists or no value for sKey is
     * stored then 'true' is returned.
     */
    getPreference: function(sKey) {
        if (window.localStorage) {
            var storedValue = localStorage.getItem(sKey);
            if (storedValue) {
                return (storedValue);
            } else {
                return true;
            }
        } else {
            return true;
        }
    },

};