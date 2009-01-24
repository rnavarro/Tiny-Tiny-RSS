var xmlhttp = false;

var active_feed_cat = false;
var active_tab = false;

var xmlhttp = Ajax.getTransport();

var init_params = new Array();

var caller_subop = false;
var sanity_check_done = false;
var hotkey_prefix = false;

function infobox_callback() {
	if (xmlhttp.readyState == 4) {
		infobox_callback2(xmlhttp);
	}
}

function infobox_submit_callback() {
	if (xmlhttp.readyState == 4) {
		infobox_submit_callback2(xmlhttp);
	}
}


function replace_pubkey_callback() {
	if (xmlhttp.readyState == 4) {
		try {	
			var link = document.getElementById("pubGenAddress");

			if (xmlhttp.responseXML) {

				var new_link = xmlhttp.responseXML.getElementsByTagName("link")[0];

				if (new_link) {
					link.href = new_link.firstChild.nodeValue;
					//link.innerHTML = new_link.firstChild.nodeValue;

					new Effect.Highlight(link);

					notify_info("Published feed URL changed.");
				} else {
					notify_error("Could not change feed URL.");
				}

			} else {
				notify_error("Could not change feed URL.");
			}
		} catch (e) {
			exception_error("replace_pubkey_callback", e);
		}
	}
}

function feedlist_callback() {
	if (xmlhttp.readyState == 4) {
		return feedlist_callback2(xmlhttp);
	}
}

function feedlist_callback2(transport) {

	try {	

		var container = document.getElementById('prefContent');	
		container.innerHTML=transport.responseText;
		selectTab("feedConfig", true);

		if (caller_subop) {
			var tuple = caller_subop.split(":");
			if (tuple[0] == 'editFeed') {
				window.setTimeout('editFeed('+tuple[1]+')', 100);
			}				

			caller_subop = false;
		}
		if (typeof correctPNG != 'undefined') {
			correctPNG();
		}
		notify("");
		remove_splash();

	} catch (e) {
		exception_error("feedlist_callback2", e);
	}
}

/* stub for subscription dialog */

function dlg_frefresh_callback(transport) {
	return feedlist_callback2(transport);
}

function filterlist_callback2(transport) {
	var container = document.getElementById('prefContent');
	container.innerHTML=transport.responseText;
	if (typeof correctPNG != 'undefined') {
		correctPNG();
	}
	notify("");
	remove_splash();
}


function filterlist_callback() {
	if (xmlhttp.readyState == 4) {
		filterlist_callback2(xmlhttp);
	}
}

function labellist_callback2(transport) {

	try {

		var container = document.getElementById('prefContent');
			closeInfoBox();
			container.innerHTML=transport.responseText;
	
			if (document.getElementById("prefLabelList")) {
				var elems = document.getElementById("prefLabelList").getElementsByTagName("SPAN");

				for (var i = 0; i < elems.length; i++) {
					if (elems[i].id && elems[i].id.match("LILT-")) {

						var id = elems[i].id.replace("LILT-", "");
							new Ajax.InPlaceEditor(elems[i],
							'backend.php?op=pref-labels&subop=save&id=' + id,
							{cols: 20, rows: 1});
					}
				}
			}
	
			if (typeof correctPNG != 'undefined') {
				correctPNG();
			}
			notify("");
			remove_splash();

	} catch (e) {
		exception_error("labellist_callback2", e);
	}
}

function feed_browser_callback() {
	var container = document.getElementById('prefContent');
	if (xmlhttp.readyState == 4) {
		container.innerHTML=xmlhttp.responseText;
		notify("");
		remove_splash();
	}
}

function userlist_callback() {
	var container = document.getElementById('prefContent');
	if (xmlhttp.readyState == 4) {
		container.innerHTML=xmlhttp.responseText;
		notify("");
		remove_splash();
	}
}

function prefslist_callback() {
	var container = document.getElementById('prefContent');
	if (xmlhttp.readyState == 4) {
		container.innerHTML=xmlhttp.responseText;
		notify("");
		remove_splash();
	}
}

function gethelp_callback() {
	var container = document.getElementById('prefHelpBox');
	if (xmlhttp.readyState == 4) {

		container.innerHTML = xmlhttp.responseText;
		container.style.display = "block";

	}
}

function notify_callback() {
	if (xmlhttp.readyState == 4) {
		notify_callback2(xmlhttp);
	} 
}

function notify_callback2(transport) {
	notify_info(transport.responseText);	 
}

function prefs_reset_callback() {
	if (xmlhttp.readyState == 4) {
		notify_info(xmlhttp.responseText);
		selectTab();
	} 
}


function changepass_callback() {
	try {
		if (xmlhttp.readyState == 4) {
	
			if (xmlhttp.responseText.indexOf("ERROR: ") == 0) {
				notify_error(xmlhttp.responseText.replace("ERROR: ", ""));
			} else {
				notify_info(xmlhttp.responseText);
				var warn = document.getElementById("default_pass_warning");
				if (warn) warn.style.display = "none";
			}
	
			document.forms['change_pass_form'].reset();

		} 
	} catch (e) {
		exception_error("changepass_callback", e);
	}
}

function init_cat_inline_editor() {
	try {

		if (document.getElementById("prefFeedCatList")) {
			var elems = document.getElementById("prefFeedCatList").getElementsByTagName("SPAN");

			for (var i = 0; i < elems.length; i++) {
				if (elems[i].id && elems[i].id.match("FCATT-")) {
					var cat_id = elems[i].id.replace("FCATT-", "");
						new Ajax.InPlaceEditor(elems[i],
						'backend.php?op=pref-feeds&subop=editCats&action=save&cid=' + cat_id);
				}
			}
		}

	} catch (e) {
		exception_error("init_cat_inline_editor", e);
	}
}

