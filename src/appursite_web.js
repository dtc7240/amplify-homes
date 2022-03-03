/**
 * This file should be served to all clients (both browser and tAPP) on every page load.  It's primary function
 * is to check for the existence of a localStorage variable that indicates whether it is running in a tAPP client
 * or not.  If the localStorage variable is NOT set, it assumes it is running in a browser client and does little 
 * else.  If the localStorage variable IS set, it knows it is running in a tAPP client and requests the additional
 * resources that it requires.  The additional resources include JavaScript files from the mobile device itself,
 * as well as any other files you've indicated for it to request from your web server.
 * 
 * @summary	Requests additional resources when running in a tAPP client.
 * 
 * @version	2.0.3
 * @since 	1.0.0
 * @license	Website Plugin End User License Agreement
 * 
 * License:     Website Plugin End User License Agreement
 * License URI: http://www.mobiletappestry.com/legal/license-website-plugins/
 * 
 * Copyright (c) 2016 MobiletAPPestry, LLC, ALL RIGHTS RESERVED
 * 
 * Permission to use this software subject to the relevant licenses with MobiletAPPestry, LLC
 * -- Website Plugin End User License Agreement 
 * 	-- included in this plugin and online @ http://www.mobiletappestry.com/legal/license-website-plugins/
 * -- Development Application End User License Agreement
 * 	-- for use with debuggable tAPPs @ http://www.mobiletappestry.com/legal/license-dev-and-test-app/
 * -- Production Application End User License Agreement 
 * 	-- for use with production tAPPs @ http://www.mobiletappestry.com/legal/license-production-app/
 */

