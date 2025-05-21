# Brief summary on package-AUTOupdates

## 📚 Table of Contents

- [Overview](#-overview)
- [Issue](#-issue)
- [Identification](#-identification)
- [Solution](#-solution)

## 🧰 Overview 
_This space tells us about a possibility to auto update the source version using "uscan"._

## ✨ Issue

Problem: We have repositories with pinned versions of upstream packages. We need to have an overview of which packages will be auto-updated and which will go against a specific version with no auto-update. https://github.com/gardenlinux/gardenlinux/issues/2452 


## 🚀 Identification

https://github.com/search?q=org%3Agardenlinux%20path%3Aprepare_source%20branch&type=code
Above are the packages which has pinned versions of the package to pull from upstream url's


## ⚙️ Solution

 * A tool "uscan" fetches the upstream source to compare newer versions compared to the current one
 * Requisites for uscan
   *  debian/watch 
     * Specific arguments passed to uscan specifying options (git), url, version/tags regex to match fetching the newer release
   *  debian/changelog
     *  Formatted header with current version which uscan reads and compares from upstream/source


   |            Package            |   Version   |                                                   Watch file                                                  |   |
|:-----------------------------:|:-----------:|:-------------------------------------------------------------------------------------------------------------:|---|
| ----------------              | ---------   | ------------------------------                                                                                |   |
| ignition-legacy               | 2.21.0      | https://github.com/saubhikdattagithub/mygardenimage/blob/main/autoupdates/watch_ignition-legacy               |   |
| datefudge                     | 1.26        | https://github.com/saubhikdattagithub/mygardenimage/blob/main/autoupdates/watch_datefudge                     |   |
| google-compute-engine-oslogin | 20250123.00 | https://github.com/saubhikdattagithub/mygardenimage/blob/main/autoupdates/watch_google-compute-engine-oslogin |   |
| python                        | 3.12.2      | https://github.com/saubhikdattagithub/mygardenimage/blob/main/autoupdates/watch_python3.12                    |   |
|                               |             |                                                                                                               |   |
|                               |             |                                                                                                               |   |
|                               |             |                                                                                                               |   |
|                               |             |                                                                                                               |   |
|                               |             |                                                                                                               |   |
|                               |             |                                                                                                               |   |
     
Ref:
https://github.com/saubhikdattagithub/mygardenimage/tree/main/autoupdates 

**Working ::** 
   - The shell script creates a temporary directory in /tmp independent of the production space
   - Execution works with passing the package name as first argument 
   - Forks the git repo of the package with corresponding repo URL/package names
   - Evaluates the Current_Version of the package from prepare_source file from the package repo.
   - This consists of fetching the current revision from various patterns in prepare_source like "version=", "version_orig"=, "git src --branch" etc
   - Creates debian directory and changelog file for uscan environment in /tmp/work/PACKAGE-TIMESTAMP/ directory
   - Watch file stays customised for each package in the managed repository
   - Uscan executes with customised watch and debiaan/changelog to determine the availability of new version
   - If no new version found, exits, else if a newer version is found, then edits the prepare_source file with new version determined from uscan run.

---