function infobox_feed_cat_callback2(transport) {
	try {
		infobox_callback2(transport);
		init_cat_inline_editor();
	} catch (e) {
		exception_error("infobox_feed_cat_callback2", e);
	}
}

function updateFeedList(sort_key) {

	try {

	var feed_search = document.getElementById("feed_search");
	var search = "";
	if (feed_search) { search = feed_search.value; }

	var slat = document.getElementById("show_last_article_times");

	var slat_checked = false;
	if (slat) {
		slat_checked = slat.checked;
	}

	var query = "backend.php?op=pref-feeds" +
		"&sort=" + param_escape(sort_key) + 
		"&slat=" + param_escape(slat_checked) +
		"&search=" + param_escape(search);

	new Ajax.Request(query, {
		onComplete: function(transport) { 
			feedlist_callback2(transport); 
		} });
	} catch (e) {
		exception_error("updateFeedList", e);
	}
}

function updateUsersList(sort_key) {

	if (!xmlhttp_ready(xmlhttp)) {
		printLockingError();
		return
	}

	var user_search = document.getElementById("user_search");
	var search = "";
	if (user_search) { search = user_search.value; }

	xmlhttp.open("GET", "backend.php?op=pref-users&sort="
		+ param_escape(sort_key) +
		"&search=" + param_escape(search), true);
	xmlhttp.onreadystatechange=userlist_callback;
	xmlhttp.send(null);

}

function addLabel() {

	try {

		var caption = prompt(__("Please enter label caption:"), "");
	
		if (caption == null) { 
			return false;
		}
	
		if (caption == "") {
			alert(__("Can't create label: missing caption."));
			return false;
		}
	
		// we can be called from some other tab
		active_tab = "labelConfig";
	
		query = "backend.php?op=pref-labels&subop=add&caption=" + 
			param_escape(caption);
	
		new Ajax.Request(query,	{
			onComplete: function(transport) {
					infobox_submit_callback2(transport);
				} });

	} catch (e) {
		exception_error("addLabel", e);
	}
}

function addFeed() {

	try {

		var link = document.getElementById("fadd_link");
	
		if (link.value.length == 0) {
			alert(__("Error: No feed URL given."));
		} else if (!isValidURL(link.value)) {
			alert(__("Error: Invalid feed URL."));
		} else {
			notify_progress("Adding feed...");
	
			var query = "backend.php?op=pref-feeds&subop=add&from=tt-rss&feed_url=" +
				param_escape(link.value);
	
			new Ajax.Request(query,	{
				onComplete: function(transport) {
						feedlist_callback2(transport);
					} });
	
			link.value = "";
	
		}

	} catch (e) {
		exception_error("addFeed", e);
	}

}

function addFeedCat() {

	if (!xmlhttp_ready(xmlhttp)) {
		printLockingError();
		return
	}

	var cat = document.getElementById("fadd_cat");

	if (cat.value.length == 0) {
		alert(__("Can't add category: no name specified."));
	} else {
		notify_progress("Adding feed category...");

		var query = "backend.php?op=pref-feeds&subop=editCats&action=add&cat=" +
			param_escape(cat.value);

		new Ajax.Request(query,	{
			onComplete: function(transport) {
					infobox_feed_cat_callback2(transport);
				} });

		link.value = "";

	}

}
function addUser() {

	if (!xmlhttp_ready(xmlhttp)) {
		printLockingError();
		return
	}

	var sqlexp = document.getElementById("uadd_box");

	if (sqlexp.value.length == 0) {
		alert(__("Can't add user: no login specified."));
	} else {
		notify_progress("Adding user...");

		xmlhttp.open("GET", "backend.php?op=pref-users&subop=add&login=" +
			param_escape(sqlexp.value), true);			
			
		xmlhttp.onreadystatechange=userlist_callback;
		xmlhttp.send(null);

		sqlexp.value = "";
	}

}

function editUser(id) {

	try {

		disableHotkeys();

		notify_progress("Loading, please wait...");

		selectTableRowsByIdPrefix('prefUserList', 'UMRR-', 'UMCHK-', false);
		selectTableRowById('UMRR-'+id, 'UMCHK-'+id, true);

		disableContainerChildren("userOpToolbar", false);

		var query = "backend.php?op=pref-users&subop=edit&id=" +
			param_escape(id);

		new Ajax.Request(query,	{
			onComplete: function(transport) {
					infobox_callback2(transport);
				} });

	} catch (e) {
		exception_error("editUser", e);
	}
		
}

function editFilter(id) {

	try {

		disableHotkeys();

		notify_progress("Loading, please wait...");

		disableContainerChildren("filterOpToolbar", false);

		selectTableRowsByIdPrefix('prefFilterList', 'FILRR-', 'FICHK-', false);
		selectTableRowById('FILRR-'+id, 'FICHK-'+id, true);

		var query = "backend.php?op=pref-filters&subop=edit&id=" + 
			param_escape(id);

		new Ajax.Request(query,	{
			onComplete: function(transport) {
					infobox_callback2(transport);
				} });
	} catch (e) {
		exception_error("editFilter", e);
	}
}

function editFeed(feed) {

	try {

		disableHotkeys();
	
		notify_progress("Loading, please wait...");
	
		// clean selection from all rows & select row being edited
		selectTableRowsByIdPrefix('prefFeedList', 'FEEDR-', 'FRCHK-', false);
		selectTableRowById('FEEDR-'+feed, 'FRCHK-'+feed, true);
	
		disableContainerChildren("feedOpToolbar", false);
	
		var query = "backend.php?op=pref-feeds&subop=editfeed&id=" +
			param_escape(feed);
	
		new Ajax.Request(query,	{
			onComplete: function(transport) {
					infobox_callback2(transport);
				} });

	} catch (e) {
		exception_error("editFeed", e);
	}
}

