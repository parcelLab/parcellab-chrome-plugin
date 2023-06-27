# parcelLab Chrome Extension

<!---
This is the name of the project. It describes the whole project in one sentence, and helps people understand what the main goal and aim of the project is.

Consider putting a CI badge too, for instance:
 [![myworkflow](https://github.com/parcellab/repo-template-base/workflows/myworkflow/badge.svg)](https://github.com/parcellab/repo-template-base/actions?workflow=myworkflow)
-->

## About The Project
A Chrome popup/sidepanel extension to check order status via parcelLab API. This app is written in TypeScript and leverages Bootstrap and jQuery.

![Alt text](https://github.com/parcelLab/parcellab-chrome-plugin/assets/1038621/e5015ff9-f0b1-4c3d-aa17-07820983b64d)

<!---
This is an important component of your project that many new developers often overlook.

Your description is an extremely important aspect of your project. A well-crafted description allows you to show off your work to other developers as well as potential employers.

The quality of a README description often differentiates a good project from a bad project. A good one takes advantage of the opportunity to explain and showcase:
- What your application does,
- Why you used the technologies you used,
- Some of the challenges you faced and features you hope to implement in the future.
-->

## Installation

### Manual Installation
- Clone this repo
```bash  
$ npm install
$ npm run build
```
- Navigate to chrome://extensions/ and check the box for "Developer mode" in the top right.
- Press the "Load unpacked" button on the top left of the screen
- Navigate to and select the dist directory where you've cloned this repo to

### Install from Chrome
- Navigate to [parcelLab Chrome Extension](https://chrome.google.com/webstore/detail/parcellab/gfmodbnpbehnkaohbccplfkcofpecjlj)
- Click "Add to Chrome"

<!---If you are working on a project that a user needs to install or run locally in a machine,
you should include the steps required to install your project and also the required dependencies if any.*

Provide a step-by-step description of how to get the development environment set and running.
For instance:

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install foobar.

```bash
pip install foobar
```
-->

## Usage

- From the options page enter your parcelLab account id, api token and select your language
- Open the extension from the extension bar or in the sidepanel
- Search for information by order number or tracking number

<!---
Provide instructions and examples so users/contributors can use the project. This will make it easy for them in case they encounter a problem – they will always have a place to reference what is expected.*

*You can also make use of visual aids by including materials like screenshots to show examples of the running project and also the structure and design principles used in your project.

```python
import foobar

# returns 'words'
foobar.pluralize('word')

# returns 'geese'
foobar.pluralize('goose')

# returns 'phenomenon'
foobar.singularize('phenomena')
```
-->

## Contributing

[Contribution guidelines](CONTRIBUTING.md)
