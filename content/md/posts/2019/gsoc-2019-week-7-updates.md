{:title  "GSoC 2019: Week 7 updates"
 :date   "27-07-2019"
 :layout :post
 :tags   ["GSoC" "Terasology"]}

A long-standing bug was fixed this week. This had been the cause of [a test failure](http://jenkins.terasology.org/view/Launcher/job/TerasologyLauncherPRs/114/testReport/) in _TerasologyLauncherPRs_ job of [our Jenkins](http://jenkins.terasology.org/), for almost as long as a month. Also did a few tweaks on the Package Manager API, along with a diagram for my initial plan. <!-- more -->

### The Test failure

This test had been failing since [build 102](http://jenkins.terasology.org/view/Launcher/job/TerasologyLauncherPRs/102/) of _TerasologyLauncherPRs_, but weirdly, all the tests were passing flawlessly on my local machine. Even weirder was the reason for this failure:

![Screenshot](/img/2019/screenshot_2019-07-27-terasologylauncherprs-114-test-testinitdefault-jenkins.png)

Coincidentally, this build was also the first in that line to be hosted on a [new Jenkins node](http://jenkins.terasology.org/computer/martin-steiger.de/). So our first guess was that it's failing due to some trouble detecting the right locale in the new server. But after hours of debugging and running groovy scripts, I failed to find a single environmental problem that could have caused it.

Miraculously, the test started failing on my local machine too after a point. And that's when I realized it wasn't actually a problem in the machine setup. After some more analysis, I had finally found the source of this problem: The state of a utility class was getting modified by a former test, which caused this test to make wrong assertions. This was corrected by resetting its state before starting on the newer test, and the job was done!

### Package Manager plans

I made a diagram that describes our initial plan for the package manager. Only the three basic functionalities have been described:

![Diagram](/img/2019/pkgmgr.png)

Be sure to check out [this post](https://forum.terasology.org/threads/gsoc-2019-terasology-launcher-4-0.2268/#post-16372) on my weekly GSoC forum thread.