function getSelectedLabels() {
	return getSelectedTableRowIds("prefLabelList", "LILRR");
}

function getSelectedUsers() {
	return getSelectedTableRowIds("prefUserList", "UMRR");
}

function getSelectedFeeds() {
	return getSelectedTableRowIds("prefFeedList", "FEEDR");
}

function getSelectedFilters() {
	return getSelectedTableRowIds("prefFilterList", "FILRR");
}

function getSelectedFeedCats() {
	return getSelectedTableRowIds("prefFeedCatList", "FCATR");
}


function removeSelectedLabels() {

	var sel_rows = getSelectedLabels();

	if (sel_rows.length > 0) {

		var ok = confirm(__("Remove selected labels?"));

		if (ok) {
			notify_progress("Removing selected labels...");
	
			var query = "backend.php?op=pref-labels&subop=remove&ids="+
				param_escape(sel_rows.toString());

			new Ajax.Request(query,	{
				onComplete: function(transport) {
						labellist_callback2(transport);
					} });

		}
	} else {
		alert(__("No labels are selected."));
	}

	return false;
}

function removeSelectedUsers() {

	if (!xmlhttp_ready(xmlhttp)) {
		printLockingError();
		return
	}

	var sel_rows = getSelectedUsers();

	if (sel_rows.length > 0) {

		var ok = confirm(__("Remove selected users?"));

		if (ok) {
			notify_progress("Removing selected users...");
	
			xmlhttp.open("GET", "backend.php?op=pref-users&subop=remove&ids="+
				param_escape(sel_rows.toString()), true);
			xmlhttp.onreadystatechange=userlist_callback;
			xmlhttp.send(null);
		}

	} else {
		alert(__("No users are selected."));
	}

	return false;
}

function removeSelectedFilters() {

	if (!xmlhttp_ready(xmlhttp)) {
		printLockingError();
		return
	}

	var sel_rows = getSelectedFilters();

	if (sel_rows.length > 0) {

		var ok = confirm(__("Remove selected filters?"));

		if (ok) {
			notify_progress("Removing selected filters...");
	
			xmlhttp.open("GET", "backend.php?op=pref-filters&subop=remove&ids="+
				param_escape(sel_rows.toString()), true);
			xmlhttp.onreadystatechange=filterlist_callback;
			xmlhttp.send(null);
		}
	} else {
		alert(__("No filters are selected."));
	}

	return false;
}


function removeSelectedFeeds() {

	try {

		var sel_rows = getSelectedFeeds();
	
		if (sel_rows.length > 0) {
	
			var ok = confirm(__("Unsubscribe from selected feeds?"));
	
			if (ok) {
	
				notify_progress("Unsubscribing from selected feeds...");
		
				var query = "backend.php?op=pref-feeds&subop=remove&ids="+
					param_escape(sel_rows.toString());
	
				new Ajax.Request(query,	{
					onComplete: function(transport) {
							feedlist_callback2(transport);
						} });
			}
	
		} else {
			alert(__("No feeds are selected."));
		}

	} catch (e) {
		exception_error("removeSelectedFeeds", e);
	}
	
	return false;
}

function clearSelectedFeeds() {

	var sel_rows = getSelectedFeeds();

	if (sel_rows.length > 1) {
		alert(__("Please select only one feed."));
		return;
	}

	if (sel_rows.length > 0) {

		var ok = confirm(__("Erase all non-starred articles in selected feed?"));

		if (ok) {
			notify_progress("Clearing selected feed...");
			clearFeedArticles(sel_rows[0]);
		}

	} else {

		alert(__("No feeds are selected."));

	}
	
	return false;
}

function purgeSelectedFeeds() {

	if (!xmlhttp_ready(xmlhttp)) {
		printLockingError();
		return
	}

	var sel_rows = getSelectedFeeds();

	if (sel_rows.length > 0) {

		var pr = prompt(__("How many days of articles to keep (0 - use default)?"), "0");

		if (pr != undefined) {
			notify_progress("Purging selected feed...");

			var query = "backend.php?op=rpc&subop=purge&ids="+
				param_escape(sel_rows.toString()) + "&days=" + pr;

			debug(query);

			new Ajax.Request(query,	{
				onComplete: function(transport) {
					notify('');
				} });
		}

	} else {

		alert(__("No feeds are selected."));

	}
	
	return false;
}

function removeSelectedFeedCats() {

	if (!xmlhttp_ready(xmlhttp)) {
		printLockingError();
		return
	}

	var sel_rows = getSelectedFeedCats();

	if (sel_rows.length > 0) {

		var ok = confirm(__("Remove selected categories?"));

		if (ok) {
			notify_progress("Removing selected categories...");
	
			var query = "backend.php?op=pref-feeds&subop=editCats&action=remove&ids="+
				param_escape(sel_rows.toString());

			new Ajax.Request(query,	{
				onComplete: function(transport) {
					infobox_feed_cat_callback2(transport);
				} });

		}

	} else {

		alert(__("No categories are selected."));

	}

	return false;
}

function feedEditCancel() {

	if (!xmlhttp_ready(xmlhttp)) {
		printLockingError();
		return
	}

	try {
		document.getElementById("subscribe_to_feed_btn").disabled = false;
		document.getElementById("top25_feeds_btn").disabled = false;
	} catch (e) {
		// this button is not always available, no-op if not found
	}

	closeInfoBox();

	selectPrefRows('feed', false); // cleanup feed selection

	return false;
}

function feedEditSave() {

	try {
	
		// FIXME: add parameter validation

		var query = Form.serialize("edit_feed_form");

		notify_progress("Saving feed...");

		new Ajax.Request("backend.php", {
			parameters: query,
			onComplete: function(transport) { 
				feedlist_callback2(transport); 
			} });

		closeInfoBox();

		return false;

	} catch (e) {
		exception_error("feedEditSave", e);
	} 
}