(function ( appursite ) {

	appursite.versions = appursite.versions || {};
	appursite.versions.appursite_software = "Appursite 2.0.3";

	/*********************************************************************************************************
	**	BEGIN CUSTOM SETTINGS AREA																				**
	*********************************************************************************************************/

	
	/***** DEFAULT VIBRATION *****/
	// If you'd like to disable the default vibration on page loads and link clicks, set this to true.
	//
	// Set to boolean true or false (not as a string)
	var no_vibration_on_transitions = false;


	/***** APPURSITE_APP.JS FILE *****/
	// The appursite_app.js file is the perfect place to put code meant only to run in your app (and not a traditional browser),
	// as it will only be requested by a tAPP client ... the browser will never ask your server for it.  The appursite.tAPP_load
	// function in appursite_app.js will also always run at the correct time ... after the onDeviceReady event has fired (meaning 
	// the native device features of the device are now accessible).
	//
	// Add the appursite_app.js file to your server in perhaps the same folder as this appursite_web.js file and then set the
	// following value (as a string) to the relative location of this file on your server (relative ... don't include protocol or 
	// domain ... string should begin with '/')  Ex: = '/wp-content/plugins/appursite/includes/js/appursite_app.js';
	var appursite_app_js = '';
	// Note:  You'll know you've got this right when you see (just once) a "Welcome to your tAPP" alert.  Or anytime by using Safari's
	// Web Inspector or Chrome://inspect against a debuggable tAPP and check for the existence of the file loaded into the client.


	/***** SECONDARY DOMAINS *****/
	// If this is the primary domain for your tAPP, any appursite-enabled domains that you add here will open and run in your tAPP
	// instead of opening in the system browser when a user clicks an anchor link to them.
	// Note: if this is not the primary domain for your tAPP, this setting will have no effect. The primary domain is the initial 
	// domain to which your tAPP is set to launch.
	// 
	// This allows you to run a multi-domain environment as the content of your tAPP, such as when you host a shopping cart in a 
	// different domain. Just keep in mind that each domain meant to run in your tAPP must be appursite-enabled, thus you must own 
	// and control the domain. Any hyperlink to a non-appursite-enabled domain will be redirected to the system browser.
	//
	// Also keep in mind that any secondary domains you add here must be accessible via the same protocol you are using between your 
	// tAPP and your primary domain. In other words, you can't go back and forth between http and https. If your primary domain is 
	// https and you attempt to link the user to a secondary domain you list below via http, the link will be redirected to the system 
	// browser (and vice-versa).
	//
	// Domain, as defined here, is the value returned by window.location.hostname. Set as boolean false if no secondary domains, or EX:
	// var tapp_secondary_domains = ["www.example.com"];
	// var tapp_secondary_domains = ["www.example.com", "sub.example.com", "example2.com"];
	var tapp_secondary_domains = false;


	/***** CUSTOM SCHEME OVERRIDE *****/
	// Use this only if instructed.
	//
	// A custom scheme can be used to open an app directly if that app is on a user's device.  In a URL, it might look like
	// www.example.com://path/to/file versus the typical http://path/to/file or https://path/to/file
	//
	// Generally the custom scheme for your tAPP has been set identical to your primary domain.  However, if a primary domain has 
	// an odd character such as a dash in it that can't be included in a custom scheme, you'll be instructed as to what the custom 
	// scheme for your tAPP was set to ... and that is what you will put here as a string.  Otherwise leave as a blank string.
	var custom_scheme_override = '';


	/***** TAPP NAME AND APP STORE IDS *****/
	// As your production tAPPs go live in their respective stores, enter their AppID's here. You will also want to enter a short 
	// name for your app at any time, but at least by the time you enter your first AppID.
	//
	// Entering these values automatically enables cool features such as AppLinks, App Indexing, and App Banners.
	var tapp_name = '';		// Short name referring to your tAPP -- i.e. "MobiletAPP"
	var apple_appstore_id = '';		// Android Google Play Store AppID -- generally the reverse of your primary domain, i.e. "com.mobiletappestry.www"
	var google_playstore_id = '';	// Apple App Store AppID -- generally a 10 digit number, i.e. "1234567890" 


	/*********************************************************************************************************
	**	END OF CUSTOM SETTINGS AREA																			**
	*********************************************************************************************************/

	/******************************************** Settings Code *********************************************/

	appursite.modules = appursite.modules || {};
	appursite.modules.appursite = appursite.modules.appursite || {};
	appursite.modules.appursite.no_vibration_on_transitions = no_vibration_on_transitions;
	if ( appursite_app_js ) {
		appursite.modules.appursite.js_file = appursite_app_js;
	}
	appursite.modules.appursite.tapp_secondary_domains = tapp_secondary_domains;
	
	var location = window.location;
	var custom_scheme = location.hostname;
	if ( custom_scheme_override ) {
		custom_scheme = custom_scheme_override;
	}
	custom_scheme = custom_scheme + "://";
	var full_path = location.pathname + location.search;
	full_path = full_path.substr(1);
	
	// Support for iOS App Banner
	if ( apple_appstore_id ) {
		var meta1 = document.createElement('meta');
		meta1.name = "apple-itunes-app";
		meta1.content = "app-id=" + apple_appstore_id + ", app-argument=" + location.href;
		document.head.appendChild(meta1);
	}
	// Support for Google App Indexing
	if ( google_playstore_id ) {
		var link1 = document.createElement('link');
		link1.rel = "alternate";
		link1.href = "android-app://" + google_playstore_id + "/" + location.protocol.substring(0, location.protocol.length-1) + "/" + location.hostname + "/" + full_path;
		document.head.appendChild(link1);
	}
	if ( apple_appstore_id ) {
		var link2 = document.createElement('link');
		link2.rel = "alternate";
		link2.href = "ios-app://" + apple_appstore_id + "/" + location.hostname + "/" + full_path;
		document.head.appendChild(link2);
	}
	// Support for AppLinks
	var meta2 = document.createElement('meta');
	meta2.setAttribute ("property", "al:ios:url");
	meta2.content = custom_scheme + full_path;
	document.head.appendChild(meta2);
	var meta3 = document.createElement('meta');
	meta3.setAttribute ("property", "al:android:url");
	meta3.content = custom_scheme + full_path;
	document.head.appendChild(meta3);
	if ( apple_appstore_id ) {
		var meta4 = document.createElement('meta');
		meta4.setAttribute ("property", "al:ios:app_store_id");
		meta4.content = apple_appstore_id;
		document.head.appendChild(meta4);
	}
	if ( google_playstore_id ) {
		var meta5 = document.createElement('meta');
		meta5.setAttribute ("property", "al:android:package");
		meta5.content = google_playstore_id;
		document.head.appendChild(meta5);
	}
	if ( tapp_name ) {
		var meta6 = document.createElement('meta');
		meta6.setAttribute ("property", "al:ios:app_name");
		meta6.content = tapp_name;
		document.head.appendChild(meta6);
		var meta7 = document.createElement('meta');
		meta7.setAttribute ("property", "al:android:app_name");
		meta7.content = tapp_name;
		document.head.appendChild(meta7);
	}

	/******************************************** Standard Code *********************************************/

	appursite.is_app = false;
	appursite.tapp = false;
	
	document.addEventListener("DOMContentLoaded", function(event) { 
		if ( ! appursite.getQueryVar('no_tAPP') && localStorage.tAPP_app ) {
			appursite.is_app = localStorage.tAPP_app;
			appursite.tAPP_version = localStorage.tAPP_version;
			var meta = document.createElement('meta');
			meta.httpEquiv = "Content-Security-Policy";
			meta.content = "default-src 'self' 'unsafe-inline' 'unsafe-eval' http: https: gap: cdvfile: data: content:";
			document.head.appendChild(meta);
			var files = JSON.parse(localStorage.tAPP_files_to_request);
			for ( var file in files ) {
				appursite.loadJsCssFile(localStorage[files[file]], 'js');
			}
			for ( var module in appursite.modules ) {
				if ( typeof appursite.modules[module].js_file != "undefined" ) {
					appursite.loadJsCssFile(appursite.modules[module].js_file, 'js');
				}
			}
		}
	});
	
	appursite.loadJsCssFile = function(filename, filetype) {	
		function onLoadJsCssFileError(fileref) {
			console.log('There was an error attempting to load the file:  ' + fileref.src );
		}
		var fileref;
		if ( filetype === 'js' ) {
			fileref = document.createElement('script');
			fileref.type = 'text/javascript';
			fileref.src = filename;
			fileref.onerror = function(){onLoadJsCssFileError(fileref)};
		} else if ( filetype === 'css' ) {
			fileref = document.createElement('link');
			fileref.rel = 'stylesheet';
			fileref.type = 'text/css';
			fileref.href = filename;
			fileref.onerror = function(){onLoadJsCssFileError(fileref)};
		}
		if (typeof fileref!="undefined")
			document.head.appendChild(fileref);
	};

	/* Return a querystring variable...thanks to CSS-tricks */
	appursite.getQueryVar = function(query_string_key) {
			var query = window.location.search.substring(1);
			var vars = query.split("&");
			for (var i=0;i<vars.length;i++) {
					var pair = vars[i].split("=");
					if(pair[0] === query_string_key){return pair[1];}
			}
			return(false);
	};

	appursite.handleRequest = function(event){
		if ( typeof event.data.service != 'undefined' && event.data.service === 'appursite_handshake' ) {
			for ( var item in event.data.lsvars ) {
				localStorage[item] = event.data.lsvars[item];
			}
			document.cookie = "tAPP_app=" + event.data.lsvars.tAPP_app + "; path=/";
			var data = {};
			data.appursite_response = 'Ready';
			data.domain = window.location.hostname;
			console.log(data);
			event.source.postMessage(data, event.origin);
		}
	}
	
	window.addEventListener("message", appursite.handleRequest, false);
	window.addEventListener("pageshow", function(event) {
		// This reloads the page if navigating window.history fails to properly recognize the full navigator object
		if ( appursite.is_app && event.persisted && typeof navigator.vibrate == "undefined") {
			location.reload();
		}
	});
		
})( window.appursite = window.appursite || {} );
