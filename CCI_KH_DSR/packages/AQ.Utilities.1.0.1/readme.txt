1. Add the following url rewrite rule in main web config file.
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ContentVersioned">
          <match url="^(.*)(\/v-[0-9]+\/)(.*)" />
          <action type="Rewrite" url="{R:1}/{R:3}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>

2. Start using @Utils.ContentVersioned function at applicable places of .cshtml pages.
Ex: 
    <script src="@Utils.ContentVersioned("~/Scripts/home.js")" > </script>
    <link href="@Utils.ContentVersioned("~/Content/home.css")" rel="stylesheet" />
    <img src="@Utils.ContentVersioned("~/Content/Images/black-cat.gif")" />
    <div style="background-image: url('@Utils.ContentVersioned("~/Content/Images/cat 300.jpg")')" class="divBg"></div>

Output sample:
    <script src="/Scripts/v-20161128174738/home.js" > </script>
    <link href="/Content/v-20161128181759/home.css" rel="stylesheet" />    
    <img src="/Content/Images/v-20140114122311/black-cat.gif" />
    <div style="background-image: url('/Content/Images/v-20140925210706/cat 300.jpg')" class="divBg"></div>

Note: Parameter should be a relative URL.

Works in IIS & IIS Express.

Done!