function userEditCancel() {

	if (!xmlhttp_ready(xmlhttp)) {
		printLockingError();
		return
	}

	selectPrefRows('user', false); // cleanup feed selection
	closeInfoBox();

	return false;
}

function filterEditCancel() {

	if (!xmlhttp_ready(xmlhttp)) {
		printLockingError();
		return
	}

	try {
		document.getElementById("create_filter_btn").disabled = false;
		selectPrefRows('filter', false); // cleanup feed selection
	} catch (e) { }

	closeInfoBox();

	return false;
}

function userEditSave() {

	if (!xmlhttp_ready(xmlhttp)) {
		printLockingError();
		return
	}

	var login = document.forms["user_edit_form"].login.value;

	if (login.length == 0) {
		alert(__("Login field cannot be blank."));
		return;
	}
	
	notify_progress("Saving user...");

	closeInfoBox();

	var query = Form.serialize("user_edit_form");
	
	xmlhttp.open("GET", "backend.php?" + query, true);			
	xmlhttp.onreadystatechange=userlist_callback;
	xmlhttp.send(null);

	return false;
}


function filterEditSave() {

	if (!xmlhttp_ready(xmlhttp)) {
		printLockingError();
		return
	}

/*	if (!is_opera()) {
		var reg_exp = document.forms["filter_edit_form"].reg_exp.value;
	
		if (reg_exp.length == 0) {
			alert("Filter expression field cannot be blank.");
			return;
		}
	} */

	notify_progress("Saving filter...");

	var query = Form.serialize("filter_edit_form");

	closeInfoBox();

	document.getElementById("create_filter_btn").disabled = false;

	xmlhttp.open("GET", "backend.php?" + query, true);
	xmlhttp.onreadystatechange=filterlist_callback;
	xmlhttp.send(null);

	return false;
}


function editSelectedUser() {
	var rows = getSelectedUsers();

	if (rows.length == 0) {
		alert(__("No users are selected."));
		return;
	}

	if (rows.length > 1) {
		alert(__("Please select only one user."));
		return;
	}

	notify("");

	editUser(rows[0]);
}

function resetSelectedUserPass() {
	var rows = getSelectedUsers();

	if (rows.length == 0) {
		alert(__("No users are selected."));
		return;
	}

	if (rows.length > 1) {
		alert(__("Please select only one user."));
		return;
	}

	var ok = confirm(__("Reset password of selected user?"));

	if (ok) {
		notify_progress("Resetting password for selected user...");
	
		var id = rows[0];
	
		xmlhttp.open("GET", "backend.php?op=pref-users&subop=resetPass&id=" +
			param_escape(id), true);
		xmlhttp.onreadystatechange=userlist_callback;
		xmlhttp.send(null);
	}
}

function selectedUserDetails() {

	try {

		var rows = getSelectedUsers();
	
		if (rows.length == 0) {
			alert(__("No users are selected."));
			return;
		}
	
		if (rows.length > 1) {
			alert(__("Please select only one user."));
			return;
		}
	
		notify_progress("Loading, please wait...");
	
		var id = rows[0];
	
		var query = "backend.php?op=pref-users&subop=user-details&id=" + id;

		new Ajax.Request(query,	{
			onComplete: function(transport) {
					infobox_callback2(transport);
				} });
	} catch (e) {
		exception_error("selectedUserDetails", e);
	}
}


function editSelectedFilter() {
	var rows = getSelectedFilters();

	if (rows.length == 0) {
		alert(__("No filters are selected."));
		return;
	}

	if (rows.length > 1) {
		alert(__("Please select only one filter."));
		return;
	}

	notify("");

	editFilter(rows[0]);

}


function editSelectedFeed() {
	var rows = getSelectedFeeds();

	if (rows.length == 0) {
		alert(__("No feeds are selected."));
		return;
	}

	if (rows.length > 1) {
		alert(__("Please select one feed."));
		return;
	}

	notify("");

	editFeed(rows[0]);

}

function editSelectedFeeds() {

	try {
		var rows = getSelectedFeeds();
	
		if (rows.length == 0) {
			alert(__("No feeds are selected."));
			return;
		}
	
		notify("");
	
		disableHotkeys();
	
		notify_progress("Loading, please wait...");
	
		var query = "backend.php?op=pref-feeds&subop=editfeeds&ids=" +
			param_escape(rows.toString());

		new Ajax.Request(query,	{
			onComplete: function(transport) {
					infobox_callback2(transport);
				} });

	} catch (e) {
		exception_error("editSelectedFeeds", e);
	}
}

function piggie(enable) {
	if (enable) {
		debug("I LOVEDED IT!");
		var piggie = document.getElementById("piggie");

		Element.show(piggie);
		Position.Center(piggie);
		Effect.Puff(piggie);

	}
}

function validateOpmlImport() {
	
	var opml_file = document.getElementById("opml_file");

	if (opml_file.value.length == 0) {
		alert(__("No OPML file to upload."));
		return false;
	} else {
		return true;
	}
}

function updateFilterList(sort_key) {

	if (!xmlhttp_ready(xmlhttp)) {
		printLockingError();
		return
	}

	var filter_search = document.getElementById("filter_search");
	var search = "";
	if (filter_search) { search = filter_search.value; }

	xmlhttp.open("GET", "backend.php?op=pref-filters&sort=" + 
		param_escape(sort_key) + 
		"&search=" + param_escape(search), true);
	xmlhttp.onreadystatechange=filterlist_callback;
	xmlhttp.send(null);

}

