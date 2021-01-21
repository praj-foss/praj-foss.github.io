{:title  "Calling uname from Java using GraalVM"
 :date   "21-08-2020"
 :layout :post
 :tags   ["GraalVM" "Linux" "Native" "Java"]}

For years I'd been searching how to build native Linux apps using Java and somehow [GraalVM](https://www.graalvm.org/) has concluded it all. GraalVM's native-image tooling is arguably the most elegant way of connecting Java to the native world. We'll be exploring a clean way to interoperate with C libraries by writing a [uname](https://en.wikipedia.org/wiki/Uname) alternative in pure Java. No JNI mess, no `sun.misc.Unsafe` imports, just GraalVM. 🛠️ <!-- more -->

### Unix name

Traditionally found in Unix-like operating systems, `uname` (i.e. Unix name) is the simplest way to check kernel info. Here's what it looks like on my Linux machine:

```lang-shell-session
$ uname -a
Linux praj-aspire 5.7.10-zen1-1-zen #1 ZEN SMP PREEMPT Wed, 22 Jul 2020 20:13:40 +0000 x86_64 GNU/Linux
```

And here's how you break down that long output:

| Key              | Value                                              |
| ---------------- | -------------------------------------------------- |
| Kernel name      | Linux                                              |
| Node name        | praj-aspire                                        |
| Kernel release   | 5.7.10-zen1-1-zen                                  |
| Kernel version   | #1 ZEN SMP PREEMPT Wed, 22 Jul 2020 20:13:40 +0000 |
| Machine          | x86_64                                             |
| Operating system | GNU/Linux                                          |

Internally, this uses the `<sys/utsname.h>` header provided by the C standard library. This header declares two important things: The `utsname` struct which stores the kernel data, and the `uname` function which fills up that struct.

```lang-c
struct utsname {
    char sysname[];      /* Kernel name */
    char nodename[];     /* Node name */
    char release[];      /* Kernel release */
    char version[];      /* Kernel version */
    char machine[];      /* CPU architecture */
#ifdef _GNU_SOURCE
    char domainname[];   /* Domain name */
#endif
};

int uname(struct utsname *buf);
```

There are fields for every data we need except the OS name, which we'll skip for the sake of simplicity. Also, `domainname` isn't available across all Unix-likes, so we'll ignore that as well. Our goal is simple now: Create a struct, fill in the data and display.

### Project setup

All the source code is available [on GitHub](https://github.com/praj-foss/uname-graalvm-demo). Make sure you have at least JDK 11 installed. We start with a basic Gradle setup, apply [gradle-graal](https://github.com/palantir/gradle-graal) plugin, and import GraalVM SDK:

```lang-kotlin
// build.gradle.kts
plugins {
    java
    id("com.palantir.graal") version "0.7.0"
}

graal {
    graalVersion("20.0.0")
    javaVersion("11")

    mainClass("in.praj.demo.Main")
    outputName("uname-graal")
    option("--no-fallback")
    option("--no-server")
}

dependencies {
    compileOnly("org.graalvm.sdk:graal-sdk:${graal.graalVersion.get()}")
}
```

We can get started with the main program now. The very first thing to declare is the context for our native image. This will contain information about the libraries to be linked, just how we do it in C. We declare a list containing the only header we need for now:

```lang-java
@CContext(Main.Directives.class)
public class Main {
    public static final class Directives implements CContext.Directives {
        @Override
        public List<String> getHeaderFiles() {
            return Collections.singletonList("<sys/utsname.h>");
        }
    }
    // ...
}
```

To interoperate with native data structures, GraalVM provides the `org.graalvm.word.WordBase` interface. Note that any descendant of WordBase is not your usual Java object (which comes from `java.lang.Object`) and hence needs to be handled differently. The `@CStruct` annotation can be used to refer to C `struct` types using plain Java interfaces. This interface needs to be a child of `PointerBase` and can declare multiple fields of the struct. If a field has corresponding non-pointer type available in Java (e.g. `int`, `float`, or even `UnsignedWord`) we use the `@CField` annotation, otherwise there's `@CFieldAddress`. Since `char` arrays in C can also be represented by a `char*`, we'll be using `CCharPointer` for the fields.

```lang-java
@CStruct("struct utsname")
interface Utsname extends PointerBase {
    @CFieldAddress CCharPointer sysname();
    @CFieldAddress CCharPointer nodename();
    @CFieldAddress CCharPointer release();
    @CFieldAddress CCharPointer version();
    @CFieldAddress CCharPointer machine();
}
```

The `@CFieldAddress` can optionally take the name of the actual struct field but it uses the method name by default. Next, we have the `uname` function, which takes in a pointer to the struct. Luckily, it turns out that interfaces annotated with `@CStruct` store a pointer to the struct. So our `Utsname` can be substituted anywhere we need a `struct utsname*` type. So we create a binding for the function directly:

```lang-java
@CFunction
static native int uname(Utsname buf);
```

Now we just need to call them from our `main` method while taking care of native-to-java type conversion:

```lang-java
static void print(String key, CCharPointer value) {
    System.out.println(key + ": " + CTypeConversion.toJavaString(value));
}

public static void main(String[] args) {
    var info = StackValue.get(Utsname.class);
    if (uname(info) == -1) {
        System.out.println("Error loading system information");
        System.exit(-1);
    }

    print("Kernel name", info.sysname());
    print("Node name", info.nodename());
    print("Kernel release", info.release());
    print("Kernel version", info.version());
    print("Machine", info.machine());
}
```

Well, that's all the hard work. Let's build and run:

```lang-shell-session
$ ./gradlew nativeImage && ./build/graal/uname-graal
Kernel name: Linux
Node name: praj-aspire
Kernel release: 5.7.10-zen1-1-zen
Kernel version: #1 ZEN SMP PREEMPT Wed, 22 Jul 2020 20:13:40 +0000
Machine: x86_64
```

That was a quick demo of interfacing Java to native libraries using GraalVM. Although the compilation times are quite slower than most other AOT compiled languages, GraalVM provides a great scope for Java to be used with native technologies. If you liked this, be sure to check out my previous post [on OpenGL and GraalVM](/posts/2020/opengl-demo-using-graalvm).