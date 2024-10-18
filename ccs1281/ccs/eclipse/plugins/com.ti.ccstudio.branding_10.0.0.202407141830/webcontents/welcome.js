/*****************************************************************
 * Copyright (c) 2020 Texas Instruments and others
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 ******************************************************************/

function request(path) {
	var xhttp  = new XMLHttpRequest();
	xhttp.open("GET", path, true);
	xhttp.send();
}

/*Set toggle to show SimpleMode or Default Mode.*/
function isSimpleModeRequest() {
	var xhttp  = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		// DONE && Successful response
		if (this.readyState == 4 && this.status == 200) {
			document.getElementById("simpleToggle").setAttribute("checked", (xhttp.response === 'true'));
		}
	};
	xhttp.open("GET", "isSimpleMode", true);
	xhttp.send();
}

isSimpleModeRequest();

document.addEventListener("checked-changed", function (e) {
	request("setSimpleMode?"+e.detail.value);
});

		
function updateTheme(theme) {
    const body = document.querySelector("body");    		
    
	if (theme.indexOf('dark') !== -1) {
		document.getElementById("devToolsIcon").setAttribute("icon", "tidevtools_grey:tidevtools");
        document.getElementById("rexIcon").setAttribute("icon", "rex_grey:tirex");
	    body.setAttribute("theme", "ti-dark");

	} else {
	    document.getElementById("devToolsIcon").setAttribute("icon", "tidevtools_red:tidevtools");
        document.getElementById("rexIcon").setAttribute("icon", "rex:tirex");
        body.setAttribute("theme", "ti-theme"); // default theme    
	}
}

document.addEventListener("theme-changed", function(e) {
	updateTheme(e.detail.theme);
});
updateTheme(window.ti && window.ti.ui && window.ti.ui.theme);