function updateLabelList(sort_key) {

	try {

		var label_search = document.getElementById("label_search");
		var search = "";
		if (label_search) { search = label_search.value; }
	
		var query = "backend.php?op=pref-labels&sort=" + 
			param_escape(sort_key) +
			"&search=" + param_escape(search);
	
		new Ajax.Request(query,	{
			onComplete: function(transport) {
				labellist_callback2(transport);
			} });

	} catch (e) {
		exception_error("updateLabelList", e);
	}
}

function updatePrefsList() {

	if (!xmlhttp_ready(xmlhttp)) {
		printLockingError();
		return
	}

	xmlhttp.open("GET", "backend.php?op=pref-prefs", true);
	xmlhttp.onreadystatechange=prefslist_callback;
	xmlhttp.send(null);

}

function selectTab(id, noupdate, subop) {

//	alert(id);

	if (!id) id = active_tab;

	try {

		if (!xmlhttp_ready(xmlhttp)) {
			printLockingError();
			return
		}

		try {
			var c = document.getElementById('prefContent');	
			c.scrollTop = 0;
		} catch (e) { };

		if (!noupdate) {

			debug("selectTab: " + id + "(NU: " + noupdate + ")");
	
			notify_progress("Loading, please wait...");
	
			// close active infobox if needed
			closeInfoBox();
	
			// clean up all current selections, just in case
			active_feed_cat = false;

//			Effect.Fade("prefContent", {duration: 1, to: 0.01, 
//				queue: { position:'end', scope: 'FEED_TAB', limit: 1 } } );

			if (id == "feedConfig") {
				updateFeedList();
			} else if (id == "filterConfig") {
				updateFilterList();
			} else if (id == "labelConfig") {
				updateLabelList();
			} else if (id == "genConfig") {
				updatePrefsList();
			} else if (id == "userConfig") {
				updateUsersList();
			}
		}

		/* clean selection from all tabs */
	
		var tabs_holder = document.getElementById("prefTabs");
		var tab = tabs_holder.firstChild;

		while (tab) {
			if (tab.className && tab.className.match("prefsTabSelected")) {
				tab.className = "prefsTab";
			}
			tab = tab.nextSibling;
		}

		/* mark new tab as selected */

		tab = document.getElementById(id + "Tab");
	
		if (tab) {
			if (!tab.className.match("Selected")) {
				tab.className = tab.className + "Selected";
			}
		}
	
		active_tab = id;

	} catch (e) {
		exception_error("selectTab", e);
	}
}

function backend_sanity_check_callback() {

	if (xmlhttp.readyState == 4) {

		try {

			if (sanity_check_done) {
				fatalError(11, "Sanity check request received twice. This can indicate "+
			      "presence of Firebug or some other disrupting extension. "+
					"Please disable it and try again.");
				return;
			}

			if (!xmlhttp.responseXML) {
				fatalError(3, "Sanity Check: Received reply is not XML", 
					xmlhttp.responseText);
				return;
			}
	
			var reply = xmlhttp.responseXML.firstChild.firstChild;
	
			if (!reply) {
				fatalError(3, "Sanity Check: Invalid RPC reply", xmlhttp.responseText);
				return;
			}
	
			var error_code = reply.getAttribute("error-code");
		
			if (error_code && error_code != 0) {
				return fatalError(error_code, reply.getAttribute("error-msg"));
			}
	
			debug("sanity check ok");

			var params = reply.nextSibling;

			if (params) {
				debug('reading init-params...');
				var param = params.firstChild;

				while (param) {
					var k = param.getAttribute("key");
					var v = param.getAttribute("value");
					debug(k + " => " + v);
					init_params[k] = v;					
					param = param.nextSibling;
				}
			}

			sanity_check_done = true;

			init_second_stage();

		} catch (e) {
			exception_error("backend_sanity_check_callback", e);
		}
	} 
}

function init_second_stage() {

	try {
		active_tab = getInitParam("prefs_active_tab");
		if (!document.getElementById(active_tab+"Tab")) active_tab = "genConfig";
		if (!active_tab || active_tab == '0') active_tab = "genConfig";

		document.onkeydown = pref_hotkey_handler;

		var tab = getURLParam('tab');
		
		caller_subop = getURLParam('subop');

		if (getURLParam("subopparam")) {
			caller_subop = caller_subop + ":" + getURLParam("subopparam");
		}

		if (tab) {
			active_tab = tab;
		}

		if (navigator.userAgent.match("Opera")) {	
			setTimeout("selectTab()", 500);
		} else {
			selectTab(active_tab);
		}
		notify("");

		loading_set_progress(60);

	} catch (e) {
		exception_error("init_second_stage", e);
	}
}

function init() {

	try {
	
		if (arguments.callee.done) return;
		arguments.callee.done = true;		

		if (getURLParam('debug')) {
			Element.show("debug_output");
			debug('debug mode activated');
		}

		// IE kludge
		if (!xmlhttp) {
			document.getElementById("prefContent").innerHTML = 
				"<b>Fatal error:</b> This program needs XmlHttpRequest " + 
				"to function properly. Your browser doesn't seem to support it.";
			return;
		}

		loading_set_progress(30);

		xmlhttp.open("GET", "backend.php?op=rpc&subop=sanityCheck", true);
		xmlhttp.onreadystatechange=backend_sanity_check_callback;
		xmlhttp.send(null);

	} catch (e) {
		exception_error("init", e);
	}
}

function categorizeSelectedFeeds() {

	if (!xmlhttp_ready(xmlhttp)) {
		printLockingError();
		return
	}

	var sel_rows = getSelectedFeeds();

	var cat_sel = document.getElementById("sfeed_set_fcat");
	var cat_id = cat_sel[cat_sel.selectedIndex].value;

	if (sel_rows.length > 0) {

		notify_progress("Changing category of selected feeds...");

		var query = "backend.php?op=pref-feeds&subop=categorize&ids="+
			param_escape(sel_rows.toString()) + "&cat_id=" + param_escape(cat_id);

		new Ajax.Request(query, {
			onComplete: function(transport) { 
				feedlist_callback2(transport); 
			} });

	} else {

		alert(__("No feeds are selected."));

	}

}

