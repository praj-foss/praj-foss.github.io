{:title  "Making Standalone Java apps"
 :date   "28-06-2020"
 :layout :post
 :tags   ["packaging" "java" "gradle"]}

Back in high school days, I learned how Java programs could work flawlessly across different machines without the need for any additional compilation - **Write once, run anywhere**. One of our laptops had a 64-bit Ubuntu installed while the other one had a 32-bit Windows 7. I tested out on a few more platforms and realized one particular hurdle that constantly popped up: It was necessary to have Java installed beforehand, which most OSs didn't ship by default. So here's a post about how you could make your apps truly standalone. <!-- more -->

### Bundling a JRE

A bundled JRE would allow your app to run just as it would with a user-side runtime. Because of the flawless compatibility, this method is preferred by many popular desktop apps including JetBrains IDEs and Minecraft. Bundling a complete JRE has been the traditional solution for making standalone apps. There's also a variety of tools that will help you create a proper package using this method. However, it also produces the most bloated distributable, as you're bundling the entire runtime even if you use only a few parts of the standard library. Here are some of the free OpenJDK builds you can use for bundling:

* [AdoptOpenJDK](https://adoptopenjdk.net/)
* [BellSoft Liberica](https://bell-sw.com/pages/downloads/)
* [Amazon Coretto](https://aws.amazon.com/corretto/)
* [Azul Zulu](https://www.azul.com/downloads/zulu-community/)

There aren't many significant downsides to this, other than bloating your package size. Gradle or Maven could also be easily configured to bundle a JRE along with your distributable ZIP. One of the goals of [my GSoC project](/posts/2019/introduction-to-terasology-launcher/) was to bundle a JRE with the _Terasology Launcher_, so that it runs without hassle.

#### Customized JRE

Since Java 9, the [jlink](https://docs.oracle.com/javase/9/tools/jlink.htm) tool can be used to assemble a custom Java runtime based on your module dependencies. This would result in a minimized JRE with just enough modules to run your app perfectly. However, it's not available in JDK 8 or older, which still has a significant developer population. Nevertheless, jlink is your best bet for **modern** standalone Java apps that don't want any compromise with its massive ecosystem.

### Helpful tools

Manual JRE bundling is a tedious job, so here are some common tools that can help you create a standalone package for your apps. These differ by the supported package formats and platforms:

* [libGDX packr](https://github.com/libgdx/packr): CLI tool supporting Windows, OS X and Linux. Can minimize JRE 8 and older too.
* [install4j](https://www.ej-technologies.com/products/install4j/overview.html): GUI tool supporting Windows, OS X and Linux.
* [launch4j](http://launch4j.sourceforge.net/): GUI tool for creating Windows installer.
* [parcl](https://github.com/mini2Dx/parcl): Gradle plugin similar to _packr_.
* [javapackager](https://github.com/fvarrui/JavaPackager): Maven plugin supporting multiple package formats like _deb_, _rpm_, _msi_, _dmg_, and _zip_.
* [snapcraft](https://snapcraft.io/docs/java-applications): Creates snap packages that can run across major Linux distros.

### Other solutions

You could use a different runtime than the usual OpenJDK-based JREs. The closest one is provided by [GraalVM](https://www.graalvm.org/) for compiling Java bytecode directly to native binaries, although it has certain [limitations](https://github.com/oracle/graal/blob/master/substratevm/LIMITATIONS.md). Another option might be to use [IKVM.NET](https://www.ikvm.net/) for running on top of CLR. If you're targetting just Android or iOS, have a look at Intel's [MultiOS engine](https://multi-os-engine.org/). But you can rest assured that bundling a proper JRE will have no compatibility issues on desktops. 👍️