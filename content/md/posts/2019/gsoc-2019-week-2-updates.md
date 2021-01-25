{:title  "GSoC 2019: Week 2 updates"
 :date   "10-06-2019"
 :layout :post
 :tags   ["gsoc" "terasology"]}

This week mostly involved studies and work for the Server Manager. On a new branch, I have started replacing the old UI code. Probably at the end of this summer, it'll get merged into _develop_ branch, when the launcher will be on the verge of version 4. <!-- more -->

### Web API client generation

I used the Swagger codegen plugin for Gradle to help generate the API client sources automatically using the API specifications. To generate the sources:

* Go to the root of _TerasologyLauncher_ project
* Run `gradlew generateSwaggerCodeClient` to generate the sources
* Run `gradlew idea` to rebuild IntelliJ files
* Now open _TerasologyLauncher.ipr_ in IntelliJ or restart it to finish importing

On success, you'll see a new module in the project tree:

![Screenshot](/img/2019/2019-06-10-124746_1366x768_scrot.png)

Be sure to check out [this post](https://forum.terasology.org/threads/gsoc-2019-terasology-launcher-4-0.2268/post-16345) on my weekly GSoC forum thread.