function validatePrefsReset() {
	try {
		var ok = confirm(__("Reset to defaults?"));

		if (ok) {

			var query = Form.serialize("pref_prefs_form");
			query = query + "&subop=reset-config";
			debug(query);

			xmlhttp.open("POST", "backend.php", true);
			xmlhttp.onreadystatechange=prefs_reset_callback;
			xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xmlhttp.send(query);
		}

	} catch (e) {
		exception_error("validatePrefsSave", e);
	}

	return false;

}

function feedBrowserSubscribe() {
	try {

		var selected = getSelectedFeedsFromBrowser();

		if (selected.length > 0) {
			closeInfoBox();

			var query = "backend.php?op=pref-feeds&subop=massSubscribe&ids="+
				param_escape(selected.toString());

			new Ajax.Request(query, {
				onComplete: function(transport) { 
					feedlist_callback2(transport); 
				} });

		} else {
			alert(__("No feeds are selected."));
		}

	} catch (e) {
		exception_error("feedBrowserSubscribe", e);
	}
}

function updateBigFeedBrowserBtn() {
	notify_progress("Loading, please wait...");
	return updateBigFeedBrowser();
}

function selectPrefRows(kind, select) {

	if (kind) {
		var opbarid = false;	
		var nchk = false;
		var nrow = false;
		var lname = false;

		if (kind == "feed") {
			opbarid = "feedOpToolbar";
			nrow = "FEEDR-";
			nchk = "FRCHK-";			
			lname = "prefFeedList";
		} else if (kind == "fcat") {
			opbarid = "catOpToolbar";
			nrow = "FCATR-";
			nchk = "FCCHK-";
			lname = "prefFeedCatList";
		} else if (kind == "filter") {
			opbarid = "filterOpToolbar";
			nrow = "FILRR-";
			nchk = "FICHK-";
			lname = "prefFilterList";
		} else if (kind == "label") {
			opbarid = "labelOpToolbar";
			nrow = "LILRR-";
			nchk = "LICHK-";
			lname = "prefLabelList";
		} else if (kind == "user") {
			opbarid = "userOpToolbar";
			nrow = "UMRR-";
			nchk = "UMCHK-";
			lname = "prefUserList";
		}

		if (opbarid) {
			selectTableRowsByIdPrefix(lname, nrow, nchk, select);
			disableContainerChildren(opbarid, !select);
		}

	} 
}


function toggleSelectPrefRow(sender, kind) {

	toggleSelectRow(sender);

	if (kind) {
		var opbarid = false;	
		var nsel = -1;
		
		if (kind == "feed") {
			opbarid = "feedOpToolbar";
			nsel = getSelectedFeeds();
		} else if (kind == "fcat") {
			opbarid = "catOpToolbar";
			nsel = getSelectedFeedCats();
		} else if (kind == "filter") {
			opbarid = "filterOpToolbar";
			nsel = getSelectedFilters();
		} else if (kind == "label") {
			opbarid = "labelOpToolbar";
			nsel = getSelectedLabels();
		} else if (kind == "user") {
			opbarid = "userOpToolbar";
			nsel = getSelectedUsers();
		}

		if (opbarid && nsel != -1) {
			disableContainerChildren(opbarid, nsel == false);
		}

	} 
}

function toggleSelectFBListRow(sender) {
	toggleSelectListRow(sender);
	disableContainerChildren("fbrOpToolbar", getSelectedFeedsFromBrowser() == 0);
}

var seq = "";

