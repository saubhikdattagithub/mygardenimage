# Brief summary on package-AUTOupdates

## 📚 Table of Contents

- [Overview](#-overview)
- [Issue](#-issue)
- [Identification](#-identification)
- [Solution](#-solution)
  
- [Working for uscan understanding](#-Working-for-uscan-understanding)
- [Proposal for gardenlinux/package-YYYY](#-Proposal-for-gardenlinux/package-YYYY)
- [Proposal packages with watch file:](#-Proposal-packages-with-watch-file)
- [Watch file templates for each package](#-Watch-file-templates-for-each-package)
- [Conclusion](#-Conclusion)

## 🧰 Overview 
_This space tells us about a possibility to auto update the source version using "uscan"._

## ✨ Issue

Problem: We have repositories with pinned versions of upstream packages. We need to have an overview of which packages will be auto-updated and which will go against a specific version with no auto-update. https://github.com/gardenlinux/gardenlinux/issues/2452 


## 🚀 Identification

[https://github.com/search?q=org%3Agardenlinux%20path%3Aprepare_source%20branch&type=code](https://github.com/search?q=org%3Agardenlinux%20path%3Aprepare_source%20branch&type=code) 
 * Above are the packages which has pinned versions of the package to pull from upstream url's


## 🧰 Solution (Probable)

 * A tool "uscan" fetches the upstream source to compare newer versions compared to the current one
 * Requisites for uscan
   *  debian/watch 
     * Specific arguments passed to uscan specifying options (git), url, version/tags regex to match fetching the newer release
   *  debian/changelog
     *  Formatted header with current version which uscan reads and compares from upstream/source
  
## 🧰 Working for uscan understanding
   - The shell script creates a temporary directory in /tmp independent of the production space
   - Execution works with passing the package name as first argument 
   - Forks the git repo of the package with corresponding repo URL/package names
   - Evaluates the Current_Version of the package from prepare_source file from the package repo.
   - This consists of fetching the current revision from various patterns in prepare_source like "version=", "version_orig"=, "git src -- branch" etc.
   - Creates debian directory and changelog file for uscan environment in /tmp/work/PACKAGE-TIMESTAMP/ directory
   - Watch file stays customised for each package in the managed repository
   - Uscan executes with customised watch and debiaan/changelog to determine the availability of new version
   - If no new version found, exits, else if a newer version is found, then edits the prepare_source file with new version determined from uscan run

## 🧰 Proposal for gardenlinux/package-YYYY
  - In existing package-YYYY repositories, we need to include a watch file as a bare minimum
  - For uscan execution, debian/changelog is expected too, which is temporarily created and then removed by the update_version.py
  - The watch file format for every package could be recorded as template as in below table (only for sample now in git)
  - Info: The watch file is very specific and customised based on:
    - mode + formatting
    - version regex in the way of tags (Eg: refs/tags/vXYZ, /refs/tags/debian/4.XYZ etc)  
    - URL of upstream
    - restriction of major release by control in watch file

## 🧰 Proposal packages with watch file:
  - https://github.com/saubhikdattagithub/mygardenimage/blob/main/package-ignition-legacy
  - https://github.com/saubhikdattagithub/mygardenimage/blob/main/package-datefudge
  - https://github.com/saubhikdattagithub/mygardenimage/blob/main/package-oras
  - https://github.com/saubhikdattagithub/mygardenimage/blob/main/package-usr-is-merged


## 🧰 Watch file templates for each package

|            Package            |   Version   |                                                   Watch file                                                      |
|:-----------------------------:|:-----------:|:-----------------------------------------------------------------------------------------------------------------:|
| ignition-legacy               | 2.21.0      | [watch_ignition_legacy](https://github.com/saubhikdattagithub/mygardenimage/blob/main/autoupdates/watch_ignition-legacy)                 |
| datefudge                     | 1.26        | [watch_datefudge](https://github.com/saubhikdattagithub/mygardenimage/blob/main/autoupdates/watch_datefudge)                       |
| google-compute-engine-oslogin | 20250123.00 | [watch_google-compute-engine-oslogin](https://github.com/saubhikdattagithub/mygardenimage/blob/main/autoupdates/watch_google-compute-engine-oslogin)   |
| python                        | 3.12.2      | [watch_python](https://github.com/saubhikdattagithub/mygardenimage/blob/main/autoupdates/watch_python3.12)             |
| oras                          | 1.2.0       | [watch_oras](https://github.com/saubhikdattagithub/mygardenimage/blob/main/autoupdates/watch_oras)             |
| usr-is-merged                 | 39          | [watch_usr-is-merged](https://github.com/saubhikdattagithub/mygardenimage/blob/main/autoupdates/watch_usr-is-merged)             |
--

## 🧰 Conclusion
 - The Actions file automatically would create a PR with the change of VERSION in "prepare_source" file for individual packages as per the backlog requirement
