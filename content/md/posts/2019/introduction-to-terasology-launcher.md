{:title  "Introduction to Terasology Launcher"
 :date   "25-05-2019"
 :layout :post
 :tags   ["GSoC" "Terasology"]}

This summer I'll be working on [Terasology Launcher](https://github.com/MovingBlocks/TerasologyLauncher), the official launcher for the [Terasology](https://terasology.org/) project. It helps in managing various game versions and configuring local storage, memory settings, and logging level. My project aims to enhance the launcher and make it easier to use. All the progress will be showcased in the upcoming version **4.0**. <!-- more -->

### Status

Here's how the current version (3.x) of the launcher looks like:

![Current build](/img/2019/2019-05-22-162257_971x593_scrot.png)![Settings](/img/2019/2019-05-22-162322_692x600_scrot.png)

The launcher is written in Java and uses JavaFX for its UI. At least Java 8 is required to start the launcher. The source code is available on GitHub under Apache License 2.0.

### Architecture

The app starts from the main class _TerasologyLauncher_ and proceeds on to various background tasks. Not many external libraries are used except for logging and a few other jobs. Here's a simple diagram explaining the architecture:

![Architecture](/img/2019/terasologylauncher.png)

Apart from the primary classes shown above, there are many utility classes that help in file handling, downloading, etc. The launcher is built using **Gradle**, the same build system used in the actual game. You can check out the project wiki on GitHub for more information.