function pref_hotkey_handler(e) {
	try {

		var keycode;
		var shift_key = false;

		try {
			shift_key = e.shiftKey;
		} catch (e) {

		}

		if (window.event) {
			keycode = window.event.keyCode;
		} else if (e) {
			keycode = e.which;
		}

		var keychar = String.fromCharCode(keycode);

		if (keycode == 27) { // escape
			if (Element.visible("hotkey_help_overlay")) {
				Element.hide("hotkey_help_overlay");
			}
			hotkey_prefix = false;
			closeInfoBox();
		} 

		if (!hotkeys_enabled) {
			debug("hotkeys disabled");
			return;
		}

		if (keycode == 16) return; // ignore lone shift

		if ((keycode == 67 || keycode == 71) && !hotkey_prefix) {
			hotkey_prefix = keycode;
			debug("KP: PREFIX=" + keycode + " CHAR=" + keychar);
			return;
		}

		if (Element.visible("hotkey_help_overlay")) {
			Element.hide("hotkey_help_overlay");
		}

		if (keycode == 13 || keycode == 27) {
			seq = "";
		} else {
			seq = seq + "" + keycode;
		}

		/* Global hotkeys */

		if (!hotkey_prefix) {

			if (keycode == 68 && shift_key) { // d
				if (!Element.visible("debug_output")) {
					Element.show("debug_output");
					debug('debug mode activated');
				} else {
					Element.hide("debug_output");
				}
				return;
			}
	
			if ((keycode == 191 || keychar == '?') && shift_key) { // ?
				if (!Element.visible("hotkey_help_overlay")) {
					//Element.show("hotkey_help_overlay");
					Effect.Appear("hotkey_help_overlay", {duration : 0.3});
				} else {
					Element.hide("hotkey_help_overlay");
				}
				return false;
			}

			if (keycode == 191 || keychar == '/') { // /
				var search_boxes = new Array("label_search", 
					"feed_search", "filter_search", "user_search", "feed_browser_search");

				for (var i = 0; i < search_boxes.length; i++) {
					var elem = document.getElementById(search_boxes[i]);
					if (elem) {
						focus_element(search_boxes[i]);
						return false;
					}
				}
			}
		}

		/* Prefix c */

		if (hotkey_prefix == 67) { // c
			hotkey_prefix = false;

			if (keycode == 70) { // f
				displayDlg("quickAddFilter");
				return false;
			}

			if (keycode == 83) { // s
				displayDlg("quickAddFeed");
				return false;
			}

/*			if (keycode == 76) { // l
				displayDlg("quickAddLabel");
				return false;
			} */

			if (keycode == 85) { // u
				// no-op
			}

			if (keycode == 67) { // c
				editFeedCats();
				return false;
			}

			if (keycode == 84 && shift_key) { // T
				browseFeeds();
				return false;
			}

		}

		/* Prefix g */

		if (hotkey_prefix == 71) { // g

			hotkey_prefix = false;

			if (keycode == 49 && document.getElementById("genConfigTab")) { // 1
				selectTab("genConfig");
				return false;
			}

			if (keycode == 50 && document.getElementById("feedConfigTab")) { // 2
				selectTab("feedConfig");
				return false;
			}

			if (keycode == 51 && document.getElementById("filterConfigTab")) { // 4
				selectTab("filterConfig");
				return false;
			}

			if (keycode == 52 && document.getElementById("labelConfigTab")) { // 5
				selectTab("labelConfig");
				return false;
			}

			if (keycode == 53 && document.getElementById("userConfigTab")) { // 6
				selectTab("userConfig");
				return false;
			}

			if (keycode == 88) { // x
				return gotoMain();
			}

		}

		if (document.getElementById("piggie")) {
	
			if (seq.match("807371717369")) {
				seq = "";
				piggie(true);
			} else {
				piggie(false);
			}
		}

		if (hotkey_prefix) {
			debug("KP: PREFIX=" + hotkey_prefix + " CODE=" + keycode + " CHAR=" + keychar);
		} else {
			debug("KP: CODE=" + keycode + " CHAR=" + keychar);
		}

	} catch (e) {
		exception_error("pref_hotkey_handler", e);
	}
}

function editFeedCats() {
	try {
		document.getElementById("subscribe_to_feed_btn").disabled = true;
	
		try {
			document.getElementById("top25_feeds_btn").disabled = true;
		} catch (e) {
			// this button is not always available, no-op if not found
		}
	
		var query = "backend.php?op=pref-feeds&subop=editCats";

		new Ajax.Request(query,	{
			onComplete: function(transport) {
				infobox_feed_cat_callback2(transport);
			} });
	} catch (e) {
		exception_error("editFeedCats", e);
	}
}

function showFeedsWithErrors() {
	displayDlg('feedUpdateErrors');
}

function changeUserPassword() {

	try {

		if (!xmlhttp_ready(xmlhttp)) {
			printLockingError();
			return false;
		}
	
		var f = document.forms["change_pass_form"];

		if (f) {
			if (f.OLD_PASSWORD.value == "") {
				new Effect.Highlight(f.OLD_PASSWORD);
				notify_error("Old password cannot be blank.");
				return false;
			}

			if (f.NEW_PASSWORD.value == "") {
				new Effect.Highlight(f.NEW_PASSWORD);
				notify_error("New password cannot be blank.");
				return false;
			}

			if (f.CONFIRM_PASSWORD.value == "") {
				new Effect.Highlight(f.CONFIRM_PASSWORD);
				notify_error("Entered passwords do not match.");
				return false;
			}

			if (f.CONFIRM_PASSWORD.value != f.NEW_PASSWORD.value) {
				new Effect.Highlight(f.CONFIRM_PASSWORD);
				new Effect.Highlight(f.NEW_PASSWORD);
				notify_error("Entered passwords do not match.");
				return false;
			}

		}

		var query = Form.serialize("change_pass_form");
	
		notify_progress("Trying to change password...");
	
		xmlhttp.open("POST", "backend.php", true);
		xmlhttp.onreadystatechange=changepass_callback;
		xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xmlhttp.send(query);

	} catch (e) {
		exception_error("changeUserPassword", e);
	}
	
	return false;
}

function changeUserEmail() {

	try {

		if (!xmlhttp_ready(xmlhttp)) {
			printLockingError();
			return false;
		}
	
		var query = Form.serialize("change_email_form");
	
		notify_progress("Trying to change e-mail...");
	
		xmlhttp.open("POST", "backend.php", true);
		xmlhttp.onreadystatechange=notify_callback;
		xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xmlhttp.send(query);

	} catch (e) {
		exception_error("changeUserPassword", e);
	}
	
	return false;

}

function feedlistToggleSLAT() {
	notify_progress("Loading, please wait...");
	updateFeedList()
}

function pubRegenKey() {

	if (!xmlhttp_ready(xmlhttp)) {
		printLockingError();
		return false;
	}

	var ok = confirm(__("Replace current publishing address with a new one?"));

	if (ok) {

		notify_progress("Trying to change address...");

		xmlhttp.open("GET", "backend.php?op=rpc&subop=regenPubKey");
		xmlhttp.onreadystatechange=replace_pubkey_callback;
		xmlhttp.send(null);
	}

	return false;
}

function pubToClipboard() {

	try {

		if (!xmlhttp_ready(xmlhttp)) {
			printLockingError();
			return false;
		}
	
		var link = document.getElementById("pubGenAddress");
		alert(link.href);

	} catch (e) {
		exception_error("pubToClipboard", e);
	}

	return false; 
}

