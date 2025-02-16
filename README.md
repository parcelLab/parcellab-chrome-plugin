# parcelLab Chrome Extension

## About The Project
A Chrome popup/sidepanel extension to check order status via parcelLab API. This app is written in TypeScript and leverages Bootstrap and jQuery.

![image](https://github.com/parcelLab/parcellab-chrome-plugin/assets/1038621/d8166ff1-b03b-45d3-9084-5f4e48d40c43)

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
