# 1 Writing Modules

This chapter covers the following topics

* Node's module system
* NPM's package tooling and infrastructure
* Initializing a module
* Setting up developer tooling for module writing
* Best practices
* Decomposition
* Publishing to NPM privately

## Introduction

In idiomatic Node, the module is the fundamental unit of logic. Applications or systems should consist of many generic modules composed together while domain specific logic ties modules together at the application level. In this chapter we'll learn how Node's module system works, how to create modules for various scenarios and how we can reuse and share our code.


## Scaffolding a Module

### Getting Ready

> #### Installing Node ![](../tip.png)
> 
> If we don't already have Node installed, we can go to <https://nodejs.org> to pick up the latest version for our operating system.

If Node is on our system, then so is the `npm` executable. 

`npm` is the default package manager for Node, it's useful for 
creating, managing, installing and publishing modules. 

Before we run any commands, let's tweak the `npm` configuration
a little:

```sh
npm config set init.author.name "<name here>"
```

This will speed up module creation and ensure each package we create has a consistent author name, thus avoiding typos and variation of our name. 


> #### npm stands for.. ![](../info.png)
> 
> Contrary to popular belief, `npm` is not an acronym for
> Node Package Manager, in fact it stands for "npm is Not 
> An Acronym", which is why it's not called NINAA.


### How to do it

Let's say we want to create a module that converts HSL (hue, saturation, luminosity) values into a hex based RGB representation, such as would be used in CSS (for example: `#fb4a45`).

`hsl-to-hex` seems like a good name, so let's make a new 
folder for our module and `cd` into it.

```sh
mkdir hsl-to-hex
cd hsl-to-hex
```

Every Node module must have a `package.json` file, which holds
meta data about the module. 

Instead of manually creating a `package.json` file, we can simply execute the following command in our newly created module folder:

```sh
npm init
```

This will ask a series of questions. We can hit enter for every question without supplying an answer. Notice how the default module `name` corresponds to the current working directory, and the default `author` is the `init.author.name` value we set earlier on. 


![](images/fig1.1.png)
*An `npm init` should look like this*


Upon completion we should have a `package.json` file that looks something like this:

```json
{
  "name": "hsl-to-hex",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "David Mark Clements",
  "license": "MIT"
}
```

### How it Works

When Node is installed on our system, `npm` comes bundled with it.

The `npm` executable is written in JavaScript, and runs on Node.

The `npm config` command can be used to permanently alter settings. In our case we changed the `init.author.name` setting so that `npm init` would reference it for
the default during a modules initialization.

We can list all current configuration settings with `npm config ls`. 

> #### Config Docs ![](../info.png)
> 
> See <https://docs.npmjs.com/misc/config> for all possible `npm` configuration settings

When we run `npm init` the answers to prompts are stored in an object, serialized as JSON and then saved to a newly created `package.json` file in the current directory.

### There's More

#### Reinitializing

Sometimes additional meta data can be available after we've created a module. A typical scenario can arise when we initialize our module as a git repository and add a remote endpoint after creating the module.

> ##### Git and GitHub  ![](../info.png)
> 
> If we've not heard or used the `git` tool and GitHub before,
> refer to <http://help.github.com> to get started.
> 
> If we don't have a GitHub account we can head to <http://github.com> to get a free account.

To demonstrate, let's create a GitHub repository for our module.
Head to GitHub and click the plus symbol in the top right, then select
"new repository".

![](images/fig1.2.png)
*Select "New repository"*

Specify the name as "hsl-to-hex" and click "Create Repository".

Back in the terminal, inside our module folder, we can now run:

```sh
git init
git add package.json
git commit -m '1st'
git remote add origin http://github.com/<username>/hsl-to-hex
git push -u origin master
```

Now here comes the magic part, let's initialize again (simply press enter for every question):

```sh
npm init
```

![](images/fig1.3.png)
*Reinitializing*

This time the Git remote we just added was detected and became the default answer for the "git repository" question. Accepting this default answer meant that the `repository`, `bugs` and `homepage` fields were added to `package.json`.

A repository field in the `package.json` is an important addition when it comes to publishing open source modules since it will be rendered as a link on the modules information page on <http://npmjs.com>. 

A repository link enables potential users to peruse the code prior to installation. Modules that can't be viewed before use are far less likely to be considered viable.


#### Versioning

The `npm` tool supplies other functionality to help with module creation and management workflow. 

