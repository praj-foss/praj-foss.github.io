{:title  "GSoC 2019: Week 3 updates"
 :date   "18-06-2019"
 :layout :post
 :tags   ["gsoc" "terasology"]}

Whew! Probably got the highest number of crashes this week. 😅 I tried to do too many changes in the launcher's initialization phase got the code jumbled up, the main reason for my headache. <!-- more -->

The first PR included some significant changes to the _LauncherInitTask_ and the main class _TerasologyLauncher_ but since the code got messed up, I reverted all changes. Now I'm planning to break down those changes into smaller bits and push them via multiple PRs.

### New Settings UI

![Screenshot](/img/2019/scr.png)

All the game and launcher related settings in a single page. All the components were connected with the respective ids and methods from the original _SettingsController_ class, so it inherits all the previous functionalities like saving to and restoring from the disk, validation, and correction.

Be sure to check out [this post](https://forum.terasology.org/threads/gsoc-2019-terasology-launcher-4-0.2268/post-16350) on my weekly GSoC forum thread.