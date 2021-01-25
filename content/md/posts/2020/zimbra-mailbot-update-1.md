{:title  "Zimbra Mailbot: Update 1"
 :date   "13-08-2020"
 :layout :post
 :tags   ["telegram" "webdev" "zimbra" "clojure"]}

My college exclusively uses Zimbra 8 as its mail server and the most annoying part is that there's no easy way to fetch new emails automatically (unlike Gmail app). The unavailability of any official Android app only makes it worse. So it's been a while since I started working on [this chatbot](https://github.com/praj-foss/zimbramailbot) that can forward emails from any Zimbra account to Telegram. On a side note, it's also helping me sharpen my Clojure skills for web dev. <!-- more -->

### The Plan

The primary mode of accessing Zimbra is via an old-fashioned web app. While it's good enough for casual email management, I find the lack of an auto-updating inbox really annoying, i.e., you need to open the web app and check for new emails every time. Luckily they also have REST, GraphQL, and SOAP APIs to use their web service and I figured out how I could make a Telegram chatbot that could fetch emails from my Zimbra regularly. One more important feature is how Zimbra's own bot account (a.k.a _The Postmaster_) can send notification emails to a secondary email id. You can set it up to receive a notification mail ("New message received at ... ") on your Gmail each time your Zimbra receives something. Although it doesn't forward the actual content of the mail, it's the closest feature you can get to an auto-syncing inbox. 

![diagram](/img/2020/zmb-1.png)

Making use of these notifications, the bot could reactively fetch new mails from Zimbra, making things more efficient than a usual polling strategy. I'll be continuing with their SOAP API since it's more mature and well documented. Under the hood, the bot is a usual web application that keeps responding to messages sent by the user. The bot should do the following:

1. Fetch the Zimbra auth token from the user
2. Configure Zimbra to notify bot's custom mail server
3. On receiving a notification, fetch new mail from Zimbra
4. Format and forward the mail to user's Telegram

Telegram's [Bot API](https://core.telegram.org/bots/api) is heavily documented as well, making it fun to build great bots from scratch. One Google search can find a ton of articles on how to get started.

### Current status

It just reached _0.0.5_ and this pre-alpha bot is already online replying to basic commands, although it's not connectable to Zimbra yet. It's also the first project where I'm seriously moving with _Test Driven Developement_, and it's been awesome so far. It should be noted that I've planned it to be compatible with any Zimbra 8 server, not just the one from my college. The roadmap is split something like this:

* _0.1.0_ : A dummy chatbot running online, CI/CD and a better domain
* _0.2.0_ : Full compatibility with Zimbra 8, own mail server
* _0.3.0_ : Postgres setup, fault-tolerant and ready for beta testing

The project is written completely in Clojure and the server is built using [ring](https://github.com/ring-clojure/ring) and [compojure](https://github.com/weavejester/compojure) on top of [http-kit](https://github.com/http-kit/http-kit). It makes use of [core.async](https://github.com/clojure/core.async) channels to have a very concurrent architecture. Here's a screenshot of me talking to [@zimbramailbot](https://t.me/zimbramailbot): 

![screenshot](/img/2020/zmb-2.png)

I'm yet to set up a custom domain for it, but it'd all be done before next minor release. Finally, a big thanks to [alwaysdata](https://www.alwaysdata.com/en/) for their awesome free plan. Don't forget to check out their great IPv6-ready PaaS offers. 🚣‍♂️