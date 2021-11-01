{:title  "Exploring JNR (Part 1) - A faster way to connect Java to native libraries"
 :date   "28-10-2021"
 :layout :post
 :tags   ["java" "jni" "jnr" "native" "linux"]}

If you're writing an _actual_ desktop software, you'll sometimes find a need to call system services from your favorite language. For a Java developer like me, it hurts me every time I'm reminded [how messy it is](https://www.oracle.com/webfolder/technetwork/tutorials/obe/java/JNI_OBE/JNI_OBE.html) to connect to native libraries in the standard way, i.e. using JNI. Fortunately, there are other libraries JNA, JNR, Panama, etc. that were designed to make this labor easier. In today's post, I'll be showing you how to connect to a C library using [JNR FFI](https://github.com/jnr/jnr-ffi) - a simple, modern, and performant framework, that also happens to be surprisingly undocumented.

The JNI approach involves writing glue code in C/C++, compiling them on each target platform, and bundling them along with the jar files for distribution. This is quite a hectic task, as manually writing the JNI C code can be error-prone, and it's also tough to maintain when the bindings grow large. It has also been the _only_ official way till now, and with proper tuning, it should achieve the maximum performance possible. The most popular alternative to this is [JNA](https://github.com/java-native-access/jna), which has been used by thousands of Java apps for quite a while. JNA allows us to write the bindings directly in Java, as it automatically generates required the JNI metadata on the fly without the need for compiling any C/C++ code on your side.

