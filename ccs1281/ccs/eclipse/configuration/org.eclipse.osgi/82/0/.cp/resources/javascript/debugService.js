importPackage(Packages.org.eclipse.core.runtime)
importPackage(Packages.com.ti.ccstudio.scripting.gss)

/**
 * Add a directory to the launch configuration source search path or to the common source search path.
 * @param launchConfig [optional] if  provided, than the directory will be added to the specified launch configuration, otherwise, to the common source search path.
 * @param directory the directory to add.
 * @param searchSubfolders true to search sub-folders, otherwise false.
 * @service CCS UI Scripting Commands
 */
function addSrcSearchPath() {
	var argCount = arguments.length;
	
	if (argCount == 2) {
		// common source lookup
		if ((typeof(arguments[0]) == "string") && (typeof(arguments[1]) == "boolean")) {
			activeWB.getSourceLookupService().addCommonFileSystemDirectory(arguments[0], arguments[1]);
			return;
		}
	} else if (argCount == 3) {
		print("Unsupported function addSrcSearchPath(string, string, boolean).");
		print("Please, post a feature request to http://e2e.ti.com/support/development_tools/code_composer_studio/default.aspx");
//		// launch configuration source lookup
//		if ((typeof(arguments[0]) == "string") && (typeof(arguments[1]) == "string") &&  (typeof(arguments[2]) == "boolean")) {
//			activeWB.getDebugService().addSrcSearchPath(arguments[0], arguments[1],  arguments[2]);
//			return;
//		}
		return;
	}
	
	throw "Invalid arguments";
}

/**
 * Start a CCS debug session for a project, if there is more than one compatible core for the project,
 * than the binary will be loaded onto all cores. 
 * @param project the name of the project to debug.
 * @param stackframe [optional] if provided, than this API will wait until the program halted at this stackframe.
 * @service CCS UI Scripting Commands
 */
function debugProject() {
	var argCount = arguments.length;

	contexts = DebugContextsFactory.getInstance().createContexts(arguments[0]);
	activeWB.getDebugService().createLaunchConfig(contexts);
	
	if (argCount == 2) {
		debugView = activeWB.openView(debugViewId);
		cs = contexts.getContexts();
		for (var i = 0; i < cs.length; i++) {			
			cs[i].setTopStackframe(arguments[1]);
		}
	}	
	
	activeWB.getDebugService().debug(contexts);	
}

/**
 * Start a CCS debug session with a target configuration file.
 * @param launchConfigName the name of the launch configuration to create for this debug session.
 * @param targetConfigPath the fullpath of the target configuration file.
 * @service CCS UI Scripting Commands
 */
function debug(launchConfigName, targetConfigPath) {
	contexts = DebugContextsFactory.getInstance().createContexts(launchConfigName, new Path(targetConfigPath));
	activeWB.getDebugService().createLaunchConfig(contexts);
	activeWB.getDebugService().debug(contexts);
}

/**
  * Set the given target configuration in the Target Configuration view to default.
  * @param path a relative path of the target configuration file, if project name is provided, than the path 
  *        will be search from the 'Project' folder, otherwise it will be search from the 'User Defined' folder. 
  * @param project [optional] the project that contains the target configuration file.
  * @service CCS UI Scripting Commands
  */
function setDefaultTargetConfig() {
	var argCount = arguments.length;
	
	if (argCount == 1) {
		activeWB.openView(targetConfigViewId).setDefaultTargetConfig(arguments[0]);
		return;
	} else if (argCount == 2) {
		activeWB.openView(targetConfigViewId).setDefaultTargetConfig(arguments[0], arguments[1]);
		return;
	}
	
	throw "Invalid arguments";
}

/**
 * Retrieves the current selections from the Debug View and calls DebugServer.openSession()
 * for each debug context.
 * @return An array of Debug Session objects, can be empty.
 * @service CCS UI Scripting Commands
 */
function getSelectedDebugSessions() {
	var coreNames = activeWB.openView(debugViewId).getSelectedCCSCores();
	var sessions = new Array();
	for (var i = 0; i < coreNames.length; i++) {			
		sessions[i] = ds.openSession(coreNames[i]);
	}	
	return sessions;
}