For instance the `npm version` command can allow us to manage our modules version number according to semver semantics. 

> #### semver ![](../info.png)
> semver is a versioning standard. A version consists of three numbers separated by a dot, for example `2.4.16`. The position of a number denotes specific information about the version in comparison to other versions. The three positions are known as `MAJOR.MINOR.PATCH`. The PATCH number is increased when changes have been made that don't break existing functionality nor add any new functionality. For instance, a bug fix would be considered a patch. The MINOR number should be increased when new backwards compatible functionality is added. For instance the adding of a method. The MAJOR number increases when backwards-incompatible changes are made
> See <http://semver.org/> for more information.

If we we're to a fix a bug we would want to increase the PATCH number. We could either manually edit the `version` field in `package.json`, setting it to `1.0.1`, or we can execute the following: 

```sh
npm version patch
```

This will increase the version field in one command. Additionally, if our module is a Git repository, it will add a commit based on the version (in our case 'v1.0.1') which we can then immediately push. 

When we ran the command, `npm` will have output the new version. However we can double check the version number of our module without opening `package.json`:

```sh
npm version
```

This will output something like the following

```js
{ 'hsl-to-hex': '1.0.1',
  npm: '2.14.17',
  ares: '1.10.1-DEV',
  http_parser: '2.6.2',
  icu: '56.1',
  modules: '47',
  node: '5.7.0',
  openssl: '1.0.2f',
  uv: '1.8.0',
  v8: '4.6.85.31',
  zlib: '1.2.8' }
```

The first field is our module along with its version number.

If we added new backwards compatible functionality, we could run:

```sh
npm version minor
```

Now our version is `1.1.0`. Finally for a major version bump we can run the following:

```sh
npm version major
```

This sets the our modules version to `2.0.0`.

Since we're just experimenting and didn't make any changes we should set our version back to 1.0.0. 

We can do this via the `npm` command as well:

```sh
npm version 1.0.0
```

### See also


## Installing Dependencies

### Getting ready

For this recipe, all we need is a command prompt open in the `hsl-to-hex` folder from the **Scaffolding a Module** recipe. 

### How to do it

Our `hsl-to-hex` module can be implemented in two steps

1) convert the hue degrees, saturation percentage and luminosity percentage to corresponding red, green and blue numbers between 0 and 255
2) convert the RGB values to HEX

Before we tear into writing an HSL to RGB algorithm, we should check whether this problem has already been solved.

The easiest way to check is to head to <http://npmjs.com> and perform a search.

![](images/fig1.4.png)
*Oh look somebodies already solved this*

After some research we decide that the `hsl-to-rgb-for-reals` module is the best fit.

Ensuring we are in the `hsl-to-hex` folder, we can now install our dependency with the following:

```sh
npm install --save hsl-to-rgb-for-reals
```

Now let's take a look at the bottom of `package.json`: 

```sh
tail package.json #linux/osx
```

```sh
type package.json #windows
```

Tail output should give us:

```  },
  "bugs": {
    "url": "https://github.com/davidmarkclements/hsl-to-hex/issues"
  },
  "homepage": "https://github.com/davidmarkclements/hsl-to-hex#readme",
  "description": "",
  "dependencies": {
    "hsl-to-rgb-for-reals": "^1.1.0"
  }
}
```

We can see that the dependency we installed has been added to a `dependencies` object in the `package.json` file.

### How it works

The top two results of the npm search are `hsl-to-rgb` and `hsl-to-rgb-for-reals`. The first result is unusable, because the author of the package forgot to export it and is unresponsive to fixing it. The `hsl-to-rgb-for-reals` module is a fixed version of `hsl-to-rgb`.

This situation serves to illustrate the nature of the npm ecosystem.

On the one hand there are over 200,000 modules and counting, on the other many of these modules are of low value. Nevertheless, the system is also self healing, in that if a module is broken and not fixed by the original maintainer a second developer often assumes responsibility and publishes a fixed version of the module.

