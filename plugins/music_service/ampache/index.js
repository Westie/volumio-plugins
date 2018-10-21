"use strict";

var AmpacheSession = require("ampache");
var config = new (require("v-conf"))();
var exec = require("child_process").exec;
var execSync = require("child_process").execSync;
var fs = require("fs-extra");
var libQ = require("kew");


/**
 *	Constructor
 */
function ControllerAmpache(context)
{
	var self = this;
	
	this.context = context;
	this.commandRouter = this.context.coreCommand;
	this.logger = this.context.logger;
	this.configManager = this.context.configManager;
}


/**
 *	Start of volumio
 */
ControllerAmpache.prototype.onVolumioStart = function()
{
	var file = this.commandRouter.pluginManager.getConfigurationFile(this.context, "config.json");
	
	this.config = new (require("v-conf"))();
	this.config.loadFile(file);
	
	return libQ.resolve();
}


/**
 *	Start of this volumio plugin
 */
ControllerAmpache.prototype.onStart = function()
{
	var defer = libQ.defer();
	
	var username = this.config.get("username");
	var password = this.config.get("password");
	var endpoint = this.config.get("endpoint");
	
	this.ampache = new AmpacheSession(username, password, endpoint);
	this.active = false;
	this.session = false;
	
	this.ampache.authenticate(function(err, body)
	{
		if(err)
		{
			defer.reject();
		}
		else
		{
			this.active = true;
			this.session = body;
			
			defer.resolve();
		}
	});
	
	return defer.promise;
}


/**
 *	Get configuration files
 */
ControllerAmpache.prototype.getConfigurationFiles = function()
{
	return [ "config.json" ];
}


/**
 *	Save configuration files
 */
ControllerAmpache.prototype.saveAmpacheAccount = function(data)
{
	var defer = libQ.defer();
	
	this.config.set("username", data["username"]);
	this.config.set("password", data["password"]);
	this.config.set("endpoint", data["endpoint"]);
	
	this.commandRouter.pushToastMessage("success", "Configuration update", "The configuration has been successfully updated");
	
	return defer.resolve();
};


/**
 *	Get UI config
 */
ControllerAmpache.prototype.getUIConfig = function()
{
	var defer = libQ.defer();
	var self = this;
	
	var lang_code = this.commandRouter.sharedVars.get("language_code");
	
	self.commandRouter.i18nJson(__dirname + "/i18n/strings_" + lang_code + ".json", __dirname + "/i18n/strings_en.json", __dirname + "/UIConfig.json").then(function(uiconf) {
		uiconf.sections[0].content[0].value = self.config.get("username");
		uiconf.sections[0].content[1].value = self.config.get("password");
		uiconf.sections[0].content[2].value = self.config.get("endpoint");
		
		defer.resolve(uiconf);
	}).fail(function() {
		defer.reject(new Error());
	});
	
	return defer.promise;
};


/**
 *	Hook into volumio
 */
ControllerAmpache.prototype.addToBrowseSources = function()
{
	var data = {
		name: "Ampache",
		uri: "ampache",
		plugin_type: "music_service",
		plugin_name: "ampache"
	};
	
	this.commandRouter.volumioAddToBrowseSources(data);
};


/**
 *	Interesting router
 */
ControllerAmpache.prototype.handleBrowseUri = function(curUri)
{
    var self = this;
    var response = undefined;
    
    return response;
}


/**
 *	Export
 */
module.exports = ControllerAmpache;