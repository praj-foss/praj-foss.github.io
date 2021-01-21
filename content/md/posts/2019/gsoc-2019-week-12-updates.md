{:title  "GSoC 2019: Week 12 updates"
 :date   "22-08-2019"
 :layout :post
 :tags   ["GSoC" "Terasology"]}

Finally, we're at the end! This last week of GSoC includes implementation of parts of the revised Package Manager model, namely the _PackageDatabase_ and some methods for interacting with [our Jenkins](http://jenkins.terasology.org) repository. <!-- more -->

### PackageDatabase

As per the revisions proposed last week, I've started implementing the _PackageDatabase_ as one of the core units in this API. Inside _$launcherDirectory/packages_, there are three important items to note:

* _sources.json_ :  
  This specifies all repositories to sync packages with. Details include its url, type and the names of packages to track.
* _packages.db_ :  
  It's a serialized _HashMap_ of repositories to lists of tracked packages that serves as our primary data store while querying for packages.
* _cache_ :  
  This folder will cache all the downloaded ZIP packages to support faster and offline package installation. Like all good cache storages, this too can be cleared any time to clean up disk space.
    

For example, my _sources.json_ looks like:

```lang-json
[
	{
		"url" : "http://jenkins.terasology.org/",
		"type" : "Jenkins",
		"trackedPackages" : [
			"DistroOmegaRelease",
			"DistroOmega",
			"TerasologyStable",
			"Terasology"
		]
	}
]
```

When we sync the _PackageDatabase_, it reads all the entries in the _sources.json_ and tries to fetch package details from the repositories and updates a map-based datastore, which could later be serialized down to the _packages.db_ file. Based on the repository type, it makes use of a _RepositoryHandler_ to properly fetch the package details. It makes use of [Gson](https://github.com/google/gson) for all the JSON related tasks.

### RepositoryHandler and JenkinsHandler

The RepositoryHandler interface specifies one important abstract method and one static factory method:

```lang-java
interface RepositoryHandler {
	List<Package> getPackages(PackageDatabase.Repository source);

	static RepositoryHandler ofType(String type) {
		switch (type) {
			case "Jenkins": return new JenkinsHandler();
			case "Custom":  return new CustomRepositoryHandler();
			default: return null;
		}
	}
}
```

The `getPackages` method should be called to fetch all package information from a given source repository, and the `ofType` factory method will return the appropriate `RepositoryHandler` implementation for any type as specified in the _sources.json_ file.

`JenkinsHandler` is a `RepositoryHandler` that takes care of fetching package details from our Jenkins server, but can possibly interact with any Jenkins repository following a similar URL pattern. It connects using the Jenkins JSON API with a _tree_ parameter to filter out the right details. The end product is a list of _Packages_ that include all necessary details like its name, version and download link that could be used later.

Be sure to check out [this post](https://forum.terasology.org/threads/gsoc-2019-terasology-launcher-4-0.2268/post-16394) on my weekly GSoC forum thread.