When we run `npm install` in a folder with a `package.json` file, a `node_modules` folder is created (if it doesn't already exist). Then the package is downloaded from the npm registry and saved into a subdirectory of `node_modules` (for example, `node_modules/hsl-to-rgb-for-reals`). 


> #### npm 2 vs npm 3 ![](../info.png)
>
> Our installed module doesn't have any dependencies of its own. But if it did the sub-dependencies would be installed differently depending on whether we're using version 2 or version 3 of `npm`. 
>
> Essentially `npm` 2 installs dependencies in a tree structure, for instance `node_modules/dep/node_modules/sub-dep-of-dep/node_modules/sub-dep-of-sub-dep`. Conversely `npm` 3 follows a maximally flat strategy where sub-dependencies are installed in the top level `node_modules` folder when possible. For example `node_modules/dep`, `node_modules/sub-dep-of-dep` and `node_modules/sub-dep-of-sub-dep`. This results in fewer downloads and less disk space usage. `npm` 3 resorts to a tree structure in cases where there's two version of a sub-dependency, which is why it's called a "maximally" flat strategy. 
>
> Typically if we've installed Node 4 or above, we'll be using `npm` version 3.

### There's more

#### Installing Development Dependencies

We usually need some tooling to assist with development and maintenance of a module or application. The ecosystem is full of development supporting modules, from linting, to testing to browser bundling to transpilation.

In general we don't want consumers of our module to download dependencies they don't need.
Similarly, if we're deploying a system built in node, we don't want to burden the continuous integration and deployment processes with superfluous, pointless work.

So we separate our dependencies into production and development categories.

When we use `npm --save install <dep>` we're installing a production module.

To install a development dependency we use `--save-dev`.

Let's go ahead and install a linter. 

> ##### standard  ![](../info.png)
> 
> `standard` is a JavaScript linter that enforces an unconfigurable rule set
> The premise of this approach is that we should stop using precious time 
> up on bikeshedding about syntax.

All the code in this book uses the `standard` linter so we'll install that. 

```sh
npm install --save-dev standard
```

> ##### semistandard  ![](../tip.png)
> 
> If the absence of semi-colons is abhorrent and tasteless, we can choose to 
> install `semistandard` instead of `standard` at this point. The lint rules
> match those of standard, with the obvious exception of requiring semi-colons.
> Further, any code written using standard can be reformatted to semistandard 
> using the `semistandard-format` command tool. Simply `npm -g i semistandard-format` to get started with it.

Now let's take a look at the `package.json` file:

```json
{
  "name": "hsl-to-hex",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "David Mark Clements",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+ssh://git@github.com/davidmarkclements/hsl-to-hex.git"
  },
  "bugs": {
    "url": "https://github.com/davidmarkclements/hsl-to-hex/issues"
  },
  "homepage": "https://github.com/davidmarkclements/hsl-to-hex#readme",
  "description": "",
  "dependencies": {
    "hsl-to-rgb-for-reals": "^1.1.0"
  },
  "devDependencies": {
    "standard": "^6.0.8"
  }
}
```

We now have a `devDependencies` field alongside the `dependencies` field.

When our module is installed as a sub-dependency of another package, 
only the `hsl-to-rgb-for-reals` module will be installed whilst the `standard` module since will be ignored since it's irrelevant to our modules actual implementation.

If this `package.json` file represented a production system we could run the install step with the `--production` flag like so:


```js
npm install --production
```

Alternatively, this can be set in production environment with the following command:

```js
npm config set production true
```

Currently we can run our linter using the executable installed in the `node_modules/.bin` folder. For example:

```js
./node_modules/.bin/standard
```

This is ugly and not at all ideal. See [Using npm run scripts](#using-npm-run-scripts) for a more elegant approach. 

#### Using npm run scripts

Our `package.json` file currently has a `scripts` property that looks like this:

```json
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```

Let's edit the `package.json` file and add another field, called `lint`. 

Like so:

```
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "lint": "standard"
  },
```

Now, as long as we have `standard` installed as a development dependency of our module (see [Installing Development Dependencies](#installing-development-dependencies)), we can run the following command to run a lint check on our code:

```sh
npm run-script lint
```

This can be shortened to:

```sh
npm run lint
```

When we run an npm script, the packages `node_modules/.bin` folder is appended
to the execution contexts `PATH` environment variable. This means even if we 
don't have the `standard` executable in our usual system `PATH`, we can reference
it in an npm script as if it was in our `PATH`.


Some consider lint checks to be a precursor to tests.

Let's alter the `scripts.test` field like so:

```sh
  "scripts": {
    "test": "npm run lint",
    "lint": "standard"
  },
```

Later we could append other commands to the `test` script using 
the double ampersand (`&&`), to run a chain of checks. 

Now to run the `test` script:

```
npm run test
```

Since the `test` script is special, we can simply run 

```
npm test
```

#### Eliminating The Need for Sudo

The `npm` executable can install both local and global
modules. Global modules are mostly installed so their 
as command line utilities can be used system wide. 

On OSX and Linux the default `npm` set up requires `sudo`
access to install a module.

For example, for following will fail on a typical OS X or Linux 
system with the default `npm` set up:

```js
npm -g install cute-stack # <-- oh oh needs sudo
```

This is unsuitable for several reasons. Forgetting to use `sudo`
becomes frustrating, we're trusting `npm` with root access
and accidentally using `sudo` for a local install causes 
permissions problems (particularly with the npm local cache). 

The `prefix` setting stores the location for globally installed modules, we can view this with:

```sh
npm config get prefix
```

Usually the output will be `/usr/local'. To avoid the use of `sudo` all we have to do is set ownership permissions on any subfolders in `/usr/local` used by `npm`:

```sh
 sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

Now we can install global modules without root access:

```js
npm -g install cute-stack # <-- now works without sudo
```

If changing ownership of system folders isn't feasible, 
we can use a second approach which involves changing the
`prefix` setting to a folder in our home path:

```sh
mkdir ~/npm-global
npm config set prefix ~/npm-global
```

We'll also need to set our `PATH`:

```
export PATH=$PATH:~/npm-global/bin
source ~/.profile
```

The `source` essentially refreshes the terminal environment to reflect the changes we've made.

### See also

## Writing module code

### Getting Ready

Let's ensure that we have a folder called `hsl-to-hex`, with a `package.json` file in it. The `package.json` file should contain `hsl-to-rgb-for-reals` as a dependency. If there isn't a `node_modules` folder, we need to make sure we run `npm install` from the command line with the working directory set to the `hsl-to-hex` directories path.

To get started let's create a file called `index.js in the `hsl-to-hex` folder, then open it in our favourite text editor. 

### How to do it

The first thing we'll want to do in our `index.js` file is specify any dependencies we'll be using.

In our case, there's only one dependency

```js
var toRgb = require('hsl-to-rgb-for-reals')
```

Typically all dependencies should be declared at the top of the file.

Now let's define an API for our module, we're taking hue, saturation and luminosity values and outputting a CSS compatible hex string.

Hue is in degrees, between 0 and 359. Since degrees a cyclical in nature, we'll support numbers greater than 359 or less than 0 by "spinning" them around until they fall within the 0 to 359 range. 

Saturation and luminosity are both percentages, we'll represent these percentages with whole numbers between 0 and 100. For these numbers we'll need to enforce a maximum and a minimum, anything below 0 will become 0, anything above 100 will become 100.

Let's write some utility functions to handle this logic:

```js
function max(val, n) {
  return (val > n) ? n : val
}

function min(v, n) {
  return (val < n) ? n : val
}

function cycle(val) {
  //for safety:
  val = max(val, 1e7)
  val = min(val, -1e7)
  //cycle value:
  while (val < 0) { val += 360 }
  while (val > 359) { val -= 360 }
  return val
}
```

Now for the main piece, the `toHex` function:

```js
function toHex(hue, saturation, luminosity) {

  //resolve degrees to 0 - 359 range
  hue = cycle(hue)

  // enforce constraints
  saturation = min(max(saturation, 100), 0)
  luminosity = min(max(luminosity, 100), 0)
  
  // convert to 0 to 1 range used by hsl-to-rgb-for-reals
  saturation /= 100
  luminosity /= 100
 
  //let hsl-to-rgb-for-reals do the hard work
  var rgb = toRgb(hue, saturation, luminosity)
  
  //convert each value in the returned RGB array
  //to a 2 character hex value, join the array into
  //a string, prefixed with a hash
  return '#' + rgb
    .map(function (n) {
      return (256 + n).toString(16).substr(-2)
    })
    .join('')

}
```

Now for the final piece, to make our code into a bonafide module we have to export it:

```js
module.exports = toHex
```


### How it works

### There's more



### See also


#### es6 module syntax/transpiling




* write code
* go out of scope
* decompose into another module
- there's more
es6
tests/examples/readme
configuring npm author etc.

## Publishing a module

### Getting ready

### How to do it

### How it works

### There's more

#### Listing Installed Modules

#### Module Security Audit

#### Bundling Dependencies

### See also

## Using a private repository

### Getting ready

### How to do it

### How it works

### There's more

### See also





