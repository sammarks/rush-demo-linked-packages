# Rush Linked Packages Demo

This is a demonstration repository for the proof-of-concept I introduced in
[this PR.](https://github.com/microsoft/rushstack/pull/2301) See my explanation inside that PR
for how this works / how to use it.

## Initial Setup

This repository contains two completely separate rush projects (they're in the same repo for
simplicity). `rush-one` is a bunch of helper packages, and a replacement for `lodash` (which we
will be using later). `rush-two` contains `@test/project-three`, which has a `bin.js` file inside
it. We will be running that whenever checking to see if the packages linked properly.

To start, `rush update` in both `rush-one` and `rush-two` to get all of the dependencies installed,
and then `rush build` inside each to get the packages built.

Once everything is built, you should be able to run `node rush-two/packages/project-three/dist/bin.js`
and you should be greeted with something like the following:

```
welcome to the CLI
here is project two, and now we are getting...
bar
```

## Linking Packages

**Make sure you're using a version of `rush` built from my code in the PR.** If you're not using the
code from the PR, it should still work. You'll just get some warnings and error messages, and it
won't work _as well._

Now, to demonstrate the linking functionality, we'll go back and update the `links.json` file inside
the `rush-two` project to link to the `lodash` package in `rush-one` instead of the one from NPM.

**Note:** Normally, `links.json` should be excluded from your repository, as the packages you have
linked should only be a local configuration (they also include local path references, so even more
of a reason to ignore them). I'm including them in this repository for the sake of the
demonstration.

*The only reason I'm using lodash instead of some other package is because I had to pick something
available on NPM so the first installation (where they're not linked) works properly.
Conveniently, when the package is defined in `links.json`, it doesn't have to be published, which is
nice when developing packages in another repo that haven't yet been published.*

Copy `links.example.json` to `links.json` inside `rush-two/common/config`, and then run
`rush update` to install the linked version of the package instead. You'll see some console messages
verifying that it is indeed using the linked version.

**Do not attempt to build the packages with the linked packages.** You can try, but you'll either
see error messages because one of the packages used to build the code uses `lodash`, or you'll
see error messages complaining about the types.

Now, run `node rush-two/packages/project-three/dist/bin.js` and you should get something like this:

```
welcome to the CLI
here is project two, and now we are getting...
boom
.../rush-demo-linked-packages/rush-one/packages/lodash/dist/index.js:10
    throw new Error('stonks');

...
```

`boom` is there to illustrate calling another package from within the Rush repository you're
referencing, and then the error is our replacement for the `lodash` code.

## Going Back

Finally, to go back to the non-linked version (and this is the currently-cumbersome part), you'll
need to first reset your `links.json` file, then remove the `node_modules` directories in all of
the packages (I find this gets PNPM to reset the linked packages, otherwise it just uses the linked
package again), and then run `rush update --full` to re-install all the dependencies. From the
`rush-two` folder:

```
echo "{}" > common/config/links.json
rm -rf */*/node_modules
rush update --full
```

Finally, run `node rush-two/packages/project-three/dist/bin.js` and you should get the original
message again:

```
welcome to the CLI
here is project two, and now we are getting...
bar
```
