{:title  "GSoC 2019: Week 9 updates"
 :date   "01-08-2019"
 :layout :post
 :tags   ["GSoC" "Terasology"]}

So the first week of our third phase, finally came to an end. Almost the entire week was dedicated to the package manager, and it's still far from being complete. But the launcher no longer crashes or freezes while starting up with it, and that's a relieving thing to see. <!-- more -->

### Package Manager API

I'm trying my best not to infect the _PackageManager_ codebase with our old _TerasologyGameVersion_ mechanics while allowing satisfactory interaction between them. The launcher now starts up successfully, while loading and caching using the Package Manager.

![Screenshot](/img/2019/2019-07-30-031552_969x563_scrot.png)

There's still a lot more stuff to do, but at least we have a visible output now. The new `loadGameVersionsFromPackageManager` method now helps in integrating _TerasologyGameVersions_ with the _PackageManager_, with good use of streams and null-safety.

```lang-java
for (GameJob job : GameJob.values()) {
    final List<TerasologyGameVersion> gameVersionList =
            packageManager.getPackageVersions(GamePackageType.byJobName(job.name()))
                        .stream()
                        .map(build -> getGameVersion(build, job, cacheDirectory))
                        .collect(Collectors.toList());
    
    gameVersionLists.put(job, gameVersionList);
}
```

Be sure to check out [this post](https://forum.terasology.org/threads/gsoc-2019-terasology-launcher-4-0.2268/post-16376) on my weekly GSoC forum thread.