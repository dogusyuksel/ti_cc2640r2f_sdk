/**
 * Build the project, eg. buildProject "myProj".
 * @param project the name of the project.
 * @return whether the project is successfully built.
 * @service CCS UI Scripting Commands
 */
function buildProject(project) {
	if (arguments.length > 1)
		throw "Invalid arguments";
		
	if (project == null)
		throw "Please specific the project name";
	else if (typeof(project) != "string")
		throw "Invalid arguments";

	projectView = activeWB.openView("org.eclipse.ui.navigator.ProjectExplorer");
	return projectView.buildProject(project);
}

/**
 * Clean the project, eg. cleanProject "myProj".
 * @param project the name of the project.
 * @service CCS UI Scripting Commands
 */
function cleanProject(project) {
	if (arguments.length > 1)
		throw "Invalid arguments";
		
	if (project == null)
		throw "Invalid arguments";

	projectView = activeWB.openView("org.eclipse.ui.navigator.ProjectExplorer");
	projectView.cleanProject(project);
}

/**
 * Set the project's active build configuration.
 * @param project the name of the project.
 * @param config the configuration name, i.e "2 Release".
 * @service CCS UI Scripting Commands
 */
function setActiveBuildConfig(project, config) {
	projectView = activeWB.openView("org.eclipse.ui.navigator.ProjectExplorer");
	projectView.setActiveBuildConfig(project, config);
}