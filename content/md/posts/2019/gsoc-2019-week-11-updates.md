{:title  "GSoC 2019: Week 11 updates"
 :date   "13-08-2019"
 :layout :post
 :tags   ["gsoc" "terasology"]}

The penultimate week of GSoC was filled with architectural designs and discussions. I've spent a good amount of time researching on _apt_, _pacman_ and _npm_, and along with the lessons learned from the previous Package Manager implementation, we're planning out an improved design for making the Package Manager more extensible and robust. <!-- more -->

### Updated Package Manager API

This new design was inspired by the classic Linux package manager. Here's a diagram:

![Diagram](/img/2019/pkgmgr2.png)

Here, _Cache_ contains the previously downloaded ZIPs only. It can be used to re-install old packages without getting online. It can be cleared any time, just like any good cache storage. _PackageDatabase_ is kinda like the _version lists_ from the last implementation. Its main purpose is to keep track of all packages available in all online repositories and to return the URL for any package that we're searching.

This approach is similar to what Linux package managers do. For example, when you're using _pacman_ (from Arch Linux), the corresponding files are located here:

* Package database: _/var/lib/pacman/sync_
* Cached packages: _/var/cache/pacman/pkg_

And for _apt_ (from Ubuntu) it should be similar to:

* Package database: _/var/lib/apt/lists_
* Cached packages: _/var/cache/apt/archives_

This new design will allow the package manager to add support for third party repositories and multiple package identifiers (instead of using an enum of supported packages from last design). This one will be a major part of the _4.0 release_, and I'll make a post as soon as it gets ready for a test drive.

Be sure to check out [this post](https://forum.terasology.org/threads/gsoc-2019-terasology-launcher-4-0.2268/post-16389) on my weekly GSoC forum thread.