{:title  "GSoC 2019: Week 6 updates"
 :date   "08-07-2019"
 :layout :post
 :tags   ["GSoC" "Terasology"]}

This week was devoted to design and development of the new package manager, another flagship feature for the Launcher's upcoming release.<!-- more -->

### New Package Manager API

After a lot of discussion on the launcher's slack, we've made a fairly concrete roadmap for the Package Manager's design. Here is a list of notable features it'll have by the end:

* Functionality for downloading, installing and removing game packages
* A locally cached list of all game versions available online
* Support for all four types of game builds:
  * [Stable](http://jenkins.terasology.org/job/TerasologyStable/)
  * [Unstable](http://jenkins.terasology.org/job/Terasology/)
  * [Omega stable](http://jenkins.terasology.org/job/DistroOmegaRelease/)
  * [Omega unstable](http://jenkins.terasology.org/job/DistroOmega/)
* Support for different types of package providers, including our [Jenkins server](http://jenkins.terasology.org/), GitHub Package Registry or any custom provider
* Easy support for 3rd-party package sources, on simply adding them by pasting their URL into the launcher

At the time of writing this post, only syncing and caching of game versions has been implemented for all four types of game jobs present on our old Jenkins. The online tasks make use of Jenkin's REST API, along with GSON for parsing the results. Have a look at [this PR](https://github.com/MovingBlocks/TerasologyLauncher/pull/448) for the code.

Be sure to check out [this post](https://forum.terasology.org/threads/gsoc-2019-terasology-launcher-4-0.2268/post-16362) on my weekly GSoC forum thread.