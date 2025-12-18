# EWM Work Item Children Display Plugin

This plugin displays the children of an EWM work item in a table format.
By default, it shows the child’s type, ID, summary, owner, and status.
It can show other attributes (well known or custom attributes) by configuring it in the eclipse EWM client and modify the values of the child item attributes

## Server Installation

Unzip the file fr.syncheo.ewm.childitem.presentation_x.x.x.zip.

Once unzipped, it contains two elements:

* a folder fr.syncheo.ewm.childitem.presentation_updatesite/
* a file fr.syncheo.ewm.childitem.presentation_updatesite.ini

Copy the folder fr.syncheo.ewm.childitem.presentation_updatesite/ into
<ELMCCMServerDir>/server/conf/ccm/sites

Copy the file fr.syncheo.ewm.childitem.presentation_updatesite.ini into
<ELMCCMServerDir>/server/conf/ccm/provision_profile

Request a plugin reload.

Go to the URL:
https://<JAZZ_EWM_URL>/ccm/admin?internal=true

Navigate to:

--> Server Reset

Then click the button:

--> Request Server Reset

Restart the server.

## Add the Plugin to the UI

Once the plugin is installed on the server, it must be added to the work item UI.
To do so, go to the project area configuration → Work Items → Editor Presentation.

Select the appropriate section and click on the green + icon.

Unlike adding an attribute, you must select the Non-Attribute Presentation radio button and then choose the "Child Workitem Table" presentation.

## Plugin Configuration

To add additional attributes, use the Eclipse EWM client and go to the Process Configuration of the project area.

Then navigate to:
Project Configuration → Configuration Data → Work Items → Editor Presentation

In the section where the Child Workitem Table presentation was added,
click on it and add to the Properties:

key: attributes
value: the names of the attributes to add, separated by commas, with no spaces before and after the commas

Reload the workitem page in your browser, the added attributes should be shown in the table

## Configure the editability of the child item attributes

To define certain attribute as editable, use the Eclipse EWM client and go to the Process Configuration of the project area.

Then navigate to:
Project Configuration → Configuration Data → Work Items → Editor Presentation

In the section where the Child Workitem Table presentation was added,
click on it and add to the Properties:

key: editable
value: the names of the attributes you want to be able to edit

Reload the workitem page in your browser, the added attributes should be shown in the table


## List of all the attribute that can be viewed
All the attributes can be viewed, but by default, the id, Type, Owned By, State and Summary are shown by default


## List of all the attribute that can be edited
All the custom attributes can be viewed as well as
Durée, Due Date, Estimate, Filed Against, Found In, Owned By, Planned For, Priority, Resolution, Severity, State, Summary, Tags, Time Spent 