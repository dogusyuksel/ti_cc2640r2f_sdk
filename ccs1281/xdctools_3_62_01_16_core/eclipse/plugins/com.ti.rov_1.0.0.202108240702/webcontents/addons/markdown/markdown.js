/*
 *  ======== markdown.js ========
 *  ROV markdown add on
 *
 *  See also:
 *      https://www.polymer-project.org/1.0/docs/devguide/feature-overview
 */

/* Polymer element registration */
Polymer({
    /* identify this code's element: must match <dom-module> id */
    is: "xdc-rov-polymerUI-examples-markdown",

    /* common view behaviors. See ti-rov-behaviors.html for reference */
    behaviors: [
        rovBehaviors.viewBehaviors,
        rovBehaviors.viewStatusBehaviors
    ],

    /* properties for this element's public API */
    properties: {

        viewName: {    /* required read-only view name: shown in addon menu */
          type:  String,
          value: "Markdown View"
        },
        viewLabel: {
          type: String,
          value: ''
        },
        module: {
          type: String,
          value: ''
        },
        view: {
          type: String,
          value: ''
        },
        args: {
          type: String,
          value: ''
        },
        /*  Names of properties specific to this element that
         *  we want to persist when the element is saved and restored
         */
        persistProperties: {
            type: Array,
            value: ['module', 'view', 'args']
        }

    },

    /* properties and methods on the element's prototype */

    markdownClicked : function (e) {
        e.preventDefault();
        var clickedElem = null;
        if (e.srcElement && e.srcElement.nodeName == 'A') {
            clickedElem = e.srcElement;
        }
        else if (e.srcElement && e.srcElement.parentElement && e.srcElement.parentElement.nodeName == 'A') {
            clickedElem = e.srcElement.parentElement;
        }
        if (clickedElem) {
            var href = clickedElem.href.indexOf(' ') == -1 ? clickedElem.href : clickedElem.href.substr(0, clickedElem.href.indexOf(' '));
            if (rovUtils.isValidLink(href)) {
                if (href.indexOf("/com.ti.rov/#") == -1) {
                    if (href.indexOf('rov://') >= 0) {
                        var search = href.substr(href.indexOf('?'));
                        var params = new URLSearchParams(search);
                        if (href.indexOf('/addon') == -1) {
                            var module = params.get('module');
                            var view = params.get('view');
                            var row = params.get('row');
                            if (row) {
                                row = row.split(':');
                            }
                            var col = params.get('col');
                            var rowKeys = row ? {primaryKeyColumnName: row[0],
                                                 primaryKeyColumnValue: row[1],
                                                 selectedColumnName: col}
                                              : null;
                            try {
                                thePanel.viewFromGraphOrCustom(module, view, null, rowKeys);
                            }
                            catch (e) {
                                console.error(e);
                                thePanel.showStatus("Error opening Module: '" + module + "', View: '" + view + "' - " + e.message, "error");
                            }
                        }
                        else if (params.get('markdown') != null) {
                            params = params.get('params');
                            try {
                                var args = null;
                                var viewParams = params.match(/(.*):([^,]*),(.*)/) || params.match(/(.*):([^,]*)/);
                                if (viewParams.length > 3) {
                                    args = viewParams[3];
                                }
                                thePanel.newMarkdownView(viewParams[1], viewParams[2], args);
                            }
                            catch (e) {
                                console.error(e);
                                thePanel.showStatus("Error opening manpage add on: '" + params + "' - " + e.message, "error");
                            }
                        }
                    }
                    else {
                        window.open(href,'_blank');
                    }
                }
                else {
                    var tokens = href.match(/(\/com.ti.rov\/#)([^ ]+)/);
                    if (tokens && tokens[2]) {
                        var mdChildren = this.$.markdownContent.children;
                        var mdElems = null;;
                        for (var i = 0; i < mdChildren.length; i++) {
                            if (mdChildren[i].className.indexOf('markdown-html') >= 0) {
                                mdElems = mdChildren[i].children;
                                break;
                            }                                
                        }
                        if (mdElems != null) {
                            for (i = 0; i < mdElems.length; i++) {
                                if (mdElems[i].id == tokens[2]) {
                                    mdElems[i].scrollIntoView();                                    
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            else {
                this.rovViewStatus('Invalid link', 'error');
            }
        }
    },

    /*
     *  ======== attached ========
     */
    attached : function () {
        /* defaults for label and the view needed to get markdown txt */
        var tlabel = this.module + ':' + this.view;
        var tview = this.view;

        /* if there are args, pass them to the view */
        if (this.args) {
            tview = this.view + ':' + this.args;

            /* if first arg is for us, get it and pass remainder to view */
            var tokens = String(this.args).split(/\s*,\s*/);
            if (tokens[0].indexOf("--label=") == 0) {
                tlabel = tokens.shift(1).substring(8);
                if (tokens.length > 0) {
                    tview = this.view + ':' + tokens.join(',');
                }
                else {
                    tview = this.view;
                }
            }
        }

        /* set the title/label and get the markdown text to render */
        this.viewLabel = tlabel;
        this.rovData.getView(this.module, tview, this);
    },

    /*
     *  ======== getViewCallback ========
     */
    getViewCallback: function (error, viewData, module, view) {

        /* handle data acquisition error (if any) */
        if (error != null) {
            if (this.isReportableError(error)) {
                this.rovViewStatus(error, 'error');
            }
            return;
        }

        /* add sessionID to markdown image links */
        var markdownText = viewData.elements[0].markdown;
        var sessionId = thePanel.getSessionId();

        /* replace "![alt](foo/bar)" with "![alt](~sessionId/foo/bar)" */
        var md = markdownText.replace(
            /\!\[([^\]]*)\]\(([^\/]+)([^\)]*)\)/g,
            "![$1](~" + sessionId + "/$2$3)"
        );
        this.$.markdownContent.markdown = md;
    },

    /*
     *  ======== resizerClicked ========
     *  Called on a bottom corner on-mousedown event
     *
     *  See emptyView.html resizer div.
     */
    resizerClicked: function (e) {
        /*
         *  call polymerUI/src/rovUtils.js initRovResize(), passing the
         *  viewPaperCard element that is being resized. initRovResize()
         *  also takes an optional resized() callback parameter if any
         *  content in this view requires manual resizing logic to go
         *  along with the containing viewPaperCard element being resized
         */
        rovUtils.initRovResize(e, this.$.viewPaperCard);
    }
});