function validatePrefsSave() {
	try {

		var ok = confirm(__("Save current configuration?"));

		if (ok) {

			var query = Form.serialize("pref_prefs_form");
			query = query + "&subop=save-config";
			debug(query);

			xmlhttp.open("POST", "backend.php", true);
			xmlhttp.onreadystatechange=notify_callback;
			xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xmlhttp.send(query);
		}

	} catch (e) {
		exception_error("validatePrefsSave", e);
	}

	return false;
}

function feedActionChange() {
	try {
		var chooser = document.getElementById("feedActionChooser");
		var opid = chooser[chooser.selectedIndex].value;

		chooser.selectedIndex = 0;
		feedActionGo(opid);
	} catch (e) {
		exception_error("feedActionChange", e);
	}
}

function feedActionGo(op) {	
	try {
		if (op == "facEdit") {

			var rows = getSelectedFeeds();

			if (rows.length > 1) {
				editSelectedFeeds();
			} else {
				editSelectedFeed();
			}
		}

		if (op == "facClear") {
			clearSelectedFeeds();
		}

		if (op == "facPurge") {
			purgeSelectedFeeds();
		}

		if (op == "facEditCats") {
			editFeedCats();
		}

		if (op == "facRescore") {
			rescoreSelectedFeeds();
		}

		if (op == "facUnsubscribe") {
			removeSelectedFeeds();
		}

	} catch (e) {
		exception_error("feedActionGo", e);

	}
}

function clearFeedArticles(feed_id) {

	notify_progress("Clearing feed...");

	var query = "backend.php?op=pref-feeds&quiet=1&subop=clear&id=" + feed_id;

	new Ajax.Request(query,	{
		onComplete: function(transport) {
				notify('');
			} });

	return false;
}

function rescoreSelectedFeeds() {

	var sel_rows = getSelectedFeeds();

	if (sel_rows.length > 0) {

		//var ok = confirm(__("Rescore last 100 articles in selected feeds?"));
		var ok = confirm(__("Rescore articles in selected feeds?"));

		if (ok) {
			notify_progress("Rescoring selected feeds...", true);
	
			var query = "backend.php?op=pref-feeds&subop=rescore&quiet=1&ids="+
				param_escape(sel_rows.toString());

			new Ajax.Request(query,	{
				onComplete: function(transport) {
						notify_callback2(transport);
			} });

		}
	} else {
		alert(__("No feeds are selected."));
	}

	return false;
}

function rescore_all_feeds() {
	var ok = confirm(__("Rescore all articles? This operation may take a lot of time."));

	if (ok) {
		notify_progress("Rescoring feeds...", true);

		var query = "backend.php?op=pref-feeds&subop=rescoreAll&quiet=1";

		new Ajax.Request(query,	{
			onComplete: function(transport) {
					notify_callback2(transport);
		} });
	}
}

function removeFilter(id, title) {

	try {

		var msg = __("Remove filter %s?").replace("%s", title);
	
		var ok = confirm(msg);
	
		if (ok) {
			closeInfoBox();
	
			notify_progress("Removing filter...");
		
			var query = "backend.php?op=pref-filters&subop=remove&ids="+
				param_escape(id);

			new Ajax.Request(query,	{
				onComplete: function(transport) {
						filterlist_callback2(transport);
			} });

		}

	} catch (e) {
		exception_error("removeFilter", e);
	}

	return false;
}

function unsubscribeFeed(id, title) {

	if (!xmlhttp_ready(xmlhttp)) {
		printLockingError();
		return
	}

	var msg = __("Unsubscribe from %s?").replace("%s", title);

	var ok = confirm(msg);

	if (ok) {
		closeInfoBox();

		notify_progress("Removing feed...");
	
		xmlhttp.open("GET", "backend.php?op=pref-feeds&subop=remove&ids="+
			param_escape(id), true);
		xmlhttp.onreadystatechange=filterlist_callback;
		xmlhttp.send(null);
	}

	return false;

	return false;

}

function feedsEditSave() {
	try {

		if (!xmlhttp_ready(xmlhttp)) {
			printLockingError();
			return
		}

		var ok = confirm(__("Save changes to selected feeds?"));

		if (ok) {

			var f = document.forms["batch_edit_feed_form"];

			var query = Form.serialize("batch_edit_feed_form");

			/* Form.serialize ignores unchecked checkboxes */

			if (!query.match("&hidden=") && 
					f.hidden.disabled == false) {
				query = query + "&hidden=false";
			}

			if (!query.match("&rtl_content=") && 
					f.rtl_content.disabled == false) {
				query = query + "&rtl_content=false";
			}

			if (!query.match("&private=") && 
					f.private.disabled == false) {
				query = query + "&private=false";
			}

			if (!query.match("&cache_images=") && 
					f.cache_images.disabled == false) {
				query = query + "&cache_images=false";
			}

			if (!query.match("&include_in_digest=") && 
					f.include_in_digest.disabled == false) {
				query = query + "&include_in_digest=false";
			}
	
			closeInfoBox();
	
			notify_progress("Saving feeds...");
	
			new Ajax.Request("backend.php", {
				parameters: query,
				onComplete: function(transport) { 
					feedlist_callback2(transport); 
				} });

		}

		return false;
	} catch (e) {
		exception_error("feedsEditSave", e);
	}
}

function batchFeedsToggleField(cb, elem, label) {
	try {
		var f = document.forms["batch_edit_feed_form"];
		var l = document.getElementById(label);

		if (cb.checked) {
			f[elem].disabled = false;

			if (l) {
				l.className = "";
			};

//			new Effect.Highlight(f[elem], {duration: 1, startcolor: "#fff7d5",
//				queue: { position:'end', scope: 'BPEFQ', limit: 1 } } );

		} else {
			f[elem].disabled = true;

			if (l) {
				l.className = "insensitive";
			};

		}
	} catch (e) {
		exception_error("batchFeedsToggleField", e);
	}
}


