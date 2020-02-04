# A semantic-release plugin for Gradle project

Yet another gradle-semantic-release-plugin that invokes Gradle wrapper script to release.

[![Build Status](https://travis-ci.com/KengoTODA/gradle-semantic-release-plugin.svg?branch=master)](https://travis-ci.com/KengoTODA/gradle-semantic-release-plugin)
[![npm](https://badgen.net/npm/v/gradle-semantic-release-plugin)](https://www.npmjs.com/package/gradle-semantic-release-plugin)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

# Precondition

To apply this semantic-release plugin, you need to fulfill the following preconditions:

1. Your Gradle project should manage its version by `gradle.properties` (not by `build.gradle` nor `build.gradle.kts`).
2. Your Gradle project should have an executable Gradle wrapper script at the project root directory.
3. Your CI environment should run on Linux environment that can run `./gradlew`.
4. Your Gradle project should use [Maven Publish Plugin](https://docs.gradle.org/current/userguide/publishing_maven.html), [Legacy publishing](https://docs.gradle.org/current/userguide/artifact_management.html) or [Gradle Artifactory Plugin](https://www.jfrog.com/confluence/display/RTF/Gradle+Artifactory+Plugin) to publish artifact.

# Installation

## Install semantic-release

Follow [install guide](https://semantic-release.gitbook.io/semantic-release/usage/installation) and [CI configuration guide](https://semantic-release.gitbook.io/semantic-release/usage/ci-configuration) described in the semantic-release official document.

To manage version of toolset, we recommend you to have a `package.json` in your project root directory. Manage both of `semantic-release` and its plugins as `devDependencies`.

It is also nice to have `"semantic-release": "semantic-release"` in `"scripts"` in `package.json`, then you can run `yarn semantic-release` to invoke semantic-release.

Refer [this sample project](https://github.com/KengoTODA/gradle-boilerplate) as a working example.

## Configure `@semantic-release/git`

This plugin updates `gradle.properties` to bump up project version. If you want to keep the version in this file updated, configure `@semantic-release/git` to commit changes. You can configure your `package.json` like below:

```json
  "release": {
    "plugins": [
      "gradle-semantic-release-plugin",
      [
        "@semantic-release/git",
        {
          "assets": [
            "gradle.properties"
          ]
        }
      ]
    ]
  },
```

## Configure your CI

If your CI configuration is for java app development, then you may need to install `node` by your own.
For Travis CI, it has `nvm` in the PATH so you can install them like below:

```yml
language: java
before_install: # or at the release stage described in the following part
  - nvm install 12
  - npm ci # or "yarn
```

Then trigger `semantic-release` at the release stage. For now the build stage is recommended over [the travis-deploy-once](https://github.com/semantic-release/travis-deploy-once):

```yml
jobs:
  include:
    - stage: release
      script: skip
      deploy:
        provider: script
        skip_cleanup: true
        script:
          - npm run semantic-release # or "yarn semantic-release"
```

# FAQ

## How it's different with the [@tschulte/gradle-semantic-release-plugin](https://github.com/tschulte/gradle-semantic-release-plugin)?

That is a Gradle plugin implemented by Java. It can use Gradle's feature and ecosystem. However, it emulates `semantic-release` and cannot use other semantic-release plugin at the same time.

Our plugin is a semantic-release plugin. It can work with other plugin implemented on node.js, but it just invokes Gradle and cannot handle so complex requirements by own.

## Copyright

Copyright (c) 2019 Kengo TODA
