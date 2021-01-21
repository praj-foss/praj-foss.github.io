{:title  "GSoC 2019: Week 1 updates"
 :date   "02-06-2019"
 :layout :post
 :tags   ["GSoC" "Terasology"]}

The first week of coding came to an end. This month's target is to implement a Server manager and a Game manager. I did spend a good amount of time preparing and learning more about the tools that can come handy. Besides that, a whole new base layout is ready for the launcher's UI. <!-- more -->

### Base UI

Designed using the good ol' Scene Builder, the base layout was made as close to the proposed mockups as possible. Looks similar to many web apps these days.

![UI](/img/2019/2019-06-06-061525_767x479_scrot.png)

The top bar will be used to start the game, as it was in the previous UI. The side menu will give access to all important sections. There's a status bar in the bottom that can show handy messages while that bunch of _Icon_ buttons is a placeholder for social media links.

An interesting point is that there's no side menu widget directly available in JavaFX (not in version 8 at least). So I implemented it by using a TabPane with some quick hacks.

### Web API and Swagger

There is [a facade](https://github.com/MovingBlocks/FacadeServer) for Terasology that can be used to start it in headless mode on a server and expose REST endpoints for interaction, just like a web service. The API is described [here](https://raw.githubusercontent.com/MovingBlocks/FacadeServer/develop/src/main/resources/web/swagger.json) using the OpenAPI 3.0 format, and this is helpful for integration with Swagger tools.

Using [Swagger Codegen](https://swagger.io/tools/swagger-codegen/) we can easily generate client SDKs for any web service described in OpenAPI format, for a wide range of programming languages. In the next week, I'll be trying to generate those code and use them for creating the Server manager.

Be sure to check out [this post](https://forum.terasology.org/threads/gsoc-2019-terasology-launcher-4-0.2268/post-16340) on my weekly GSoC forum thread.