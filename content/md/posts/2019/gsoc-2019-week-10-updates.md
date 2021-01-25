{:title  "GSoC 2019: Week 10 updates"
 :date   "07-08-2019"
 :layout :post
 :tags   ["gsoc" "terasology"]}

Alright! The last month is half done, and this week brings some more updates to the Package Manager. The integration is ready to be tested and is almost working just the way it used to, along with the invisible Package Manager underneath. Though it only supports storing and loading of cache now, future PRs should bring full powers to it: installation, uninstallation, etc. <!-- more -->

### Package Manager API

The version list creation code has become full of streams and the lines of code have reduced significantly while keeping the Package Manager and the game version classes decoupled.

```lang-java
// Get list of installed games
final List<TerasologyGameVersion> allInstalledGames = getInstalledGames(gameDirectory);

for (GameJob job : GameJob.values()) {
    // Get all available games from Jenkins or cache
    final List<TerasologyGameVersion> availableGames =
            packageManager.getPackageVersions(GamePackageType.byJobName(job.name()))
                    .stream()
                    .map(build -> getGameVersion(build, job, cacheDirectory))
                    .collect(Collectors.toList());

    // Copy installation data for the games that are already installed
    allInstalledGames.stream()
            .filter(gameVersion -> gameVersion.getJob().equals(job))
            .forEach(game -> {
                for (TerasologyGameVersion availableGame : availableGames) {
                    if (availableGame.getBuildNumber().equals(game.getBuildNumber())) {
                        availableGame.setInstallationPath(game.getInstallationPath());
                        availableGame.setGameJar(game.getGameJar());
                        break;
                    }
                }
            });

    // Add the installed games and sort descendingly by build numbers
    availableGames.sort(
        Comparator.comparing(TerasologyGameVersion::getBuildNumber).reversed());
        
    // Add extra item denoting the latest version
    availableGames.add(0, makeLatestFrom(availableGames.get(0)));

    gameVersionLists.put(job, availableGames);
}
```

The launcher now lists failed builds along with the _latest_ placeholder. All the basic features, i.e. downloading, starting and removing games are working fine.

Be sure to check out [this post](https://forum.terasology.org/threads/gsoc-2019-terasology-launcher-4-0.2268/post-16380) on my weekly GSoC forum thread.