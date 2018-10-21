"use strict";

var AmpacheSession = require("ampache");
var config = new (require("v-conf"))();
var exec = require("child_process").exec;
var execSync = require("child_process").execSync;
var fs = require("fs-extra");
var libQ = require("kew");


function ControllerAmpache(context)
{
	var self = this;
	
	this.context = context;
	this.commandRouter = this.context.coreCommand;
	this.logger = this.context.logger;
	this.configManager = this.context.configManager;
}

ControllerAmpache.prototype.onVolumioStart = function()
{
	var file = this.commandRouter.pluginManager.getConfigurationFile(this.context, "config.json");
	
	this.config = new (require("v-conf"))();
	this.config.loadFile(file);
}

ControllerAmpache.prototype.onStart = function()
{
	var username = this.config.get("username");
	var password = this.config.get("password");
	var endpoint = this.config.get("endpoint");
	
	this.ampache = new AmpacheSession(username, password, endpoint);
	this.active = false;
	this.session = false;
	
	this.ampache.authenticate(function(err, body)
	{
		if(!err)
		{
			this.active = true;
			this.session = body;
		}
	});
};

ControllerAmpache.prototype.getConfigurationFiles = function()
{
	return [ "config.json" ];
}


module.exports = ControllerAmpache;