/*****************************************************************
 * Copyright (c) 2013 Texas Instruments and others
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Patrick Chuong (Texas Instruments) - Initial API and implementation
 *****************************************************************/

var appCenter = {
	_installTooltipTimeout: 0,
	_maxTilePerSection: 20,
	_showSectionId: null,
	_productFilter: "Relevance",
	_filterTags: null,
	_appStatus: [],
	_appVersion: {},
		
	onSize: function() {
		var offset = 36;
		
		/* add groupping to categories */
		if (this._showSectionId) {
			var section = document.getElementById(this._showSectionId);
			section.style.width = window.innerWidth - offset + "px";
			
			// calculate number of rows
			var rows = [];
			var views = section.getElementsByClassName("view");
			for (var i = 0; i < views.length; ++i) {
				var view = views.item(i);
				var top = view.getBoundingClientRect().top;
				if (rows.indexOf(top) === -1) {
					rows.push(top);
				}
			}
			section.style.height = (rows.length * 270) + 2 + "px";
			
		} else {
			var mains = document.getElementsByClassName("main");
			for (var i = mains.length-1; i >= 0; --i) {
				var item = mains.item(i);
				item.style.height = "270px";
				item.style.width = window.innerWidth - offset + "px";
			}
		}
	},	
	
	/**
	 * App status changed.
	 * 
	 * @param id the app id
	 * @param status one of the following status: "install", "update", "upto-date", "pending", and "unknown".
	 */
	appStatusChanged: function(id, status) {
		var busyIcon = document.getElementById("busyIcon_" + id);
		if (busyIcon) {
			busyIcon.style.display =  "none";
		}
		
		this._setTileStatus(id, status);
		this._updateInstallButtonStatus(id, status);
	},
	
	appVersionChanged: function(id, localVersion, remoteVersion) {
		console.log("version changed " + id + " localVersion: " + localVersion + " remoteVersion: " + remoteVersion);
		
		this._appVersion[id] = {local: localVersion, remote: remoteVersion};
		this._updateVersionInfo(id, localVersion, remoteVersion);
	},
	
	updateAppStatus: function(id, repos, ius) {
		window.queryAppStatus(id, repos, ius);
	},
	
	setSelectedProduct: function(text) {
		if (text !== this._productFilter) {
			this._productFilter = text;
			this.init();
		}
	},
	
	getSelectedProduct: function() {
		return this._productFilter;
	},
	
	setFilterTags: function(tags) {
		if ((tags === this._filterTags) || (!tags && !this._filterTags)) 
			return;
		
		if (tags && tags.trim().length > 0)
			this._filterTags = tags.split(" ");
		else
			this._filterTags = null;
		
		this.init();
	},
	
	setInstallTooltipVisible: function(visible, dontResetTimeout) {
		var installSoftwareTooltip = document.getElementById("installSoftwareTooltip");
		if (visible) {
			installSoftwareTooltip.classList.remove("hidden");
			installSoftwareTooltip.classList.add("visible");
			
			if (!dontResetTimeout) {
				this._installTooltipTimeout = 10000; // time out in 10 sec
			}
			
			var self = this;
			setTimeout(function() {
				if (self._installTooltipTimeout <= 0) {
					self.setInstallTooltipVisible(false);
				} else if (installSoftwareTooltip.classList.contains("visible")) {
					self._installTooltipTimeout -= 500;
					self.setInstallTooltipVisible(true, true);
				}
			}, 500);
		} else {
			installSoftwareTooltip.classList.remove("visible");
			installSoftwareTooltip.classList.add("hidden");
		}

	},
	
	_isTagsMatches: function(input) {
		var tags = input.split(" ");
		return this._isFilterTagMatches(tags);
	},
	
	_isFilterTagMatches: function(tags) {
		var tagMatched = false;
		if (this._filterTags) {
			for (var j = 0; j < this._filterTags.length; j++) {
				var tag = this._filterTags[j];
				if (this._indexOfIgnoreCase(tags, tag, true) >= 0) {
					return true;
				}
			}
			if (!tagMatched)
				return false;
		}
		return true;
	},
	
	init: function(maxTile, showSectionId) {	
		if (maxTile) 
			this._maxTilePerSection = maxTile;		
		
		if (showSectionId)
			this._showSectionId = showSectionId;		
			
		if (apps) {
			var managed = apps.managed;
			var standalone = apps.standalone;
			var resource = apps.resource;			
			
			/* managed section */
			if (!this._showSectionId || (this._showSectionId === "managedSection")) {
				this._removeExistingTiles("managedSection");
				if (this._isValidArray(managed)) {
					var numTiles = 0;
					var OS = window.getOS();
					
					for (var i = 0; i < managed.length && numTiles < this._maxTilePerSection; ++i) {
						var e = managed[i];
						
						/* filter tiles - product family, versions*/
						if (e.filters) {
							if (e.filters.versions) {
								if (!window.isVersionAcceptable(e.filters.versions.min, e.filters.versions.max))
									continue;
							} 
							if (e.filters.products) {
								if (this._productFilter !== "All" && !window.isProductSupported(e.filters.products))
									continue;
							}
						}
						/* filter tiles - tags */
						var tagMatched = this._isTagsMatches(e.desc) || this._isTagsMatches(e.title);
						if (!tagMatched && this._filterTags) {
							if (e.filters) {
								tagMatched = this._isFilterTagMatches(e.filters.tags);
							}
							if (!tagMatched)
								continue;
						}
						
						
						/* filter repos for current OS */
						var filteredRepos = [];
						for (var j = 0; j < e.repos.length; ++j) {
							var repo = e.repos[j];
							if (!repo.os || (typeof repo.os === "string" && OS.match(repo.os))) {
								if (typeof repo.url === "string")
									filteredRepos.push(repo.url);
							}
						}
						
						/* filter ius for the current OS */
						var resolving = false;
						var filteredIus = [];
						for (var j = 0; j < e.ius.length; ++j) {
							var iu = e.ius[j];
							if (!iu.os || (typeof iu.os === "string" && OS.match(iu.os))) {
								if (typeof iu.iu === "string") {
									filteredIus.push(iu.iu);
									
									if (iu.resolve) {
										resolving = true;
									}
								}
							} 
						}
						
						/* make sure there is at least one repo and one iu before creating a tile */
						if (filteredRepos.length > 0 && filteredIus.length > 0) {
							var id = e.id;
							
							if (!id) {
								id = window.getUniqueId(filteredRepos, filteredIus);
							}
							this._createManagedTile(id,
													e.title,
													e.company,
													e.image,
													e.desc,
													e.url,
													e.releaseNoteUrl,
													filteredRepos,
													filteredIus,
													(e.isWare === true),
													e.isNew,
													resolving);
							numTiles++;
						}
					}
					this.setElementVisibleByClass("managedSectionTitle", "seeMore", this._maxTilePerSection !== Number.MAX_VALUE ? true : false);
					this._setSectionVisible("managedSection", numTiles > 0);
				} else {
					this._setSectionVisible("managedSection", false);
				}
			}
			
			/* standalone section */
			if (!this._showSectionId || (this._showSectionId === "standaloneSection")) {
				this._removeExistingTiles("standaloneSection");
				if (this._isValidArray(standalone)) {
					var numTiles = 0;
					for (var i = 0; i < standalone.length && numTiles < this._maxTilePerSection; ++i) {
						var e = apps.standalone[i];
						
						/* filter tiles - products only */
						if (e.filters) {
							if (e.filters.products) {
								if (this._productFilter !== "All" && !window.isProductSupported(e.filters.products))
									continue;
							}
						}
						/* filter tiles - tags */
						var tagMatched = this._isTagsMatches(e.desc) || this._isTagsMatches(e.title);
						if (!tagMatched && this._filterTags) {
							if (e.filters) {
								tagMatched = this._isFilterTagMatches(e.filters.tags);
							}
							if (!tagMatched)
								continue;
						}
						
						
						this._createStandaloneTile(e.id,
												   e.title,
												   e.company,
												   e.image,
												   e.desc,
												   e.url,
												   e.download,
												   e.isNew);
						numTiles++;
					}
					this.setElementVisibleByClass("standaloneSectionTitle", "seeMore", this._maxTilePerSection !== Number.MAX_VALUE ? true : false);
					this._setSectionVisible("standaloneSection", numTiles > 0);
				} else {
					this._setSectionVisible("standaloneSection", false);
				}
			}
				
			/* resource section */
			if (!this._showSectionId || (this._showSectionId === "resourceSection")) {
				this._removeExistingTiles("resourceSection");
				if (this._isValidArray(resource)) {
					var numTiles = 0;
					for (var i = 0; i < resource.length && numTiles < this._maxTilePerSection; ++i) {
						var e = resource[i];
						
						/* filter tiles - products only */
						if (e.filters) {
							if (e.filters.products) {
								if (this._productFilter !== "All" && !window.isProductSupported(e.filters.products))
									continue;
							}
						}
						/* filter tiles - tags */
						var tagMatched = this._isTagsMatches(e.desc) || this._isTagsMatches(e.title);
						if (!tagMatched && this._filterTags) {
							if (e.filters) {
								tagMatched = this._isFilterTagMatches(e.filters.tags);
							}
							if (!tagMatched)
								continue;
						}
						
						this._createResourceTile(e.id,
												 e.title,
												 e.company,
												 e.image,
												 e.desc,
												 e.url,
												 e.isNew);
						numTiles++;
					}
					
					this.setElementVisibleByClass("resourceSectionTitle", "seeMore", this._maxTilePerSection !== Number.MAX_VALUE ? true : false);
					this._setSectionVisible("resourceSection", numTiles > 0);
				} else {
					this._setSectionVisible("resourceSection", false);
				}
			}
		}
		
		this.onSize();
	},
	
	_createTileElement: function(sectionId, id, readMoreBtnClazz, title, company, img, desc, url, releaseNoteUrl, isNew, createActionFunc) {
		try {
			var mainDiv = document.getElementById(sectionId);
	
			/* creates tile */
			var tileElement = document.createElement("div");
			tileElement.setAttribute("class", "view view-tenth");
			if (!id)
				id = Date.now(); // use the current time
			tileElement.setAttribute("id", id);
			mainDiv.appendChild(tileElement);
			
			/* creates the image and add it to the tile */
			var imgElement = document.createElement("img");
			if (img === undefined || img === null)
				img = "data:image/png;base64,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";
			imgElement.setAttribute("src", img);
			tileElement.appendChild(imgElement);
			
			/* creates the 'New" overlay and add it to the title */
			if (isNew) {
				var newElement = document.createElement("div");
				newElement.setAttribute("class", "new");
				tileElement.appendChild(newElement);
			}
			
			/* creates the mask section and add to the tile */
			var maskElement = document.createElement("div");
			maskElement.setAttribute("class", "mask");
			tileElement.appendChild(maskElement);
			
			/* creates the description and add it to the mask section */
			var length = releaseNoteUrl ? 130 : 160;
			var descElement = document.createElement("p");
			if (desc.length > length)
				desc = desc.substr(0, length) + " ...";
			descElement.textContent = desc;
			descElement.setAttribute("class", "description " + (releaseNoteUrl ? "releaseNote" : ""));
			maskElement.appendChild(descElement);
			
			/* creates release note link and add it to the mask section */
			if (releaseNoteUrl) {
				var releaseNoteElement = document.createElement("a");
				releaseNoteElement.setAttribute("href", "#");
				releaseNoteElement.setAttribute("class", "releaseNote");
				releaseNoteElement.setAttribute("onclick", "window.openExternalBrowser('" + releaseNoteUrl + "'); return false;");
				releaseNoteElement.textContent = "<<Release Note>>";
				maskElement.appendChild(releaseNoteElement);
			}
			
			/* creates the url button and add it to the mask section */
			if (url) {
				var urlElement = document.createElement("a");
				urlElement.setAttribute("href", "#");
				urlElement.setAttribute("onclick", "window.openExternalBrowser('" + url + "'); return false;");
				urlElement.setAttribute("class", "button " + readMoreBtnClazz);
				urlElement.textContent = "Read More";
				maskElement.appendChild(urlElement);
			}
	
			/* creates the info section and add it to the tile */ 
			var infoElement = document.createElement("div");
			infoElement.setAttribute("class", "info");
			tileElement.appendChild(infoElement);
	
			/* creates the action button and add it to the infoElement */
			if (createActionFunc) {
				createActionFunc(infoElement);
			}
	
			/* creates title and add it to the infoElement */
			var titleElement = document.createElement("span");
			titleElement.setAttribute("class", "text title");
			titleElement.textContent = title;
			infoElement.appendChild(titleElement);
						
			/* creates company and add it to the infoElement */
			if (company) {
				var companyElement = document.createElement("span");
				companyElement.setAttribute("class", "text company");
				companyElement.textContent = company;
				infoElement.appendChild(companyElement);
			}
			
			/* create version and add it to the infoElement */
			var versionElement = document.createElement("span");
			versionElement.setAttribute("id", "version_" + id);
			versionElement.setAttribute("class", "text version");
			infoElement.appendChild(versionElement);
			
			return tileElement;
		} catch (e) {
			console.log(e);
		}
	},
	
	_createManagedTile: function(id, title, company, img, desc, url, releaseNoteUrl, repos, ius, isWare, isNew, resolving) {
		var that = this;
		var element = this._createTileElement("managedSection", id, "blueColor-bg", title, company, img, desc, url, releaseNoteUrl, isNew, function(infoElement) {
			if (Object.prototype.toString.call(repos) === "[object Array]" && Object.prototype.toString.call(ius) === "[object Array]") {
				var installElement = document.createElement("a");
				installElement.setAttribute("id", "installBtn_" + id);
				installElement.setAttribute("class", "button install blueColor-bg");
				installElement.setAttribute("onclick", "window.toggleAppsToIntall('" + id + "', " + JSON.stringify(repos) + "," + JSON.stringify(ius) + "," + isWare + "); return false;");
				installElement.setAttribute("href", "#");
				installElement.setAttribute("style", "display: none;");
				infoElement.appendChild(installElement);
				
				var tileStatus = that._getTileStatus(id); 
				if (tileStatus === undefined) {
					if (!resolving) {
						window.queryAppStatus(id, repos, ius);
					}
					var busyElement = document.createElement("img");
					busyElement.setAttribute("src", "data:image/gif;base64,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");
					busyElement.setAttribute("class", "spinner");
					busyElement.setAttribute("id", "busyIcon_" + id);
					infoElement.appendChild(busyElement);
				} else {
					that._updateInstallButtonStatus(id, tileStatus);
				}
				
				var tileVersion = that._getTileVersion(id);
				if (tileVersion) {
					that._updateVersionInfo(id, tileVersion.local, tileVersion.remote);
				} else {
					window.queryAppVersion(id, repos, ius);
				}
			}
		});
		if (element) {
			element.setAttribute("repos", repos);
			element.setAttribute("ius", ius);
		}
	},
	
	_createStandaloneTile: function(id, title, company, img, desc, url, download, isNew) {
		this._createTileElement("standaloneSection", id, "redColor-bg", title, company, img, desc, url, null, isNew, function(infoElement) {
			var installElement = document.createElement("a");
			installElement.setAttribute("class", "button install redColor-bg");
			installElement.setAttribute("href", "#");
			installElement.setAttribute("onclick", "window.openExternalBrowser('" + download + "'); return false;");
			installElement.textContent = "Download";
			infoElement.appendChild(installElement);
		});
	},
	
	_createResourceTile: function(id, title, company, img, desc, url, isNew) {
		this._createTileElement("resourceSection", id, "grayColor-bg", title, company, img, desc, url, null, isNew, function(infoElement) {
			var linkElement = document.createElement("a");
			linkElement.setAttribute("class", "button install grayColor-bg");
			linkElement.setAttribute("href", "#");
			linkElement.setAttribute("onclick", "window.openExternalBrowser('" + url + "'); return false;");
			linkElement.textContent = "More";
			infoElement.appendChild(linkElement);
		});
	},

	_isValidArray: function(array) {
		return (Object.prototype.toString.call(array) === "[object Array]") && (array.length > 0);
	},
	
	_setSectionVisible: function(sectionId, visible) {
		var section = document.getElementById(sectionId);
		if (section) {
			section.style.display = visible === false ? "none" : "";
		}
		var sectionTitle = document.getElementById(sectionId+"Title");
		if (sectionTitle) {
			sectionTitle.style.display = visible === false ? "none" : "";
		}
	},

	_setTileStatus: function(id, status) {
		try {
			for (var i = 0; i < this._appStatus.length; ++i) {
				var e = this._appStatus[i];
				if (e.id === id) {
					e.status = status;
					return;
				}
			}
			this._appStatus.push({'id': id, 'status': status});
		} finally {
			var installSoftwareBtn = document.getElementById("installSoftwareBtn");
			
			for (var i = 0; i < this._appStatus.length; ++i) {
				if (this._appStatus[i].status === "pending") {
					if (installSoftwareBtn.classList.contains("disabledBtn"))
						this.setInstallTooltipVisible(true);
					
					installSoftwareBtn.setAttribute("onClick", "installPendingApps()");					
					installSoftwareBtn.classList.remove("disabledBtn");					
					return;
				}
			}
			
			this.setInstallTooltipVisible(false);			
			installSoftwareBtn.removeAttribute("onClick");
			installSoftwareBtn.classList.add("disabledBtn");
		}
	},
	
	
	
	_getTileStatus: function(id) {
		for (var i = 0; i < this._appStatus.length; ++i) {
			var e = this._appStatus[i];
			if (e.id === id)
				return e.status;
		}		
		return undefined;
	},
	
	_getTileVersion: function(id) {
		var e = this._appVersion[id];
		if (e && (e.id === id))
			return e.version;
		return undefined;
	},
	
	_createCheckbox: function(element, checked) {
		var checkmarkElement = document.createElement("img");
		checkmarkElement.setAttribute("style", 	"background-size: 14px; " +
												"height: 14px; " +
												"width: 14px; " +
												"opacity: 1; " +
												"top: -29px; " +
												"left: -17px; " +
												"background-repeat: no-repeat; " +
												"background-color: #fff; " +
												"border-radius: 2px; " +
												"border: none");
		
		checkmarkElement.classList.add(checked ? "checked" : "unchecked");
		element.style.textIndent = "15px";
		element.appendChild(checkmarkElement);
	},
	
	_updateVersionInfo: function(id, localVersion, remoteVersion) {
		var element = document.getElementById("version_" + id);
		if (element) {
			var versionText = remoteVersion ? "v" + remoteVersion : "";
			if ((localVersion != null) && (localVersion.length) > 0 && (localVersion != remoteVersion)) {
				versionText += " (v" + localVersion + " currently installed)";
			}
			element.innerText = versionText;
			element.title = versionText;
		}
	},
	
	_updateInstallButtonStatus: function(id, status) {
		var element = document.getElementById("installBtn_" + id);
		if (element) {
			element.removeAttribute("title");
			element.classList.remove("tip");
		
			if (status === "install") {
				element.textContent = "Select";
				element.classList.remove("disabled");
				
				this._createCheckbox(element, false);	
			} else if (status === "update") {
				element.textContent = "Update";
				element.classList.remove("disabled");
				
				this._createCheckbox(element, false);
			} else if (status === "upto-date") {
				element.textContent = "Up to Date";
				element.classList.add("disabled");
			} else if (status === "pending") {
				element.textContent = "Selected";
				element.classList.remove("disabled");
				element.setAttribute("title", "Click the \"Install Software\" button at the top of this page to begin installing the selected add-on(s).");
				element.classList.add("tip");
				
				this._createCheckbox(element, true);
			} else {
				return;				
			}
			
			element.style.display = "";
		}
	},
			
	_removeExistingTiles: function(sectionId) {
		var mainDiv = document.getElementById(sectionId);	
		var existingTiles = mainDiv.getElementsByClassName("view");
		for (var i = existingTiles.length-1; i >= 0; --i) {
			mainDiv.removeChild(existingTiles[i]);
		}	
	},
	
	setElementVisibleByClass: function(elementId, clazz, visible) {
		var element = document.getElementById(elementId);
		var es = element.getElementsByClassName(clazz);
		for (var i = 0; i < es.length; ++i) {
			var e = es[i];
			e.style.display = visible === false ? "none" : "";
		}
	},
	
	_indexOfIgnoreCase: function(array, element, regex) {
		if (array && element) {
			var lcElement = element.toLowerCase();
			for (var i = 0; i < array.length; ++i) {
				if (!regex) {
					if (lcElement === array[i].toLowerCase()) {
						return i;
					}
				} else {
					if (array[i].toLowerCase().match(".*"+lcElement+".*")) {
						return i;
					}
				}
			}
	    }
	    return -1;
	}
};
