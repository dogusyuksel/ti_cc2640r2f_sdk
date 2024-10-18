/** 
 * Add an entry to the hot menu to execute a GEL command. The entry appears only in the hot menu for the perspective specified.
 * @param arg0 the menu path (e.g. "command_1", "sub_menu_1/command_1", "sub_menu_1/sub_menu_2/command_2")
 * @param arg1 the GEL command to associate with the menu entry.
 * @param arg2 the perspective that the entry is applied to (string) or boolean to persist the command in the menu (boolean).  If a perspective is not specified, the GEL command is added to all perspectives.
 * @param arg3 boolean to persist the command in the menu (boolean) if and only if arg2 is a string.
 * @return none.
 *
 * @service System Hot Menu Commands
 */
function hotmenu_addGel() {
	var argCount = arguments.length;
	if (argCount == 4) {
		// 
		if ((typeof(arguments[2]) == "string") && (typeof(arguments[3]) == "boolean")) {
			return hotmenu.addGEL(arguments[2], arguments[0], arguments[1], arguments[3]);
		}
	} else if (argCount == 3) {
		if (typeof(arguments[2]) == "string") {
			return hotmenu.addGEL(arguments[2], arguments[0], arguments[1]);
		}
		if (typeof(arguments[2]) == "boolean") {
			return hotmenu.addGEL(arguments[0], arguments[1], arguments[2]);
		}
	} else if (argCount == 2) {
			return hotmenu.addGEL(arguments[0], arguments[1]);
	}
	throw  "Invalid arguments.";
}

/** 
 * Add an entry to the hot menu to execute a Java script. The entry appears only in the hot menu for the perspective specified.
 * @param arg0 the menu path (e.g. "script_1", "sub_menu_1/script_1", "sub_menu_1/sub_menu_2/script_2", etc.)
 * @param arg1 the name of the Java script to associate with the menu entry.
 * @param arg2 can be the perspective that the entry is applied to (string) or boolean to persist the script in the menu (boolean).  If a perspective is not specified, the Java script is added to all perspectives.
 * @param arg3 boolean to persist the script in the menu (boolean) if and only if arg2 is a string.
 * @return none.
 *
 * @service System Hot Menu Commands
 */
function hotmenu_addScript() {
	var argCount = arguments.length;
	if (argCount == 4) {
		// 
		if ((typeof(arguments[2]) == "string") && (typeof(arguments[3]) == "boolean")) {
			return hotmenu.addScript(arguments[2], arguments[0], arguments[1], arguments[3]);
		}
	} else if (argCount == 3) {
		if (typeof(arguments[2]) == "string") {
			return hotmenu.addScript(arguments[2], arguments[0], arguments[1]);
		}
		if (typeof(arguments[2]) == "boolean") {
			return hotmenu.addScript(arguments[0], arguments[1], arguments[2]);
		}
	} else if (argCount == 2) {
			return hotmenu.addScript(arguments[0], arguments[1]);
	}
	throw  "Invalid arguments."
	
}

/** 
 * Add an entry to the hot menu to execute a Java script function. The entry appears only in the hot menu for the perspective specified.
 * @param arg0 the menu path (e.g. "script_1", "sub_menu_1/script_1", "sub_menu_1/sub_menu_2/script_2", etc.)
 * @param arg1 the name of the Java script function to associate with the menu entry.
 * @param arg2 the perspective that the entry is applied to (string) or boolean to persist the Java script function in the menu (boolean). If a perspective is not specified, the Java script function is added to all perspectives.
 * @param arg3 boolean to persist the Java script function in the menu (boolean) if and only if arg2 is a string.
 * @return none.
 *
 * @service System Hot Menu Commands
 */
function hotmenu_addJSFunction() {
	var argCount = arguments.length;
	if (argCount == 4) {
		// 
		if ((typeof(arguments[2]) == "string") && (typeof(arguments[3]) == "boolean")) {
			return hotmenu.addJSFunction(arguments[2], arguments[0], arguments[1], arguments[3]);
		}
	} else if (argCount == 3) {
		if (typeof(arguments[2]) == "string") {
			return hotmenu.addJSFunction(arguments[2], arguments[0], arguments[1]);
		}
		if (typeof(arguments[2]) == "boolean") {
			return hotmenu.addJSFunction(arguments[0], arguments[1], arguments[2]);
		}
	} else if (argCount == 2) {
			return hotmenu.addJSFunction(arguments[0], arguments[1]);
	}
	throw  "Invalid arguments.";

}

/** 
 * Remove an entry from the hot menu for a specific perspective.
 * @param arg0 the menu path for the entry to be removed (e.g. "command_1", "sub_menu_1/command_1", "sub_menu_1/sub_menu_2/command_2")
 * @param arg1 the perspective that the change is applied to (string) or boolean to persist the change (boolean). If a perspective is not specified, the entry is removed from all perspectives.
 * @param arg2 boolean to persist the change if and only if arg1 is a string
 * @return none.
 *
 * @service System Hot Menu Commands
 */
function hotmenu_remove() {
	var argCount = arguments.length;
	if (argCount == 3) {
		// 
		if ((typeof(arguments[1]) == "string") && (typeof(arguments[2]) == "boolean")) {
			return hotmenu.remove(arguments[1], arguments[0], arguments[2] );
		}
	} else if (argCount == 2) {
		if (typeof(arguments[1]) == "string") {
			return hotmenu.remove(arguments[1], arguments[0]);
		}
		if (typeof(arguments[1]) == "boolean") {
			return hotmenu.remove(arguments[0], arguments[1]);
		}
	} else if (argCount == 1) {
		return hotmenu.remove(arguments[0]);
	}
	throw  "Invalid arguments.";
}

/** 
 * Remove all entries from the hot menu for a specific perspective.
 * @param arg0 the perspective that all entries are removed from or (string) or boolean to persist the change (boolean).
 * If a perspective is not specified, all entries are removed from all perspectives.
 * @param arg1 boolean to persist the change (boolean) if and only if arg0 is a string
 *
 * @return none.
 * @service System Hot Menu Commands
 */
function hotmenu_removeAll() {
	var argCount = arguments.length;
	if (argCount == 2) {
		// 
		if ((typeof(arguments[0]) == "string") && (typeof(arguments[1]) == "boolean")) {
			return hotmenu.removeAll(arguments[0], arguments[1]);
		}
	} else if (argCount == 1) {
		if (typeof(arguments[0]) == "string") {
			return hotmenu.removeAll(arguments[0]);
		}
		if (typeof(arguments[0]) == "boolean") {
			return hotmenu.removeAll(arguments[0]);
		}
	} else if (argCount == 0) {
		return hotmenu.removeAll();
	}
	throw  "Invalid arguments.";
}

 