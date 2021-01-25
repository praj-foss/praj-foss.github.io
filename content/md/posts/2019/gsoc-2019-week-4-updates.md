{:title  "GSoC 2019: Week 4 updates"
 :date   "28-06-2019"
 :layout :post
 :tags   ["gsoc" "terasology"]}

A much-anticipated feature was successfully implemented this week - **bundled JRE**. Gradle now automatically bundles any given JRE with the generated application package. <!-- more -->

### Bundled JRE

To test this feature, you'll need any JRE 8 distribution with JavaFX in it. Grab a package from these vendors:

* [Azul Zulu](https://www.azul.com/downloads/zulu/zulufx/)
* [Bellsoft Liberica](https://bell-sw.com/pages/java-8u212/)
* [Oracle Java](https://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html) (Proprietary)

Extract the downloaded files and use `gradlew clean build -PbundleJre=/path/to/jre` to generate the ZIP packages inside _./build/distributions_. Try them in any system, it'll execute the bundled JRE only.

![Screenshot 1](/img/2019/2019-06-27-235550_602x510_scrot.png)

The generated launcher packages now include the JRE. After executing the startup script, you can have a look at the generated log files to get more information about the bundled JRE.

![Screenshot 2](/img/2019/2019-06-28-000607_780x453_scrot.png)

Be sure to check out [this post](https://forum.terasology.org/threads/gsoc-2019-terasology-launcher-4-0.2268/post-16354) on my weekly GSoC forum thread.