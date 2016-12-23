## Webmaker for Android

#### New documentation coming soon, in the mean time if you have any questions, please reach out to us on IRC.

[![Build Status](https://travis-ci.org/mozilla/webmaker-android.svg?branch=develop)](https://travis-ci.org/mozilla/webmaker-android)

Mozilla Webmaker's mission is to help enable a new generation of digital creators and webmakers, giving people the tools and skills they need to move from using the Web to actively making the Web. To this end, the Webmaker App is an entry point to the Webmaker community that provides a radically simple interface for creating mobile applications directly on device.

![Webmaker for Android](https://cloud.githubusercontent.com/assets/747641/7551523/6e866ae2-f640-11e4-8606-2e7f890b438e.jpg)

## Getting Started

#### Prerequisites
Before you jump into the code you'll want to download, install, and configure the following:

- [Android Studio](http://developer.android.com/sdk)
- [Node 4+](https://nodejs.org/) w/ ES6 ("harmony") features enabled
- [NPM 2.14.4+](https://www.npmjs.com/) (comes bundled with node)

#### Clone & Install Dependencies
```bash
git clone https://github.com/mozilla/webmaker-android
cd webmaker-android
npm install
```

#### Specifying a dev environment

In order to override default `webmaker-core` settings such as `id` and `api` endpoints, create an `.env` file in the webmaker-android root directory, and declare any environment overrides you need in that file, then (re)build the webmaker-android project using `npm run build`.

For example, to run webmaker-android with a different API endpoint, you would make sure the `.env` file contains:
```
API_URI=http://alternative.api.endpoint
```

For more details on which environment variables are used by webmaker-core, please see the [webmaker-core default environment](https://github.com/mozilla/webmaker-core/blob/develop/config/defaults.env).

#### Android

This repository is home to the native Android wrapper for the Webmaker app. `webmaker-android` is a hybrid mobile application that is primarily web-based (HTML/CSS/JS) but uses this wrapper to communicate with the native Android SDK. To make changes or to test the app, we recommend you use [Android Studio](http://developer.android.com/sdk/index.html).

- Compile the webview code with `npm run build`.
- Install and configure [Android Studio](http://developer.android.com/sdk)
- Open Android Studio and select "Import Project"
- If Android Studio asks, choose "Create project from existing sources"
- Select the "webmaker-android" directory

Once you have the project open, you can run it within an emulator or on any Android device with USB debugging enabled by selecting "Run 'app'" from the "Run" dropdown menu. For more information, please check out the [Android SDK documentation](http://developer.android.com/training/index.html).

If you can't compile the project, check the messages at the bottom of the Android Studio IDE. If this is the first time you've run an Android project, you may need to install an Android target OS. If so, there should be a link in the messages that will walk you through that. Afterwards, you'll probably need to install a virtual device for emulation. If you're using an x86 based development machine and virtual device, you'll probably have to install [Intel HAXM](https://software.intel.com/en-us/android/articles/intel-hardware-accelerated-execution-manager) as well.

Because much of the application logic takes place in WebViews, you'll likely want to set up [Remote debugging on Android with Chrome](https://developer.chrome.com/devtools/docs/remote-debugging).

#### Web
Each fragment within `webmaker-android` is actually just a web page! You can find all of the js, css, and static assets in the `webmaker-core` module. Static files in `./node_modules/webmaker-core/src/dest/` will be copied up to this Android wrapper as part of `npm run build`.

**NOTE:**

For local development, it's recommended to use `npm link` ([read more](https://docs.npmjs.com/cli/link)) with a local copy of [webmaker-core](https://github.com/mozilla/webmaker-core), in which you'll do any webview related work separately.

Gradle will automatically run `npm run copy:core` before building in Android Studio. This makes it convenient to watch your local copy of [webmaker-core](https://github.com/mozilla/webmaker-core) while you are testing on device or with an emulator.

## Contact Us
IRC: `#webmaker` on `irc.mozilla.org`

Forum: [https://groups.google.com/forum/#!forum/mozilla.webmaker](https://groups.google.com/forum/#!forum/mozilla.webmaker)

---

## Configuration

### Changing configuration

You can see all the default configuration in [config/defaults.env](https://github.com/mozilla/webmaker-core/blob/develop/config/defaults.env) (within `webmaker-core`). In order to change something, create a file called `.env` in your root directory and format configuration as follows:

```
CONFIG_VALUE='blah'

```

### Turning on production configuration

You will need a production `CLIENT_ID` for the id.webmaker.org OAuth server to run the app in production mode. Ask @cade or @k88hudson on irc.

If you are deploying/creating a build that should use production configuration, add the following to your `.env` before running `npm run build`.

```
NODE_ENV='PRODUCTION'
CLIENT_ID='xxxxxx'
```

## Network Assets

Webmaker for Android attempts to use network resources as sparingly as possible. In addition, it is important to cover failure and loading states gracefully at all times. To this end, we have a few React components and libraries included in the project to help make this easier:



## Interacting with Android APIs

While very few native Android APIs are used throughout the app, there are a few instances where native APIs are exposed to JS and react using the `WebAppInterace.java` class:

#### Router
The application uses an Android class called `Router` to move between activities. Similar to how you can pass parameters in a URL router like [Express](http://expressjs.com/), the Android `Router` class can provide route parameters via the `router.js` mixin. When using the mixin, route parameters will be bound to `route` within the react class's state.
```js
var router = require('./lib/router.js');

var MyThing = React.createClass({
  mixins: [router],
  // ...
  componentWillMount: function () {
    console.log(this.state.route);
  }
});
```

#### SharedPreferences
`SharedPreferences` is a simple key/value store API native to Android that can be used to persist values to disk that are only available to the Webmaker application. You can both set and get values to `SharedPreferences` using Java <-> JS bindings that are provided within `WebAppInterface.java`:
```js
if (window.Android) {
  window.Android.setSharedPreferences('my::cache::key', 'foobar');
  var hit = window.Android.getSharedPreferences('my::cache::key');
  console.log(hit); // prints "foobar"
}
```

`SharedPreferences` is automatically namespaced to the current activity. You can override this behavior by passing `true` to the optional "global" parameter:
```js
window.Android.getSharedPreferences('state', true);
```

#### LRU Cache
`MemStorage` is a single `LRUCache` instance that is provided as a singleton. This can be used to persist values to memory that are **not needed in-between app sessions**. You can both set and get values to `MemStorage` using Java <-> JS bindings that are provided within `WebAppInterface.java`:
```js
if (window.Android) {
  window.Android.setMemStorage('my::cache::key', 'foobar', false);
  var hit = window.Android.getMemStorage('my::cache::key', false);
  console.log(hit); // prints "foobar"
}
```

`MemStorage` is automatically namespaced to the current activity. You can override this behavior by passing `true` to the optional "global" parameter:
```js
window.Android.getMemStorage('state', true);
```

#### Google Analytics Event Firing

This function allows you to send event data to Google Analytics by calling the ```trackEvent()``` method. Optionally you can specify a numeric value (int) to pass along in your event, however this isn't required. Please see the below code for example implementation.

You can read more about the parameters and what they do here: https://developers.google.com/analytics/devguides/collection/android/v4/events

```js
if (window.Android) {
    window.Android.trackEvent('category', 'action', 'label');
    window.Android.trackEvent('category', 'action', 'label', 'value'); // optional value
}
```
