{:title  "GSoC 2019: Week 5 updates"
 :date   "02-07-2019"
 :layout :post
 :tags   ["GSoC" "Terasology"]}

The first phase of GSoC came to an end with a month full of awesome experiences. This last week of June had seen works on the new, dedicated project for producing customized runtime for bundling along with the launcher. <!-- more -->

### TerasologyJRE

This new repo will keep the Gradle tasks for downloading, customizing and re-publishing multiple Java runtimes. These runtimes can then be downloaded and bundled along with the launcher to make it self-contained.

![Screenshot](/img/2019/screenshot_2019-07-02-movingblocks-terasologyjre.png)

Currently, it can download various platform-specific JREs from any given set of links. I've chosen BellSoft's Liberica JRE for testing. The publishing tasks are available in [PR #3](https://github.com/MovingBlocks/TerasologyJRE/pull/3) which is unmerged at the time of writing.

Be sure to check out [this post](https://forum.terasology.org/threads/gsoc-2019-terasology-launcher-4-0.2268/post-16359) on my weekly GSoC forum thread.