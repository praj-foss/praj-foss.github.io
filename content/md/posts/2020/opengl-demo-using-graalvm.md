{:title  "OpenGL demo using GraalVM"
 :date   "21-06-2020"
 :layout :post
 :tags   ["graalvm" "opengl" "native" "java" "gradle"]}

Let me show how you can use [GraalVM](https://www.graalvm.org/) to create an OpenGL app in Java. This is made possible by the _native-image_ tool that helps GraalVM produce truly native binaries capable of interacting with native libraries directly, without any JNI overhead. ⚡️ <!-- more -->

### Introduction

GraalVM has been trending a lot in the Java ecosystem recently. It has a remarkable capability of compiling Java bytecode to native binaries ahead-of-time, an issue that many projects had tried to solve in the past. But that isn't the only fascinating thing. GraalVM supports a multitude of languages like Python, Ruby, JavaScript, C++, Rust, etc. besides the regular JVM languages (like Clojure, Kotlin, and Scala), and lets them interoperate with almost zero overhead. It can also run in multiple contexts including OpenJDK, Node.js, and SubstrateVM (internally used by native-image), making it a powerful polyglot runtime.

We'll be reproducing the [Utah teapot example](https://rosettacode.org/wiki/OpenGL/Utah_Teapot) from Rosetta code in Java 11. Since we'd also be briefly leaving the JVM world to connect with native technologies, some parts would look familiar to C/C++ code. I'm not an OpenGL expert but I'll try my best to explain all the setup. All the source code can be found [on GitHub](https://github.com/praj-foss/opengl-graal-examples).

### Project structure

Atleast JDK 11 is required to run this project. The [gradle-graal](https://plugins.gradle.org/plugin/com.palantir.graal) plugin is used to auto-download GraalVM. It is then configured accordingly:

```lang-kotlin
graal {
    graalVersion("20.0.0")
    javaVersion("11")

    mainClass("in.praj.glexamples.Main")
    outputName("glExample")
    option("--no-fallback")
    option("--verbose")
    option("--no-server")
    option("-H:+ReportExceptionStackTraces")
}
```

We explicitly mention `--no-fallback` to prevent GraalVM from using a regular JVM when AOT compilation fails. We also need to specify dependencies on GraalVM and SubstrateVM APIs:

```lang-kotlin
dependencies {
    val graalVer = graal.graalVersion.get()

    compileOnly("org.graalvm.sdk", "graal-sdk", graalVer)
    compileOnly("org.graalvm.nativeimage", "svm", graalVer)
}
```

Like regular Gradle projects, the sources are present inside _src/main/java/_. The `GLUT` and `GL` classes provide access to functions from _libglut_ and _libGL_, respectively. The `Main` class represents our actual OpenGL program. Now let's take a deep dive.

### App Context

First, we specify the required native libraries in a `Directives` inner class and use it to setup a context for our application. This notifies SubstrateVM of our requirements:

```lang-java
@CContext(Main.Directives.class)
public class Main {
    public static final class Directives implements CContext.Directives {
        @Override
        public List<String> getHeaderFiles() {
            return Collections.singletonList("<GL/glut.h>");
        }

        @Override
        public List<String> getLibraries() {
            return Arrays.asList("GL", "glut");
        }
    }

    // ...
}
```

Essentially, `getHeaderFiles` returns the list of all headers we'd have mentioned after `#include` if it were written in C/C++, and `getLibraries` returns the list of libraries that would have been passed to your C/C++ compiler.

### Bindings

There's a rich set of API to provide support for raw C/C++ data structures. Most important interface to note is `org.graalvm.word.WordBase`. It's the base type used to represent native data types like pointers and structs, and its descendants are **not** regular Java objects (descendants of `java.lang.Object`). Let's take a quick look at parts of `<GL/glut.h>`, in an over-simplified manner:

```lang-c
#define  GLUT_SINGLE  0x0000
void  glutInit( int* pargc, char** argv );
void  glutInitDisplayMode( unsigned int displayMode );
void  glutDisplayFunc( void (* callback)( void ) );
```

And here's what the corresponding Java bindings look like:

```lang-java
@CContext(Main.Directives.class)
class GLUT {
    @CConstant("GLUT_SINGLE")
    static native int SINGLE();

    @CFunction("glutInit")
    static native void init(CIntPointer argc, CCharPointerPointer argv);

    @CFunction("glutInitDisplayMode")
    static native void initDisplayMode(int displayMode);

    @CFunction("glutDisplayFunc")
    static native void displayFunc(Callback callback);

    interface Callback extends CFunctionPointer {
        @InvokeCFunctionPointer void invoke();
    }

    // ...
}
```

There's a boilerplate indeed, but it's much cleaner than JNI. By default, the annotations take the function name as an argument and find the corresponding declaration from the headers. So you have to pass in the names explicitly if you want to use something different for your bindings. Primitive Java types can be used to represent similar C/C++ types, but you'll need to use GraalVM's custom types for handling pointers.The `Callback` interface is used to represent the signature of a function that needs to be passed into `GLUT.displayFunc` using a function pointer. After a while, you'll see how we create and pass those function pointers.

### Real Program

Inside our main method we have the actual app code. First, we need to pass in the CLI arguments to our `GLUT.init` call, and then configure the window system:

```lang-java
try (var argv = CTypeConversion.toCStrings(args)) {
    var argc = StackValue.get(CIntPointer.class);
    argc.write(args.length);
    GLUT.init(argc, argv.get());
}

GLUT.initDisplayMode(GLUT.SINGLE() | GLUT.RGB() | GLUT.DEPTH());
GLUT.initWindowPosition(15, 15);
GLUT.initWindowSize(400, 400);
try (var title = CTypeConversion.toCString("Utah Teapot - GraalVM")) {
    GLUT.createWindow(title.get());
}
```

The first parameter to `GLUT.init` is a pointer to the number of CLI arguments, and we create this on our stack using `StackValue` class. The second parameter is the actual list of CLI arguments, which is represented by an array of Strings in Java and by an array of `char*` in C/C++. Fortunately, there's a utility class called `CTypeConversion` for such scenarios. `CTypeConversion.toCStrings` returns a safe holder for the `char**` value representing the array, which can be used inside a try-with-resources block. Once the holder is closed, the pointer inside must not be used. We similarly set up `GLUT.createWindow`.

Next, we set up the lighting and materials that affect our scene:

```lang-java
GL.clearColor(0.5f, 0.5f, 0.5f, 0f);
GL.shadeModel(GL.SMOOTH());
try (var white = PinnedObject.create(new float[] {1f, 1f, 1f, 0f});
     var shine = PinnedObject.create(new float[] {70f})) {
    GL.lightfv(GL.LIGHT0(), GL.AMBIENT(), white.addressOfArrayElement(0));
    GL.lightfv(GL.LIGHT0(), GL.DIFFUSE(), white.addressOfArrayElement(0));
    GL.materialfv(GL.FRONT(), GL.SHININESS(), shine.addressOfArrayElement(0));
}

GL.enable(GL.LIGHTING());
GL.enable(GL.LIGHT0());
GL.enable(GL.DEPTH_TEST());
```

The third parameter to `GL.lightfv` and `GL.materialfv` requires a float array. Now, Java arrays cannot be directly passed here because they don't descend from `WordBase`. So we create a `PinnedObject` to represent this array and pass the pointer to its first element using `addressOfArrayElement(0)`. Pinning the array is important as it preserves the value of that pointer by preventing the garbage collector from moving it. After the pinned object is closed, the garbage collector is free to remove it.

We end our main method by setting up display and idle callbacks, and running the GLUT main loop:

```lang-java
GLUT.displayFunc(displayCallback.getFunctionPointer());
GLUT.idleFunc(idleCallback.getFunctionPointer());
GLUT.mainLoop();
```

The `display` function is used to draw the teapot, while the `idle` function updates its angle of rotation. Both are called each frame by the GLUT main loop. Right now, creating pointer to a function with specific signature is a bit tricky. This will likely become much simpler when [issue 730](https://github.com/oracle/graal/issues/730) is resolved. Let's take a look at how the display callback is implemented here:

```lang-java
@CEntryPoint
@CEntryPointOptions(prologue = CEntryPointSetup.EnterCreateIsolatePrologue.class,
                    epilogue = CEntryPointSetup.LeaveTearDownIsolateEpilogue.class)
private static void display() {
    GL.clear(GL.COLOR_BUFFER_BIT() | GL.DEPTH_BUFFER_BIT());

    GL.pushMatrix();
    GL.rotatef(rotation.get().read(), 0f, 1f, 1f);
    try (var mat = PinnedObject.create(new float[] {1, 0, 0, 0})) {
        GL.materialfv(GL.FRONT(), GL.DIFFUSE(), mat.addressOfArrayElement(0));
    }
    GLUT.wireTeapot(0.5);
    GL.popMatrix();

    GL.flush();
}

private static final CEntryPointLiteral<GLUT.Callback> displayCallback =
        CEntryPointLiteral.create(Main.class, "display");
```

The `display` function is annotated as a `@CEntryPoint` to allow calling it from the native side. The `@CEntryPointOptions` is used to configure the handling of _Isolates_. These are disjoint heaps that can be used to strictly separate groups of objects in memory. I won't go deeper into the topic, but you can see [Christian Wimmer's post](https://link.medium.com/0eOUY2HGI7) for an idea. Each time such an entry-point is called, we need to take care of the isolate it will be executed in. We simply create an isolate upon entering the function and destroy it upon returning. Finally, we create a `CEntryPointLiteral` to hold the pointer to `display` and cast it as a `GLUT.Callback`.

Now we need to implement the `idle` function to update the angle of rotation. This angle is stored as an global variable whose pointer is accessible to both `display` and `idle` functions.

```lang-java
private static final CGlobalData<CFloatPointer> rotation = 
    CGlobalDataFactory.createBytes(() -> 4);

@CEntryPoint
@CEntryPointOptions(prologue = CEntryPointSetup.EnterCreateIsolatePrologue.class,
                    epilogue = CEntryPointSetup.LeaveTearDownIsolateEpilogue.class)
private static void idle() {
    var rotPtr = rotation.get();
    rotPtr.write(0.1f + rotPtr.read());
    GLUT.postRedisplay();
}

private static final CEntryPointLiteral<GLUT.Callback> idleCallback =
        CEntryPointLiteral.create(Main.class, "idle");
```

Any `static final` value is stored in a special location called the _Image Heap_ and this is accessible to any isolate. We allocate 4 bytes (size of `float`) and create a pointer to this in our image heap using `CGlobalDataFactory`. This global variable can be accessed inside `idle` function to update the angle. We create a pointer to `idle` in the same way as before.

### Results

To build the program, use the following command in the root project directory:

```lang-shell-session
./gradlew nativeImage
```

It takes a while for building. After completion, the executable can be found inside _build/graal/_. It should weigh around 6mb, and be ready for action:

![Demo](/img/2020/teapot.gif)

Hope you find this post interesting. If you see any mistakes in the process or you'd like to suggest an improvement, feel free to comment below. GraalVM is an incredible technology in the Java ecosystem, and it deserves a good place in native app development. 💎