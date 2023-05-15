Following info can be captured by this logger.
-----------------------------------------------------------------------------------
Client Name
Application Name
User Name
Login time
Logout time
Page name
Selections/Filters/Key words (Optional)
Visitor's IP Address
Screen Resolution (optional)
Browser, OS & Device Info (from Useragent)
-----------------------------------------------------------------------------------

This file provides the step by step guide to use AQ Logger :

1. Database Part :
Obtain the db script from: http://svn.aqinsights.com/svn/internal/logger-module/trunk/database and execute it to create necessary tables & stored procedures.

2. Dll part:
	Refer the dll in the project. It has following methods:
		 i) AQ.Logger.TrackSignIn(string ClientName, string ApplicationName, string UserName, string screenSize) (+1 overload)
		ii) AQ.Logger.TrackEvent(string Feature, string Selections)(+1 overload). // Selections parameter can take upto 1000 characters.

Add the key in the appsettings of webconfig as 
	 <appSettings>
   		<add key="AQLoggerConnectionString" value="Project_ConnectionString_Name"/>
   		<add key="AQLoggerEnabled" value="true"/>
   	</appSettings>

Calling samples:
----------------
AQ.Logger.TrackSignIn("Verizon", "Brand Tracker", User.Identity.Name); // At login page

AQ.Logger.TrackEvent("Snapshot");
AQ.Logger.TrackEvent("Snapshot", "Excel download");
AQ.Logger.TrackEvent("Admin Module", "Market data upload");
AQ.Logger.TrackEvent("Deepdive", "{\"market\":\"Japan\", \"timeperiod\": 2014}");

AQ.Logger.TrackSignOut(); // At logout page


To capture user's screen size:
1. Paste this client script at the end of login page. This requires jQuery reference.
<script type="text/javascript">
    $('<input>').attr({
        type: 'hidden',
        id: 'hidScreenSize',
        name: 'hidScreenSize',
        value: screen.width + " x " + screen.height
    }).appendTo('form');
</script>

2. Access & log the screen size in the login controller
string scrsize = Request["hidScreenSize"];
AQ.Logger.TrackSignIn("Verizon", "Brand Tracker", User.Identity.Name, scrsize);