JNR is a newer framework, with goals similar to JNA, but has a different API and underlying technology. I prefer the JNR API because of its simplicity and also the [performance edge](https://github.com/zakgof/java-native-benchmark) over JNA, but it's quite challenging to try at first because of the [lack of documentation](https://github.com/jnr/jnr-ffi/tree/master/docs). Later in the post, I'll describe some fundamental examples using a tiny library I wrote in C, and hopefully, that'll serve as a good starting point for any newcomer. The newest one of the frameworks is [Project Panama](https://openjdk.java.net/projects/panama), which is still in the incubation phase as of OpenJDK 17. It is expected that Panama will drastically simplify the development work, as it will provide the tooling to automatically generate binding from any C library, wiping out the need to write even the Java bits of glue code from JNA or JNR. It should also be very optimized, thanks to the development done by the OpenJDK team itself. But while they work on making it stable, let us dive into JNR, which is one of the best choices as of now.

### Prerequisites
The source code is available [on GitHub](https://github.com/praj-foss/jnr-demo) as always. The project contains C code, so you'll need GCC or any other C compiler to build the native library first. JNR requires JDK 8 or higher, but in this example, I'll be using Java 11 for development. Make sure you're not running these examples on any machine architecture that is unsupported by JNR, which is highly unlikely given how widespread ARM and x86 chips are these days.

The build script defines a task called `cc` that simply executes `gcc` underneath with proper flags. The `run` task is configured to take in the compiled library path. To build and run the project, you just have to enter `./gradlew basics:run`. It runs perfectly fine on Linux, while it might require some changes for Windows or OS X for the C library compiling and loading part. So make sure you do changes all necessary bits in `build.gradle.kts` if needed.

### Examples
JNR makes use of syntactic similarity between Java and C to link to the correct function calls. I would recommend going through the [official docs](https://github.com/jnr/jnr-ffi/blob/master/docs/GettingStarted.md) once to get a basic idea before proceeding. The native function struct declarations should help you figure out the correct return types, input types, and annotations to put on your Java code. The C library I wrote doesn't provide a header file for the sake of simplicity, but almost all popular native libs should be providing one that you could make use of.

#### Basics
First of all, you need to analyze the C headers of the target library and understand how the C types need to be mapped into corresponding Java types. Here are some declarations from `minimal.c` found in the project repo:

```lang-c
long int get_sum(unsigned int first, unsigned int second);
char *get_string();
void fill_letter_union(letter_u *letter);
small_s *get_small_struct();
double some_opaque_extraction(void *opaque);
// and more ...
```

Next, you need to define a Java interface that has methods with appropriate input and return types to match those in the native function signatures. The method names must be identical to the function names. Here's how the interface for the previous C code would look like:

```lang-java
public interface LibMinimal {
    long get_sum(@u_int32_t int first, @u_int32_t int second);
    String get_string();
    void fill_letter_union(LetterUnion letter);
    SmallStruct get_small_struct();
    double some_opaque_extraction(Pointer opaque);
    // and more ...
}
```

After that, you need to load the library and JNR will provide you an implementation of the previous interface, which can be used to call the native functions:

```lang-java
import jnr.ffi.LibraryLoader;
import jnr.ffi.Runtime;

public class BasicApp {
    public static void main(String[] args) {
        var lib = LibraryLoader.create(LibMinimal.class).load("minimal");
        var runtime = Runtime.getRuntime(lib);        
        // ...
        System.out.println(lib.get_sum(first, second));
        var letterUnion = new LibMinimal.LetterUnion(runtime);
        lib.fill_letter_union(letterUnion);
        // ...
    }
}
```

In the above code, JNR searched for the **minimal** library, which would exist as the `libminimal.so` file after we build `minimal.c`. Usually, if your libraries are installed correctly in the system, JNR will detect them easily. Otherwise, you'll need to manually provide the library path to the program. In this demo, the correct paths are passed into the program using `LD_LIBRARY_PATH` variable while invoking the `run` Gradle task.

#### Numbers
Common numeric types in C like `int`, `short`, `long`, `float`, and `double` correspond to the primitive types of the same name in Java. There are also handy annotations under the `jnr.ffi.types` that allow you to exactly specify the signedness and width of the types. For example, we can use `@u_int32_t` to represent unsigned 32-bit integers, and this should be used either on `int` or `long` type in Java. There are also annotations like `@pid_t`, `@size_t`, etc. for common type aliases. Here's an example involving signed and unsigned 32-bit integers:

```lang-c
// minimal.c
int get_integer() {
    return 42;
}

long int get_sum(unsigned int first, unsigned int second) {
    return first + second;
}
```
```lang-java
// LibMinimal.java
int get_integer();
long get_sum(@u_int32_t int first, @u_int32_t int second);
```
```lang-java
// BasicApp.java
System.out.println("Meaning of life = " + lib.get_integer());
// Meaning of life = 42

int first = -559087616, second = 48879;
System.out.printf("%d + %d = %x\n", first, second, lib.get_sum(first, second));
// -559087616 + 48879 = deadbeef
```

#### Strings
A `char` is 8-bit in C as compared to 16-bit in Java, and C strings are just `char` arrays with an extra `\0` at the end. JNR automatically converts Java's `char[]`, `String`, `StringBuilder`, and `StringBuffer` into C strings. All of these allow mutations, except the `String` values.

```lang-c
// minimal.c
char *get_string() {
    char *str = (char *) malloc(6 * sizeof(char));
    strcpy(str, "ASCII");
    return str;
}

void mutate_string(char *input) {
    int length = strlen(input);
    int i = 0;
    while (i < length/2) {
        char tmp = input[length-1-i];
        input[length-1-i] = input[i];
        input[i] = tmp;
        i++;
    }
}

```
```lang-java
// LibMinimal.java
String get_string();
void mutate_string(StringBuilder input);
```
```lang-java
// BasicApp.java
System.out.println("Received = " + lib.get_string());
// Received = ASCII

var builder = new StringBuilder("WXYZ");
lib.mutate_string(builder);
System.out.println("Reversed = " + builder);
// Reversed = ZYXW
```

#### Structs
Structs are meant to store data in a structured way and the total size of the struct is the sum of all field sizes. To represent a struct, you need to define a subclass of `jnr.ffi.Struct` and use the inherited inner classes to specify the fields. Note that you need to specify the proper field sizes wherever necessary, e.g. in the case of string types. This helps JNR allocate sufficient memory when creating structs inside the Java heap. Also, ensure the constructor is public, there could be memory allocation issues otherwise. The `Struct` class also provides a handy `toString()` method that can print individual fields if they are `public` as well.

```lang-c
// minimal.c
typedef struct {
    unsigned int index;
    double value;
} small_s;

small_s *get_small_struct() {
    small_s *ptr = (small_s *) malloc(sizeof(small_s));
    ptr->index = 12;
    ptr->value = 34.567;
    return ptr;
}

typedef struct {
    char name[32];
    small_s *small;
} large_s;

void fill_large_struct(large_s *large) {
    strcpy(large->name, "LARGE");
    large->small->index = 98;
    large->small->value = 76.543;
}
```
```lang-java
// LibMinimal.java
class SmallStruct extends Struct {
    public final Unsigned32 index = new Unsigned32();
    public final Double value = new Double();
    public SmallStruct(Runtime runtime) {
        super(runtime);
    }
}

SmallStruct get_small_struct();

class LargeStruct extends Struct {
    public final AsciiString name = new AsciiString(32);
    public final StructRef<SmallStruct> small = new StructRef<>(SmallStruct.class);
    public LargeStruct(Runtime runtime) {
        super(runtime);
    }
}

void fill_large_struct(LargeStruct large);
```
```lang-java
// BasicApp.java
var smallStruct = lib.get_small_struct();
System.out.println(smallStruct);
// SmallStruct { 
//     index = 12
//     value = 34.567
// }

var largeStruct = new LibMinimal.LargeStruct(runtime);
largeStruct.small.set(smallStruct);
lib.fill_large_struct(largeStruct);
System.out.printf("Large struct data = %s, %d, %f\n",
        largeStruct.name.get(), smallStruct.index.get(), smallStruct.value.get());
// Large struct data = LARGE, 98, 76.543000
```

Note that creating structs from Java requires you to provide an instance of `jnr.ffi.Runtime`. This will allocate temporary memory for the struct that usually gets destroyed after passing it to native functions. So to prevent the struct from being destroyed, we can allocate it on heap memory, either using `malloc` from C code or using `jnr.ffi.Memory.allocateDirect` from Java.

#### Unions
Unions are the same as structs except for their memory structure. The total size of a union is the size of its largest field, and all the smaller fields use that same space. This means, each time you change a field in a union, the other fields will change too as all of them store data in the exact same memory chunk. To represent a union in Java, extend the `jnr.ffi.Union` class and follow the same rules as you did with structs:

```lang-c
// minimal.c
typedef union {
    unsigned char l;
    unsigned int v;
} letter_u;

void fill_letter_union(letter_u *letter) {
    letter->v = 70;
}
```
```lang-java
// LibMinimal.java
class LetterUnion extends Union {
    public final Unsigned8 l = new Unsigned8();
    public final Unsigned32 v = new Unsigned32();
    public LetterUnion(Runtime runtime) {
        super(runtime);
    }
}

void fill_letter_union(LetterUnion letter);
```
```lang-java
// BasicApp.java
var letterUnion = new LibMinimal.LetterUnion(runtime);
lib.fill_letter_union(letterUnion);
System.out.printf("Letter returned = %c\n", letterUnion.l.get());
// Letter returned = F
```

#### Enums
Enums in C are plain ol' integers, so you can simply use `int` to represent them in Java and pass in the raw numeric values instead of the enum constant name. However, JNR also provides a safer way to map them into normal Java enums, adding type-checking benefits. Create an enum that implements `jnr.ffi.util.EnumMapper.IntegerEnum` and return the appropriate integer when `intValue()` is called:

```lang-c
// minimal.c
typedef enum {
    SUNNY  = 1,
    CLOUDY = 2,
    RAINY  = 3
} weather_e;

weather_e get_weather() {
    return RAINY;
}
```
```lang-java
// LibMinimal.java
enum WeatherEnum implements EnumMapper.IntegerEnum {
    SUNNY(1), CLOUDY(2), RAINY(3);

    private final int value;
    WeatherEnum(int value) {
        this.value = value;
    }

    @Override
    public int intValue() {
        return value;
    }
}

WeatherEnum get_weather();
```
```lang-java
// BasicApp.java
System.out.println("Weather today = " + lib.get_weather());
// Weather today = RAINY
```

#### Opaque pointers
Sometimes you have to deal with a pointer to a struct whose definition is hidden, popularly known as opaque pointers. For such cases, you can use the general purpose `jnr.ffi.Pointer` class. In the following example, we declare an _obviously visible_ struct called `opaque_s` and pretend it is hidden. We use `void` pointers so that the function signatures don't tell anything about `opaque_s`.

```lang-c
// minimal.c
typedef struct {
    large_s *large;
} opaque_s;

void *get_opaque_pointer() {
    opaque_s *ptr = (opaque_s *) malloc(sizeof(opaque_s));
    ptr->large = (large_s *) malloc(sizeof(large_s));
    ptr->large->small = get_small_struct();
    ptr->large->small->value = 420.69;
    return ptr;
}

double some_opaque_extraction(void *opaque) {
    return ((opaque_s *) opaque)->large->small->value;
}
```
```lang-java
// LibMinimal.java
Pointer get_opaque_pointer();
double some_opaque_extraction(Pointer opaque);
```
```lang-java
// BasicApp.java
var opaque = lib.get_opaque_pointer();
System.out.println("Extraction result = " + lib.some_opaque_extraction(opaque));
// Extraction result = 420.69
```

#### Function pointers
The last example is for function pointers: the normal way of doing making callbacks and higher-order functions in C. This is fortunately very easy to represent in idiomatic Java, using method references or lambda functions. You just need to define a `@FunctionalInterface` with one method annotated with `jnr.ffi.annotations.Delegate`, having the correct input and return types.

```lang-c
// minimal.c
typedef int (*unary)(int);

int apply_unary_function(int arg, unary f) {
    return f(arg);
}
```
```lang-java
// LibMinimal.java
@FunctionalInterface
interface UnaryFunction {
    @Delegate int apply(int input);
}

int apply_unary_function(int arg, UnaryFunction f);
```
```lang-java
// BasicApp.java
System.out.printf("Square of %d = %d\n", 7, lib.apply_unary_function(7, n -> n * n));
// Square of 7 = 49
```

### Conclusion
We just finished our test drive of JNR FFI and witnessed how it simplifies interaction with native libraries. Feel free to drop a comment if you have any questions or feedback. I'm planning to write more posts in this series, exploring some more complex parts of the API and connecting to popular Linux libraries. So we'll meet again! 🤖
