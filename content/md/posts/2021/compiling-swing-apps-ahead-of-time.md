{:title  "Compiling Swing apps ahead-of-time with GraalVM"
 :date   "23-04-2021"
 :layout :post
 :tags   ["java" "swing" "graalvm" "native"]}

Being the first major release of this year, [GraalVM 21.0](https://www.graalvm.org/release-notes/21_0/#native-image) added experimental support for Swing and AWT on Linux. A few weeks back I was compiling one Swing app with `native-image` and the result was as good as I had expected. Even though Swing is almost deprecated, this is a pretty welcome change considering a large number of desktop apps that can make use of this. So while the GraalVM team extends this feature to Windows and macOS, let us dive in.

### Prerequisites
Before building the native image, note that Swing is a GUI toolkit and it needs to connect with your graphics stack via JNI to draw its widgets. For this reason, you'll need to provide additional information to `native-image` tool regarding the JNI calls. You'll also need all the required library headers for linking your executable. So make sure you have the following libraries and their headers installed:
- libttf
- libtinput
- libgl

This time we'll be using the [FlatLaf](https://github.com/JFormDesigner/FlatLaf) demo app as an example. Keep reading to know how to generate the required config files. You can find all of the required files in [this repo](https://github.com/praj-foss/swing-graalvm-demo), along with the final executable if you're as impatient as I am. 😁

### Building
To generate the config files, we traditionally launch the app using the `java` command provided by GraalVM along with a [Tracing Agent](https://link.medium.com/7UEnv27dIfb) that keeps track of all Reflection and JNI calls.
```lang-shell-session
java -agentlib:native-image-agent=config-output-dir=config -jar flatlaf-demo.jar
```

After the app launches, be sure to interact with as many widgets as possible to trigger all possible JNI/Reflection calls. This step is very important as these methods get invoked reflectively at runtime and the agent will not be able to detect them unless we trigger the proper events. This can result in the app throwing a bunch of `NoSuchMethodException` when AoT-compiled.

Once you're done testing all the sections, close the app to write the required JSON files in the `config` directory. Now move on with building the native image with the following arguments:
```lang-shell-session
native-image --no-fallback \
             -H:ConfigurationFileDirectories=config \
             -Djava.awt.headless=false \
             -J-Xmx7G \
             -jar flatlaf-demo.jar \
             demo
```

It will take a while depending on your machine, and generate a **56 MB** binary named `demo`. You can compress it further down to **19 MB** by using `upx`.

### Result
And there you have it: A nice, little, standalone executable that launches a Swing app in the blink of an eye.

![FlatLaf Demo](/img/2021/flatlaf-demo.png)

Besides the improved startup performance, distributing your Swing app is now as easy as sharing an [AppImage](https://appimage.org/). It'll be interesting to see if JetBrains IDEs make use of this. I'm feeling pretty excited to write some toy apps now, but I think it's time to go back to studying, cuz my end-semester exams are coming next week. 😅