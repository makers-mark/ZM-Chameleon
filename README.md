# ZM-Chameleon

This is a chrome extension that overlays the standard montage screen and allows you to have full screen
access. There are a lot of features that I have added too. This has been tested on ZoneMinder version 1.34
and I currently test on Zoneminder version 1.35.5.

## Who is this for and why use use it?

I designed this for a seamless way to interact with a fully functioning ZoneMinder system that is mainly intended to be used for monitoring.
It had to look good and only display what was needed. It was also designed to not be tied to a keyboard. Also seeing a montage at full screen/maximum frame
rate with fluidity too, and there is no better way than to manipulate the existing montage screen. The ZoneMinder montage screen with
a bunch of monitors streaming full resolution jpgs can be taxing on a computer. So if you have a computer that struggles already, this will not
help you. ZoneMinder does have options to limit the bandwidth.

A great option in that case is to use the ZMNinja app, I use it all of the time on the go, and on remote wireless tablets. ZMNinja and ZoneMinder are also open source. 
You can use ZMNinja on the desktop too!
## Compatability

Currenty this should work on any Chromium based browser that supports extensions.
## Installation

Link to current version on the Chrome Web Store [ZM-Chameleon (future link)](https://nolink.yet).

If you wish to try this/modify this in any way, do this:
- Download the source files from this repo
- Go into your browser and go to the Extensions page
- Turn on 'Developer Mode'
- A button will appear at the top 'Load Unpacked'
- After you click that find the folder for the source and select it!
    > Note: If you dowloaded the repo as a zip, you must unzip it first. No matter how you do it though, do not change the folder and file structure of the project 
    or it will not work. The 'manifest.json' file has to directly be in the first level of the folder that you load unpacked on your computer.

## Features

- ### Changes to the Montage Screen
  - Fix the 96% 'Content' div that holds the monitors. This has been fixed in later ZM versions with
  <a href="https://github.com/ZoneMinder/zoneminder/commit/697f117ecdca63f080a6a07bdeaf6178592be231" target="_blank">@697f117</a>.
  - Change the margins around each camera to 0 (optional)
  - Removed the 1px border from below the header
  - Hide the monitor state
  - Use exact percentages for the monitor widths, instead of numbers smaller than they should be
  - There are more options added by using the extension popup

- ### Additions and Options via the Popup 
  - Button to hide/show the whole header on the Montage page
  - Button to override the 'Layout' or monitor per row dropdown on the ZM header
  - Slider to change from 1...10 monitors per row
  - Button that completly hides the scrollbars for more real estate (scroll still functions)
  - A Maximize Single View option that allows you to click on a monitor in the montage and go fullscreen
  right to that monitor. This also hides everything except the view, adds a moveable record button, and
  an optional moveable fps overlay.
  - Added a button to make a flash inset outline around a monitor on Alert/Alarm
  - Width option for the flash outline
  - Grid color picker for borders around the monitors
  - Width slider for the width in pixels of the grid
  - Transparent grid option (overrides the grid color option)
  - Color inversion toggle (kind of for fun, but it can come in handy sometimes)
  - A monitor shadows option
    > Tip: Playing with monitor shadows can make the montage look even nicer, and helps break up monitors next to each other if you use a narrow or nonexistant grid. It is a partially transparent css drop-shadow
  - Then finally a color picker for the monitor shadow
  
- ### Fine Tuning through the Extension Options Page
  - Alarm Opacity -This changes the opacity of the Alarm State notification flash
  - Alert Opacity -Does the same as above for the Alert State flash
  - Flashing speed for the previous two options, in tenths of seconds
  - Option to change the popup max value on the grid and flash sliders  
    > Tip: set this high and then bump it up on the Popups flash width slider, and you can get a semi transparent notification over the entire monitor from the montage page. It helps to lower the Alarm/Alert opacity up above too, I use around 0.23 or so.
  - An option to set a Custom Url that the popup will be available on
  - The monitor shadows CSS drop-shadow string can be customized
  - You can change the amount of the color inversion
  - Option to pass the border drop shadow and color inversion filters through to single monitor views
  - Toggle for showing the FPS or not
  - Color of the FPS
  - Size of the FPS in pixels
  - Toggle to lock/unlock the current stored RECord button position on all monitors
  - You can disable the ability of the RECord button press when the monitor is in Alert state
  - Change the size in pixels of the RECord button
  - Option to obfuscate the user name on the login page
  - A button to clear all extension storage (everything goes back to default)
  ---
- ### ```These next two settings are NOT recommended!!```
  - Option to store the User name and automatically fill it in on the login page
  - Same as above except this stores the password and fills it in
  ---

- ### Mouse Additions
  - Middle mouse click is the fullscreen toggle
  - Left/Right buttons together on the Montage page goes directly back to the Console page
  - Double click on a Single View monitor will go back
  
## License
[MIT](https://choosealicense.com/licenses/mit/)
