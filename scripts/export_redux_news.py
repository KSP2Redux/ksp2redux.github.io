from __future__ import annotations

import html
import os
import re
import shutil
import sys
import textwrap
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BLOG_DIR = ROOT / "src" / "content" / "docs" / "blog"
MEDIA_DIR = ROOT / "public" / "blog" / "redux-news"

DISCORD_GUILD_BASE = "https://discord.com/channels/1078696971088433153"
CHANNEL_NAMES = {
    "1340177797196414996": "🟡redux-chat",
    "1078781791143469268": "⚪reaction-roles",
    "1340178127367831683": "🟡redux-suggestions",
}
USER_NAMES = {
    "192177564800909312": "Safarte",
    "299685147220115457": "cheese_queen",
    "320277884960899072": "PassivePicasso",
    "366972069440913418": "munix",
    "1192038910344306700": "glumo",
}


@dataclass
class Media:
    url: str
    filename: str | None = None
    alt: str | None = None


@dataclass
class Post:
    slug: str
    title: str
    date: str
    author: str
    body: str
    media: list[Media] = field(default_factory=list)


def md(text: str) -> str:
    return textwrap.dedent(text).strip()


POSTS: list[Post] = [
    Post(
        slug="dev-blog-0-whats-a-redux",
        title="Dev Blog 0: What's a Redux?",
        date="2025-02-25",
        author="Safarte",
        body=md(
            """
            # KSP2 Redux Dev Blog 0: "What's a Redux?"

            Hello everyone, let me introduce myself first, my name is Safarte and I am the developer of the *Kerbal Life-Support System* and *Docking Alignment Display* KSP2 mods. I joined the KSP2 Redux development team something like a month and a half ago and I've mostly been working on debug tools and some bug fixes.

            The goal of this first dev blog for Redux is to introduce you to the project in more details and provide you with some information on what we plan to do with it.

            ## What Redux isn't.

            - The next big AAA amazing space exploration game™
            - A quickly put together collection of existing mods
            - A teapot

            Now that that's out of the way, let's focus on **what Redux really is**.

            ## Who's working on Redux?

            We are a team of (mostly) KSP2 modders that really like this game and would like to see it reach its potential. There are currently a bit less than ten people working on Redux to varying levels of involvement.

            ## What is our scope for this project?

            Our plan for Redux is to try and achieve what we interpret as the core vision of the original developers of KSP2. This means both **fixing existing bugs** in the game, **improving performance** and most importantly **bring to life promised features** like colonies, interstellar travel or multiplayer. We also want to make the game as **moddable** as possible by providing tools to help the development of mods. Regarding features such as colonies, the current plan is to include all core functionality, with some parts to fill the necessary gameplay roles. Fancier parts will be left to modders to add to the game, for example: Redux might include a simple ISRU for colonies but mods could add many more of varying size, style, etc...

            ## What form will Redux take?

            Redux will most likely be distributed as an installer which will apply some patches to the relevant files in an existing KSP2 installation. Redux will not take the form of either a standalone executable or a simple Spacewarp mod, it's gonna be something in-between.

            We hope to be able to integrate Redux's installer into CKAN to make installation as simple as possible.

            ## What's gonna be in the first few releases?

            The aim of the first releases will be to get KSP2 to a state where we feel we can safely add more features to without it crumbling down to pieces. This mainly includes stuff like **performance improvements**, **bug fixes** and enhanced **modding support**.

            We also plan on including some quality of life stuff like some debug tools that can help develop mods or pinpoint issues.

            ## How can I contribute?

            **If you're a player:** we are open to suggestions, do not hesitate to drop your ideas in the [#🟡redux-suggestions](https://discord.com/channels/1078696971088433153/1340178127367831683) forum. Also, once Redux has released, please report any bug that you can find and think could be caused by our modifications.

            **If you're a modder:** please get in touch with us so we can accompany you on how to migrate your existing mods to support Redux.

            **If you're a Redux developer:** chop chop get back to work

            ## Final disclaimer

            Redux is a fan project entirely developed by **a team of (passionate) volunteers**, we do not have access to the resources of a full game studio so temper your expectations with this in mind. Redux might (and probably will) introduce new bugs to the game, we cannot check every possible scenario otherwise we'd never release anything. We also do not have any affiliation with the former KSP2 developers, please do not interpret this project as an official continuation of KSP2's development.
            """
        ),
    ),
    Post(
        slug="performance-improvements",
        title="Performance Improvements Overview",
        date="2025-02-25",
        author="foonix",
        body=md(
            """
            Basic rundown of Redux FPS improvements:

            **Leverage newer unity features**

            - Enable unity "Graphics Jobs" setting. Cuts 3-5ms off the frame on my computer.
            - Disable Unity `Physics.autoSyncTransforms` option. This required rewriting a lot of code to avoid depending on the autosync behavior.

            **Overhaul widely used systems for better performance**

            `TransformFrame` is how the game deals with multiple moving reference frames, and is used extensively through the code base. Redux replaces this with an ECS/Burst based system that is significantly faster.

            **Lots of individually minor "depessimizations" that add up to significant improvements.**

            Too many to list in a discord comment. Many, many code systems have been tweaked to remove unnecessary steps, fix unnecessary garbage allocations, and accomplish the same task with fewer resources.

            **Performance test results compilation**

            All tests are on my system: i7-4790K @ 4GHz, 32GB DDR3 @1333MHz, RTX2080

            **Small vessel test:**

            50 fps -> 78 fps

            **200 part test:**

            18 fps, 55.95ms/frame -> 24fps, 41.49ms/frame

            **1500 part test**

            638 ms/frame -> 347 ms/frame
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1282671742514495559/1336378173251911790/image.png?ex=67be9d69&is=67bd4be9&hm=51600660406d19fc64404955ee8c0ae07bbf727c3cde848134dfc5c32f645de5&", "small-vessel-redux.png", "Small vessel test Redux"),
            Media("https://cdn.discordapp.com/attachments/1282671742514495559/1336376068269019206/image.png?ex=67be9b73&is=67bd49f3&hm=57822051694cf5cc303145e0c0630fcc5e208ba42ba40f39e6798b1153aa6904&", "small-vessel-stock.png", "Small vessel test stock"),
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1344028284417216614/image.png?ex=69ed15e1&is=69ebc461&hm=b1e5fba5241381455f15f4929517f3a23413e267267b6e81a0e9db898a0b73d9&", "200-part-test-1.png", "200 part test 1"),
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1344028285167865976/image.png?ex=69ed15e2&is=69ebc462&hm=c46fb16af798703e9ce2235e61e394faf3917f66277e9249abf0d90e0e1047c0&", "200-part-test-2.png", "200 part test 2"),
            Media("https://cdn.discordapp.com/attachments/1039965578754007060/1337328441917444096/image.png?ex=67bec6aa&is=67bd752a&hm=0e8e56610c55d3f5d24087be70db12d0633ee0ffddb827e13c7c01a51080ae06&", "1500-part-test-1.png", "1500 part test 1"),
            Media("https://cdn.discordapp.com/attachments/1039965578754007060/1337332794132533248/image.png?ex=67becab8&is=67bd7938&hm=800a3d25e9fc26ac1838922701fa22c95337dea01ebb49850e4aa36d6aa773d7&", "1500-part-test-2.png", "1500 part test 2"),
        ],
    ),
    Post(
        slug="debug-tools-update",
        title="Debug Tools Update",
        date="2025-02-26",
        author="Safarte",
        body=md(
            """
            **Update: Debug Tools**

            - Added new "Vessel Tools" window with various helpful features included (thermal, mass & maneuver node data; flight axes & SAS display; joints manipulation; buoyancy indicators; and others)
            - Added transparency to all existing windows

            We will be trying to send similar changelogs as we work on the project to keep you updated.
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1344427876409282651/image.png?ex=69ec8fc7&is=69eb3e47&hm=c8603bd62dd9df36cdf5502a46ae180e86cb3e80c643ca9bd0ea51bb2bda7f7b&", "debug-tools-initial.png", "Debug tools window"),
        ],
    ),
    Post(
        slug="debug-tools-follow-up",
        title="Debug Tools Follow-Up",
        date="2025-03-03",
        author="Safarte",
        body=md(
            """
            **Update: Debug Tools**

            - Added "Vessel Coordinates" window with various info about the current position to the "Vessel Tools" stats windows.
            - Added a "Kerbal Roster Tools" window with ability to edit the roster, add and delete Kerbals.
            - Added an "Experiment Reports" section to the "Vessel Science" window with ability to create and submit reports.
            - Added a "Teleport Bookmarks" window with the ability to create bookmarks in multiple "Bookmarks Lists" from the vessel's current position. Comes with a built-in list of bookmarks to help debugging.

            With this, all the debug windows I wanted to get done before the first release should be complete.
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1346192466621239439/image.png?ex=69ed0c6f&is=69ebbaef&hm=cb7f87f23e68f623e47f7e26b0baea1b48c569c5313e8ecfeb4876732098c5b2&", "debug-tools-expanded.png", "Expanded debug tools"),
        ],
    ),
    Post(
        slug="trailer-footage-clarification",
        title="Trailer Footage Clarification",
        date="2025-03-01",
        author="NexusHelium",
        body=md(
            """
            Hey all, NexusHelium here (the editor of the trailer)!

            A lot of people have (rightfully so) noticed that a good chunk of the footage is noticeably lagging. This was due to issues with the editing software, so I decided to make a video with the raw footage showing the real FPS for those various shots. We also wanted to correct an honest mistake that one of our team members made, stating that the footage was not shot in Redux - it was an assumption he made based on the last communication between us, before I recorded these specific clips.

            All of these shots except for the reentry visuals (which were done as a separate mod prior to becoming part of Redux) are recorded in KSP2 Redux.

            Here it is: https://www.youtube.com/watch?v=LNW0zmNv_7I
            """
        ),
    ),
    Post(
        slug="performance-little-things",
        title="Performance - How the Little Things Add Up",
        date="2025-03-16",
        author="foonix",
        body=md(
            """
            **Redux Update: Performance -- How the little things add up**

            Unfortunately this post came out way too long for a discord message. So check it out on the forums:

            https://forum.kerbalspaceprogram.com/topic/226985-ksp2-redux/?do=findComment&comment=4450060

            TL;DR: Reduced time per frame by another %12 in the 2500 background parts test.
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1350978107384795256/gJ5yuWv.png?ex=69eca928&is=69eb57a8&hm=aa8169b6c87dc5733f9d9b3a21850e7c322df26c4f32858ef71112b6a89ae34e&", "background-parts-chart-1.png", "Background parts chart 1"),
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1350978107661746338/qKgHJKJ.png?ex=69eca928&is=69eb57a8&hm=051fc482bde51b6341b26a6acb310a405e7af9d0eb812062443873637fb7509e&", "background-parts-chart-2.png", "Background parts chart 2"),
        ],
    ),
    Post(
        slug="contributor-call-update",
        title="Community Update: Contributing to Redux",
        date="2025-03-31",
        author="Safarte",
        body=md(
            """
            Hi! We are starting to think about how to integrate people who want to contribute to Redux into our processes. Right now we mainly think that external contributions would be best suited for asset development (parts design, model and textures, sound, animations, ...) and possibly QA in the future. If you have experience working on this kind of stuff and would like to contribute to Redux, send me a DM or ping me in https://discord.com/channels/1078696971088433153/1340177797196414996. This message also extends to modders who would like to be guided through migrating their mods to Redux when we get closer to release. People familiar with UI design and Unity UITK are welcome too.
            """
        ),
    ),
    Post(
        slug="redux-dating-sim",
        title="Redux Dating Sim",
        date="2025-04-01",
        author="munix",
        body=md(
            """
            https://tinyurl.com/redux-dating-sim
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1356573290038169640/dating-sim.png?ex=69ec94d4&is=69eb4354&hm=b11decfd36afbce1f121227bd06a163d37d532066086da2295a2c37ab157a77d&", "dating-sim.png", "Redux dating sim"),
        ],
    ),
    Post(
        slug="sunflares-update",
        title="Graphics Update: Dynamic Sunflares",
        date="2025-04-10",
        author="dan",
        body=md(
            """
            **Redux Update: Sunflares**

            Hello! I'm dan, one of the developers on KSP2 Redux. You might know me as the guy who made some KSP1 & 2 mods (mostly relating to graphics).

            One of the things mentioned in the Redux Trailer were improved graphics, and I'm here to share a nice change I've done to the sunflare.

            **Sunflare Colors**

            I've changed it so that flare elements use the color of *LocalSpace_Light_Kerbol* (the light source for Kerbol in flight view). This means you get a white sunflare in space, a blue sunflare on Duna (on sunset/sunrise of course), and etc. While it's a small change, it does add a lot to the cinematic experience!
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1359953113343070470/DunaSunset.png?ex=69ed0308&is=69ebb188&hm=af766766de5d10fcaab241ed30811d5067b59684ba762689756a59bdbcc47998&", "duna-sunset.png", "Duna sunset"),
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1359953113787928576/KerbolSpaceFlare.png?ex=69ed0309&is=69ebb189&hm=d576ba89375d42cc9e6a73bda83876d282fbf6a82d1e09083382ecb92c57ed8c&", "kerbol-space-flare.png", "Kerbol space flare"),
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1359953114194772141/KerbinSunrise.png?ex=69ed0309&is=69ebb189&hm=74355a626de6d0cbfb2f0f73343fc76d1e5b5c053ae0a5857b4d1fd1a0f217dc&", "kerbin-sunrise.png", "Kerbin sunrise"),
        ],
    ),
    Post(
        slug="resource-extraction-preview",
        title="Resource Extraction System Preview",
        date="2025-04-23",
        author="Safarte",
        body=md(
            """
            ### Small teaser: preliminary exploration of resource extraction system

            Redux developers have been exploring some implementation ideas for the resource extraction system in KSP2. Here are videos of a drill and a resource indicator UI (everything very WIP).

            We have been brainstorming ideas on how the resource system should work, where in the complexity - usability scale we should be and other ideas.

            We will try to keep you updated as continue fleshing out those ideas.
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1364662738520903720/xDHNaBaCEY_1.mp4?ex=69ed01b7&is=69ebb037&hm=5ecd71d42685b69c399bd0af0e1a73b00b9b9323a5ab91fe0c00d01fa49fc646&", "drill-preview.mp4", "Drill preview"),
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1364662739116757072/megiKJWeI5_1.mp4?ex=69ed01b7&is=69ebb037&hm=327c8afa30f93f9f440a6994cda652757ecf45a3538be9bf0afc22f02cbd8bbf&", "resource-indicator-preview.mp4", "Resource indicator preview"),
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1364662740014202930/image.png?ex=69ed01b7&is=69ebb037&hm=c832e2be377ddd28d553c2eb7166d371f8f211e758c38a00ea1bc4e8e6e182c5&", "resource-extraction-ui.png", "Resource extraction UI"),
        ],
    ),
    Post(
        slug="resource-scanning-wip",
        title="Resource Scanning System - Work in Progress",
        date="2025-05-03",
        author="munix",
        body=md(
            """
            **Resource scanning - work in progress**

            Here's another quick look at the latest version of the resource scanning system for a future Redux version.

            As you can see in the video, the system is designed in such a way where you may need specialized scanner parts to be able to find certain resources, and so in this showcase, only two (or one in the second clip) out of the three available resources are revealed.
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1368337052491452606/reduxscanningtest_2.mp4?ex=69ed30af&is=69ebdf2f&hm=d0e54f173f91cd8ab16f1a26d75d85fbb37ea929c56c199a31dc017afedb9ada&", "resource-scanning.mp4", "Resource scanning preview"),
        ],
    ),
    Post(
        slug="modding-tools-unity-editor",
        title="Modding SDK: Unity Editor Integration",
        date="2025-05-14",
        author="Safarte",
        body=md(
            """
            **Redux Update: Modding tools - Unity Editor**

            Recently efforts have been made in the "modding support" side of Redux, today I want to share with you a breakthrough that will make modding the game a much smoother process.

            Using Redux's modding SDK, which will be partly based on the KSP2 Unity Tools package, in conjunction with PassivePicasso's ThunderKit you will be able to test your mods by running KSP2 Redux directly in the Unity editor!

            This allows you to:

            - Very quickly iterate, with changes being able to be tested in a matter of seconds, not minutes.
            - View what's happening in-game in real time using the Scene view.
            - Access the full suite of Unity Editor tools, including for example custom inspectors for Unity and KSP2 components.
            - Use built-in Unity C# debugging tools and any other Unity package library.

            On a technical note, we are still figuring out stuff like Harmony which does not really work in the editor (but will work fine in the compiled mods), we'll keep you updated if we make progress on this front. For simplicity, we will also want the modding API to provide as many endpoints as possible that allow you to mod the game without the use of Harmony.
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1372288952731701278/image.png?ex=69ed10ae&is=69ebbf2e&hm=24ed5e09cfa098fb51317c9a6b5a73595b950ef4b590ea54d0e910ab917df85e&", "unity-editor-1.png", "Unity editor integration 1"),
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1372288953230819400/image.png?ex=69ed10ae&is=69ebbf2e&hm=79eaab6fbfcbea1db77cb20d4f2c0892038696c68b84f1a44785fbdeecaa7d72&", "unity-editor-2.png", "Unity editor integration 2"),
        ],
    ),
    Post(
        slug="roadmap",
        title="KSP2 Redux Roadmap",
        date="2025-05-23",
        author="munix",
        body=md(
            """
            # KSP2 Redux Roadmap

            ## Stage 0: Foundation

            > *“We choose to go to space, not because it is easy, but because we thought it would be easy.”*

            The “0 Days Since Last Accident” sign at KSC once again resets to zero. After too many rapid unscheduled disassemblies, the Kerbals decide it’s time to look under the hood and start making rockets that don’t explode… that much.

            The initial series of Redux releases will be focusing on building a solid foundation for the game going forward.

            **Performance & Fixes**

            * Optimizations of existing game systems and graphics settings to increase performance
            * Fixes for various game bugs and inconsistencies, big and small
            * Start of a larger effort to convert the game’s core simulation code to make use of Unity’s **[DOTS](https://unity.com/dots)** systems with potential for massive performance gains, scaling with vessel sizes and counts

            **Vessel ISRU**

            * Small-scale preview of the larger resource management system, similar to KSP1’s ISRU
            * Vessel parts for scanning, gathering and processing resources necessary for basic refueling operations
            * Production of Hydrogen, Methane, Oxygen and Monopropellant depending on the given location’s available raw resources

            **Heat Management**

            * Heat generation and dissipation system for vessel parts, e.g. reactors and drills will generate heat and radiators will remove it
            * Introduction of radiator parts

            **Tech Tree Updates**

            * New types of requirements for unlocking a tech tree node in addition to science points
            * Mission unlocks will require the player to complete a specific mission before a tech node can be unlocked
            * Science experiment unlocks will require the completion of a specific experiment, sometimes in a specific location or biome, in order to meet the requirements of a tech node

            **Modding SDK**

            * Improved modding experience fully integrated into the Unity Editor
            * Possibility to run the game and test mods directly in Unity’s play mode
            * Multiple mods sharing a single Unity project in order to decrease the total disk space taken

            ## Stage 1: Colonies & Resources

            > *“I came, I saw, I built a colony… and then I ran out of coffee!”*

            Kerbal scientists just had an epiphany! While “MOAR BOOSTERS” is always a viable and well-respected strategy, their latest coffee-stained blueprint (and yet another failed attempt at an Eve mission) sparked a wild idea. What if they could build the return vehicle directly on Eve? Just make sure Jeb doesn’t lick the purple rocks again.

            This stage of Redux development will be dedicated to implementing the core gameplay elements of colonies and the full resource system, as well as a brand-new game mode. As this is such a complex undertaking, this stage will be split roughly into 3 parts.

            ### Stage 1.1*

            **Planetary Colonies**

            * Introduction of surface-based colony parts, including resource gathering facilities and factories
            * System for founding and building colonies (using the Building Assembly Editor)
            * New raw resources and building materials
            * Colony-based vessel factories and launch pads

            **Frontier Mode**

            * Initial limited-scale preview of a new game mode based on resource management
            * All parts cost an amount of building materials which the player has to create by processing raw resources gathered at their colonies
            * KSC has unlimited amounts of basic building resources and fuels, but colonies and more exotic resources are required to build more advanced vessel and colony parts
            * More details in the FAQ below

            **Colony Management UI**

            * Basic UI for tracking the flow rates of all of the colony’s resources, electric charge (generation and consumption), and heat (generation and dissipation)

            ### Stage 1.2*

            **Orbital Colonies**

            * New parts and systems for orbital colonies
            * On-orbit vessel construction using orbital colonies as shipyards
            * In-depth planning tools for EC generation and consumption

            **Exploration Updates**

            * Implementation of a new resource unlocking system for Exploration Mode, distinct from the Frontier Mode
            * Resources are not continuously mined and used up, instead, once the requirements for the use of a resource are met (e.g. through a dedicated mining facility, a mission, etc.), that resource is then fully unlocked at that specific colony
            * Orbital colonies serve a special purpose in Exploration Mode - as long as any two celestial bodies both have an active colony in orbit, they will also share all their unlocked resources, allowing the creation of an interconnected network of colonies to make all unlocked resources available everywhere
            * More details in the FAQ below

            ### Stage 1.3

            **Supply Routes**

            * Frontier Mode feature that will allow the player to utilize colony spaceports to create automated resource and material supply routes between their various colonies
            * Flying a mission from one colony (or KSC) to another will give the player an option to record the flight as a supply route, periodically transferring the amount of resources that the vessel was carrying from the origin point to the destination, while subtracting the material costs of the supply vessel from the origin colony

            **Environmental Heat System**

            * Environments will start playing a role in the heat generation and dissipation system, introducing a new type of challenge for colony placement and management
            * For example, colonies might use water sources as coolant, and on the other hand, they will have to dissipate enough heat to compensate for being placed in e.g. a lava river biome
            * In-depth planning tools for heat generation and dissipation

            **New Content**

            * Advanced engines that are well suited for hauling large quantities of resources across the Kerbol system
            * New missions and science experiments related to colonies
            * Additional content to be detailed later

            \\* These stages may very well end up happening in the reverse order

            ## Stage 2: Interstellar

            > *“To infinity… and probably a crash landing!”*

            As the Kerbal civilization expands all across the Kerbol system, from the fiery pits of Moho to the freezing far reaches of the outer planets, new resources and scientific discoveries finally enable the Kerbals to travel to the stars. Excited, they blast off for distant systems - but what is this? Oh boy, it’s going to be a long ride when Bob packed only decaf for the trip!

            The next iteration of Redux updates focuses on travelling beyond the Kerbol system using all-new interstellar-scale parts.

            **Debdeb System**

            * New star system, the closest one to Kerbol
            * Planets and moons which present new challenges
            * Exotic resources and new building materials allowing the creation of even more advanced vessels and colonies
            * New missions and science experiments related to the new star system

            **Interstellar Parts**

            * Massive parts for constructing vessels for interstellar travel
            * Advanced far future types of propulsion enabling travel speeds at significant fractions of speed of light

            ## Stage 3: Multiplayer

            > *"All for one, and one for all… unless we’re fighting over the last donut!"*

            One Kerbal crashing is fun, but a whole squad fighting over who gets to press the big red launch button? That’s what we call Kerbal mayhem! Teaming up to build rockets, or “accidentally” nuking each other’s bases, the Kerbals are buzzing with caffeine and chaos. Multiplayer makes the galaxy feel much less empty.

            **Multiplayer Support**

            * Multiple players can share an agency, working together towards common goals and shared progress as they explore the galaxy
            * Agencies can work together or compete to see which team win the next space race
            * Interact with other players in real time, launch your rockets at the same time from multiple launch pads and race to orbit, or sabotage your enemies’ colonies to get ahead in the competition

            **New Star System**

            * Using the newly acquired exotic materials from the Debdeb system, players can venture out further into the unknown, discovering even more distant stars

            **Story Conclusion**

            * The main story campaign comes to its conclusion

            ## FAQ

            ### Is the roadmap final?

            This roadmap of development stages only serves as a rough outline, and as we progress through the goals and gather player feedback, it’s very likely that some design decisions will change, or we will discover that some of our ideas are not technically viable/worth the extra effort and so on, so please, take this with a grain of salt. Especially with the stages that are further out, a lot of the design is still up in the air, so don’t be surprised if some features get added, reworked, or removed as we get closer to each stage.

            ### What’s the difference between the Exploration and Frontier modes?

            You can think of them as the respective spiritual successors to KSP’s Science and Career modes.

            In Frontier mode, all vessel and colony parts cost some amount of materials, which you must have stockpiled in order to be able to build the part. In order to get there, you will need to build mining facilities to extract raw resources and factories to process them into materials or fuels. The rates of resource gathering and processing can vary based on factors such as local resource density, colony happiness, etc. (these factors are just examples, subject to change). To found and grow a new colony, you will need to ship resources from Kerbin or other existing colonies, eventually leading up to the ability to create automated supply routes.

            Exploration mode also has resource gameplay, but rather than having to manage resource and material production rates, supply missions, etc., the colonies and resources are more so an additional means for exploration and rocket building. Once you set up a colony in a new location and meet the requirements for the specific resource (e.g. by building a colony facility, running an experiment or completing a mission), that resource will then be “unlocked”. When building vessels and colonies, all the resources needed for a specific part will need to be unlocked, and then you can build as many of them as you like without any limits. Colonies will be linked together through orbital colonies, which will provide the unlocked resource to all other celestial bodies with an orbital colony. No need to deal with resource rates, quantities, supply missions, and so on.

            ### What about new missions, science experiments, parts, …?

            Even when not explicitly specified, we will be adding some content throughout *all* the stages. That means things like new missions, new tech tree nodes, new parts, new colony facilities, new resources and materials, new science experiments, and so on.

            ### When will XYZ be released?

            To answer one of the most frequently asked questions very directly - sadly, we cannot give you any estimates of how long each of these stages will take. This is a volunteer project which people work on in their free time, and so we have no idea how long a specific feature might take to finish, and the last thing we want to do is adding the pressure of setting deadlines for the team, or setting false expectations for you, the players. Please, be patient.

            ### How can I contribute?

            We are reaching a point in the development where we will soon need to start working on a lot of 3D models, textures, celestial bodies, etc. If you are an artist with some experience in these areas, we would greatly appreciate your contributions to the project. You can reach out to us in [#🟡redux-chat](https://discord.com/channels/1078696971088433153/1340177797196414996) or send a DM to our Art Lead Safarte.
            """
        ),
    ),
    Post(
        slug="volunteer-developers-call",
        title="Redux Is Looking for Volunteer Developers",
        date="2025-06-18",
        author="Safarte",
        body=md(
            """
            # Redux is looking for volunteer developers!

            In order to achieve the goals previously shown in our roadmap, we are looking for active volunteer developers interested in joining the team! Ideally, we are looking for applicants with experience in one or more of the following:

            - KSP1/KSP2 code mod development
            - Graphics programming: HLSL, Unity Shader Graph, ShaderLab
            - Unity development
            - C# programming

            If you're willing to join the project and would love to contribute to finishing what was promised for KSP2, please send proof of experience in one of the mentioned fields to munix or Safarte by DM. This can be your Github page, a mod's page, info about a game you worked on or anything similar.

            **Note:** please provide some proof that you own the KSP2 game as well. This is a hard requirement for working on the project as a developer.
            """
        ),
    ),
    Post(
        slug="ui-improvements",
        title="UI Improvements",
        date="2025-06-18",
        author="munix",
        body=md(
            """
            # UI Improvements

            Hey everyone, we've been working on some UI improvements for our first release, and wanted to give you a little preview. Make sure to watch the video to the end! Below are some screenshots of other small improvements that didn't make it into the video.

            https://youtu.be/lZ9rvqisYKE
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1384996675059191828/Still_2025-06-18_223116_2.10.1.png?ex=69ed272b&is=69ebd5ab&hm=ecaebcf8255fb8e59e1a14ca947d1225be96a553522e442685f1077889e38283&", "ui-improvements-1.png", "UI improvements 1"),
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1384996676175003781/Still_2025-06-18_223116_2.11.1.png?ex=69ed272b&is=69ebd5ab&hm=2bb0948bad160eb062876e446f3cee36a4e612b8f9859d91551df627343c0562&", "ui-improvements-2.png", "UI improvements 2"),
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1384996677366055092/Still_2025-06-18_223116_2.12.1.png?ex=69ed272b&is=69ebd5ab&hm=8b87babdbdf1acb17d7e19a7ddec5c3d6c3a74d622734d55219c425b9221b042&", "ui-improvements-3.png", "UI improvements 3"),
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1384996678456705085/Still_2025-06-18_223116_2.13.1.png?ex=69ed272c&is=69ebd5ac&hm=1c07976bad2e07b85e6e4f5dece24b281e5ec79b7dcf0878cb2b33db873af9a5&", "ui-improvements-4.png", "UI improvements 4"),
        ],
    ),
    Post(
        slug="tech-tree-features",
        title="Tech Tree Features",
        date="2025-07-03",
        author="munix",
        body=md(
            """
            # Tech Tree Features

            One of the new features that will be introduced in the initial release of Redux are new tech tree requirements. Tech tree nodes now can have multiple new requirements that have to be met before the node can be researched: **missions** and **science experiments**.

            In the showcase video, you can see that the nodes with these extra unlock requirements are marked with a small lock icon in the bottom right corner, and when you select them, you will see the requirements listed in the details panel on the left.

            Once all the requirements of such a node are met, you will receive a notification that the node is now available for research, and you can proceed to unlock it as usual (that is, if you have enough science points).

            *Note that the video is only illustrative and the actual nodes with special requirements will be different in the release. Currently, we are planning to have missions gating the progress between the tech tree tiers.*
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1390470343243595836/tech-tree-requirements.mp4?ex=69eca1ab&is=69eb502b&hm=1de80884ddbeb419bbe940168850d00ea57ff0fe1a4a52f566d086912822bd38&", "tech-tree-requirements.mp4", "Tech tree requirements"),
        ],
    ),
    Post(
        slug="volunteer-translators-call",
        title="Redux Is Looking for Volunteer Translators",
        date="2025-07-09",
        author="Safarte",
        body=md(
            """
            # Redux is looking for volunteer translators!

            If you are comfortable in English, fluent in one of the languages listed below, and would like to contribute to KSP2 Redux, this is your lucky day! We are looking for translators to contribute to the project by providing translations of various game elements.

            Languages: French, German, Italian, Spanish, Japanese, Korean, Polish, Russian, Portuguese (Brazil), Chinese (Simplified), Chinese (Traditional).

            If you are interested please contact me on Discord.
            """
        ),
    ),
    Post(
        slug="rud-troubleshooting-repost",
        title="RUD Troubleshooting Repost",
        date="2025-08-15",
        author="foonix",
        body=md(
            """
            I've been crashing this thing repeatedly to troubleshoot bad stuff that happens during RUD.

            It's still chonkier than I'd like, but most of the errors are fixed and the UI is more well behaved.

            https://vimeo.com/1109589044/33016522c0

            For comparison, here's stock 0.2.2 in the same test on the same hardware: https://vimeo.com/1109586222/9a95fb1e01

            (I really shoulda put this here, so reposting)
            """
        ),
    ),
    Post(
        slug="optimized-ruds",
        title="Optimized RUDs",
        date="2025-08-20",
        author="NexusHelium",
        body=md(
            """
            # Optimized RUDs

            Sorry this took so long to get to everyone!! Just for conveniences sake, here is a side-by-side comparison of our two clips showing off the performance improvements to the various explosions you will encounter in this game uploaded on our official channel!

            https://www.youtube.com/watch?v=czksGn9RC6E
            """
        ),
    ),
    Post(
        slug="installer-launcher-preview",
        title="Installer and Launcher Preview",
        date="2025-09-11",
        author="Samalandaa",
        body=md(
            """
            One of the big ticket items left to complete before we release the first update is the installer/launcher! We want to make the setup process as straightforward as possible and this is a big part of achieving that - don't worry, you'll still be able to launch the game from your regular methods for opening KSP2 once you've patched Redux in. Here's an in-progress screenshot PassivePicasso took recently to give a rough idea of what to expect from it, though things are of course subject to some change:
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1415683607384559718/image.png?ex=69ecbb1a&is=69eb699a&hm=610ba30f4a2a32e5b3c14a740e6e96266696244c58240e7002a82d7090ea322e&", "installer-launcher-preview.png", "Installer and launcher preview"),
        ],
    ),
    Post(
        slug="background-part-modules-performance",
        title="Improving Performance of Background Part Modules",
        date="2025-09-21",
        author="foonix",
        body=md(
            """
            **Improving performance of background part modules.**

            Some of you may remember the infamous "2500 background parts" test thread from the forum.

            If you're not familiar, it was a test using 10x250 part vessels in the background, and a single capsule in the foreground.

            https://forum.kerbalspaceprogram.com/topic/219210-ksp2-is-calculating-the-physics-of-all-parts-of-all-crafts-whether-they-are-rendered-or-not-reducing-performance-of-all-scenes-at-all-times/

            So far, Redux has incidentally made some small improvements on that test. The development branch is about %15-20 faster than stock, mostly due to general improvements in spatial calculations and flow request processing.

            However, I hadn't really tried to tackle the elephant in the room, which is just the shear amount of parts. Even tiny amounts of overhead for each part really adds up when we're talking about multiple thousands of them. One save a player shared with me had organically hit 560 parts even while keeping per-vessel part count low, so it's not really far fetched that real players could hit 1000+ parts.

            So I took a look back at the 2500 parts test, and was able get another ~%10 more fps with a couple of relatively simple changes. (51.4ms -> 46.2ms)

            - Reworked the part module update code to make modules have to subscribe to get updates. Skip ones that don't subscribe, and implement subscription for ones that do.
            - Moved some engine status display updates from background to foreground only.
            - Moved Module_LitPart checking if the lights should be on/off to foreground only. (Note, this is different from `Module_Light`. It just checks if the vessel should look like it's had a power failure or not.)
            - Simplified some getter logic commonly used by modules.

            All in, Redux runs the test about %30 faster on my machine. Stock KSP2 vs this branch: 16fps -> 21fps

            Left/Blue is Redux development branch. Right/orange is this change set. Comparison over 384 frames.
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1419354563936391269/image.png?ex=69ece6f2&is=69eb9572&hm=5e5781e0b5bacb20a1f0d8e064f7d432670b492114cef4cf201dea1bea545d76&", "background-part-modules-1.png", "Background part modules 1"),
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1419354564364075209/image.png?ex=69ece6f2&is=69eb9572&hm=6d01c50995d779e7a20a86f7f7aa15be500d35e06285aaa9aca468cdb209f77e&", "background-part-modules-2.png", "Background part modules 2"),
        ],
    ),
    Post(
        slug="release-delay-update",
        title="Release Delay Update",
        date="2025-09-21",
        author="NexusHelium",
        body=md(
            """
            Hey everyone!

            Just wanted to drop a quick update on where we’re at with KSP2 Redux. We were originally shooting to get the first update out this summer, but unfortunately real life had other plans. Since this is all volunteer work, a lot of our team has had to focus on more important stuff outside of the project, which slowed things down more than we expected or wanted.

            On top of that, the update itself kind of exploded in size. What was supposed to be a smaller “starter” release has turned into something way bigger, with a bunch of features we didn’t think we’d be tackling until way later.

            We know delays aren’t ever seen as a good sign, and we totally get if it’s frustrating (trust us, coming from KSP2, we really get it). While we can’t say for certain when we’ll get this mod out to you guys, we’re still hoping to get it into your hands before the end of the year, so keep an eye out for updates regarding that!

            Thanks for hanging in there with us. We can’t wait to share what’s coming!

            - Rendezvous: The KSP2 Redux Team
            """
        ),
    ),
    Post(
        slug="status-update-unity-issues",
        title="Status Update",
        date="2025-11-08",
        author="munix",
        body=md(
            """
            # Status update

            ## Unity issues

            First of all, let me apologize for the lack of news in the past month and a half. We have been struggling hard with various Unity issues plaguing several of the developers, and they irritatingly always affect each just one person and no one can ash figure out why, and the obvious solutions like reimporting files, setting up a fresh copy of the project or even reinstalling Unity just don't help. (More details: https://discord.com/channels/1078696971088433153/1340177797196414996/1422618937430118500)

            ## ISRU is cut

            In order to get something to you as soon as we can, we have made the decision to cut ISRU out of the initial 0.2.3 release, as it was the biggest blocker for the release - one of the main ISRU developers is one of the people affected by those Unity issues. That should give us some time to hopefully resolve these issues and polish it enough for a later release (which was originally the plan anyway, before we decided to roll all of the Foundation stage into a single release).

            ## Release date

            Back in June, when we teased the "Summer 2025" release, it seemed very likely that we'd have the release ready by the end of July, or by the end of August in the worst case. That obviously turned out to be wrong, and a large part of that was the fact that we gave ourselves this arbitrary deadline. It caused a lot of stress, overworking ourselves, and inevitably, burnout, which lead to a large part of the dev team stepping back from the project. I take personal responsibility for this, as I was was the one pushing for the internal July deadline and the public announcement of a summer release date, thinking it was a good idea and would motivate us to finish faster.

            For that reason, we can't give you an updated release date because as we've learned the hard way, progress is extremely unpredictable and putting pressure on people working for no compensation in their free time just makes this passion project into a very bad unpaid job. So, I'd like to ask you to keep that in mind and give these volunteers the space to do their thing out of the love for the game and the community, and not because they feel under pressure.

            PS: Just to give you some sense of the progress of the release, here's a little peek at our internal task tracker - we're sitting at 118/125 done, and most of the game code changes are finished.
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1436769765913002206/image.png?ex=69ecfa1e&is=69eba89e&hm=47cc21a82ceb7c459d9f4ea925b4ca12ecb260e3112a0f1a45098e25b21f0071&", "status-update-task-tracker.webp", "Status update task tracker"),
        ],
    ),
    Post(
        slug="beta-1",
        title="v0.2.3 Beta 1",
        date="2025-11-30",
        author="munix",
        body=md(
            """
            # v0.2.3 Beta 1

            Hello everyone, after a quick round of closed testing and fixing a couple more bugs, we decided to let the floodgates open and give access to the newest beta build to everyone. *Please*, carefully read the linked post before downloading and/or asking questions, just in case it's already been answered there.

            Keep in mind that this is intended for testing and catching any other last minute bugs before the actual first release.

            ## Download

            Instructions and download are available here: https://discord.com/channels/1078696971088433153/1444156522127954064
            """
        ),
    ),
    Post(
        slug="beta-2",
        title="v0.2.3 Beta 2",
        date="2025-12-06",
        author="munix",
        body=md(
            """
            # v0.2.3 Beta 2

            We have just released the second prerelease of Redux v0.2.3: https://discord.com/channels/1078696971088433153/1444156522127954064/1446963570389553365
            """
        ),
    ),
    Post(
        slug="public-bug-tracker",
        title="Public Bug Tracker",
        date="2025-12-18",
        author="munix",
        body=md(
            """
            ## Public bug tracker

            Just a tiny update - in-game bug reports are now sent to both our internal bug tracker as well as to our GitHub: https://github.com/KSP2Redux/Redux/issues

            You can go there to see progress on bug reports you submitted or comment on issues, as well as use it to report new issues if necessary (e.g. the game doesn't even launch, or it doesn't load). In any other case where you can access the in-game bug tracker (`Esc -> Report Redux Bug` or `Ctrl+B`), it is always preferable to use it.
            """
        ),
    ),
    Post(
        slug="installation-guide-video",
        title="Installation Guide",
        date="2025-12-22",
        author="munix",
        body=md(
            """
            ## Installation guide

            Since there have been a couple of questions about how to install the beta of Redux, I put together a little video guide:

            https://youtu.be/_73j6XiAKZM
            """
        ),
    ),
    Post(
        slug="beta-3",
        title="v0.2.3 Beta 3",
        date="2025-12-24",
        author="munix",
        body=md(
            """
            ## v0.2.3 Beta 3

            The third prerelease beta of Redux v0.2.3 has been released. You can find the download and changelog here: https://discord.com/channels/1078696971088433153/1444156522127954064/1453199730673844294
            """
        ),
    ),
    Post(
        slug="beta-3-maneuver-node-issue",
        title="Beta 3 Maneuver Node Issue",
        date="2025-12-24",
        author="munix",
        body=md(
            """
            There is an issue in this build with maneuver nodes (they cannot be moved around on the orbital line), we will try to hotfix this tomorrow and release a new build. If you don't want to reinstall Redux twice in a row, please wait for the new build.
            """
        ),
    ),
    Post(
        slug="beta-3-hotfix-1",
        title="v0.2.3 Beta 3 Hotfix 1",
        date="2025-12-24",
        author="munix",
        body=md(
            """
            ## v0.2.3 Beta 3 Hotfix 1

            The hotfix for a couple of issues in the Beta 3 has been released. You can find the download and changelog here: https://discord.com/channels/1078696971088433153/1444156522127954064/1453368281535742035
            """
        ),
    ),
    Post(
        slug="unity-6-3-upgrade",
        title="KSP2 Redux Dev Blog 16 (?): Unity 6.3",
        date="2026-01-06",
        author="munix",
        body=md(
            """
            ## KSP2 Redux Dev Blog 16 (?): Unity 6.3

            > When did we stop numbering these dev posts?

            Hello everyone! It's been a minute since the last dev update, as we've been busy with our beta releases, fixing bugs, adding more features, etc. However, this new development is a pretty big deal for us, so I thought we might share a bit of info.

            We've just managed to upgrade KSP2 from Unity 2022.3.5 all the way to the lastest stable Unity 6.3 version (6000.3.2). This means we will have access to all the latest editor tools, Unity bug fixes, new APIs, etc. It will be a huge help to us in continuing to rewrite and update the game's UI using the newer UI Toolkit library (like you could see in the Color Manager and orbital info panel), as well as in converting the game's simulation code to [Unity's DOTS](https://unity.com/dots).

            I first started working on this experiment a couple of weeks ago, but hit a wall that I wasn't sure we could overcome. We previously thought that this would be a massive undertaking that would require us to rewrite many of the game's shaders from scratch, as we don't have access to their sources and the binary serialization layout for the files which (usually) contain the built shaders changes between every version, meaning we couldn't just take the existing built assets files and reuse them in a new Unity version.

            However, thanks to the amazing work that [PassivePicasso](https://github.com/PassivePicasso) and foonix had done on the [BundleKit](https://github.com/foonix/BundleKit) package, we were able to convert those .assets/.assets.resS files into regular asset bundles, which Unity 6.3 can load, and after some work in the Unity internals to redirect shader and other asset loading from those files into our new bundle, as well as modifications to the core TextMeshPro package in order to fix many font bugs that we were faced with (shoutout to cheese_queen for the work on that and more), we now have a 99% functioning build of KSP2 Redux in Unity 6.3! This also means that we will be able to continuously upgrade to new Unity versions as they come out and leverage all the new improvements and technologies that come with them (such as the massive move from Mono to the incomparably faster and more stable .NET that will possibly arrive with Unity 6.7 later this year), which is a huge win for Redux.

            This also means that modders will be able to take advantage of all the new Unity improvements when building their mods. The modding SDK and template will be updated soon to bring support for it, and you can expect a new beta build in the near future to help us test this experimental version of the game.
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1458199571443482727/image.png?ex=69ed27ad&is=69ebd62d&hm=29a1ea9d1a3f4cf2b108da2a5ddf60c1088eaae9b7fb5680efbd7ed452a1c2a2&", "unity-6-3.png", "Unity 6.3 upgrade"),
        ],
    ),
    Post(
        slug="trailer-100k-views",
        title="First Trailer Hits 100k Views",
        date="2026-02-22",
        author="NexusHelium",
        body=md(
            """
            1 year later and the first trailer has 100k views. It’s nice to see that people care about Redux and KSP2 as a concept. Here’s to a great 2026 and… another… 100k views…? (I was going somewhere with that I swear). Thanks for all your support!
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1474931613648420874/IMG_6817.png?ex=69ecb8db&is=69eb675b&hm=f4690e6936011cf135fd35ea739b9dea848d2b7e76f38704d575553b8a5c5b8a&", "trailer-100k-views.png", "First trailer 100k views"),
        ],
    ),
    Post(
        slug="beta-4",
        title="v0.2.3 Beta 4",
        date="2026-02-27",
        author="munix",
        body=md(
            """
            ## v0.2.3 Beta 4

            The fourth prerelease beta of Redux v0.2.3 has been released. You can find the download and changelog on [GitHub](https://github.com/KSP2Redux/Redux/releases/tag/v0.2.3.0-beta%2B27d5a5ff) or here on Discord: https://discord.com/channels/1078696971088433153/1444156522127954064/1477020790003339479
            """
        ),
    ),
    Post(
        slug="beta-4-hotfix-1",
        title="v0.2.3 Beta 4 Hotfix 1",
        date="2026-02-28",
        author="munix",
        body=md(
            """
            ## v0.2.3 Beta 4 Hotfix 1

            A hotfix for the fourth prerelease beta of Redux v0.2.3 has been released. You can find the download and changelog on [GitHub](https://github.com/KSP2Redux/Redux/releases/tag/v0.2.3.0-beta%2Bdb95dc1d) or here on Discord: https://discord.com/channels/1078696971088433153/1444156522127954064/1477434147206336573

            From now on we will be using these announcement pings to notify you about new Redux releases. You can subscribe/unsubscribe by adding/removing the 🔔 reaction on the first post in [#⚪reaction-roles](https://discord.com/channels/1078696971088433153/1078781791143469268).
            """
        ),
    ),
    Post(
        slug="new-1-875m-parts-preview",
        title="New 1.875m Parts Preview",
        date="2026-03-09",
        author="munix",
        body=md(
            """
            A bit of a sneak peek at some of the new 1.875m parts by glumo
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1480595638491021523/Screenshot_350.png?ex=69ece4a4&is=69eb9324&hm=4286d5047788440a78d15b214a6a0bb1b5b0b860dba7d07224971b1c208050dc&", "part-preview-1.png", "1.875m parts preview 1"),
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1480595638998798469/Screenshot_351.png?ex=69ece4a4&is=69eb9324&hm=961b0ce9f30a53d94f70fd5e5929cf215f1a2e37aa9304e5541a4dcc2c523f67&", "part-preview-2.png", "1.875m parts preview 2"),
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1480595639367635085/Screenshot_352.png?ex=69ece4a4&is=69eb9324&hm=6bcd2f356f8b356ada8afaa80d6a36c76595d9061c5993d324b375239e5652f2&", "part-preview-3.png", "1.875m parts preview 3"),
        ],
    ),
    Post(
        slug="engine-plume-tools-preview",
        title="Engine Plume Creation Tools Preview",
        date="2026-03-15",
        author="munix",
        body=md(
            """
            A little preview of new tools for engine plume creation (based on the stock engine VFX system) for Redux and mods
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1482736889130651738/20260315-1345-08.0621341.mp4?ex=69ecc5d6&is=69eb7456&hm=6cc6122d0f40981ed92f67cdd2911ae319222515561155bf8ae84fade2a6a0d8&", "engine-plume-tools.mp4", "Engine plume tools"),
        ],
    ),
    Post(
        slug="map-view-performance",
        title="Chipping Away at Map View Performance Issues",
        date="2026-03-30",
        author="foonix",
        body=md(
            """
            **Chipping away at map view performance issues**

            Most of the speedups in Redux focus on the simulation and main UI. We haven't really done much to try to improve the map situation. After all, the simulation has to run at time as the map being open, so any improvement in the simulation *should* imply a performance improvement in the map. However, with the sim performance getting better, the FPS drop when opening the map is getting increasingly noticeable. One piece of code in particular, called `RelativeOrbitSolver` jumped out at me as actually getting worse due to some changes in the way transforms are handled. The current version in redux takes up a whopping 4ms on my test setup.

            `RelativeOrbitSolver` is used for predicting future locations in a hypothetical future orbit, and calculate where those points would be with respect to some given viewer. It's used by the map to do things like draw projected intercept lines.

            For example, let's say a vessel in orbit of Kerbol is not currently intercepting Moho. The player adds a maneuver plan that would cause it to intercept Moho's SOI but transit through it. So, the map has to draw a bunch of different lines.

            - The current orbit line.
            - The line starting at where the maneuver node is showing the change in Kerbol orbit as a result of the planned impulse. Ends at the predicted Moho SOI intercept.
            - A line near wherever Moho currently is that shows the vessel's predicted transit through Moho's SOI (relative to Moho). This is technically a hyperbolic trajectory ("orbit") of Moho.
            - Another line relative to Kerbol that shows what the previous line actually like from Kerbol's perspective. **This is the one that uses `RelativeOrbitSolver`.**
            - A line after the projected SOI ejection that shows yet another orbit of Kerbol, but this one having been modified by Moho's gravitational pull.

            The code uses several strategies depending on what kind of line it's drawing, but the 2nd to last one here is the one that uses `RelativeOrbitSolver`. It's also used for some other tasks, such as trying to find SOI transition points.

            The code for `RelativeOrbitSolver` is one of the few things got somewhat slower after switching to ECS frames. It created a bunch of temporary `TransformModel`s, would move them around, and then use them for doing relative position calculations. The individual point calculations were probably faster, however the setup/teardown of the temporary frames were quite expensive. Unfortunately, a few spots in the code (such as maneuver nodes) would create a `RelativeOrbitSolver` to solve for exactly one point and throw it away.

            So, I rewrote the code to avoid using `TransformModel`. While I was in there, I noticed a bug where it would ignore a celestial body's axialTilt, which caused some issues with the line related to Moho. Now the code just scrapes the spatial relationships into a simple temporary list, and runs a simple loop to do the same calculations the more complicated transform system would do.
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1488314512296640664/image.png?ex=69eca127&is=69eb4fa7&hm=d86ffc5e52685ee60a38adbbec50df6818041ac96600d705450e99d332e851a0&", "map-view-performance-1.webp", "Map view performance 1"),
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1488314512821194812/image.png?ex=69eca127&is=69eb4fa7&hm=4b7727493b63c9e59f83f4502a8875750ba6211fc624952a8aafec31f8a14e0e&", "map-view-performance-2.webp", "Map view performance 2"),
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1488314513207066684/image.png?ex=69eca127&is=69eb4fa7&hm=387e0680b440a7a4a1098453d1a018b3819c934f8b8ec98378103be42e22dfad&", "map-view-performance-3.webp", "Map view performance 3"),
        ],
    ),
    Post(
        slug="loot-boxes-joke",
        title="Everything Is Now Loot Boxes",
        date="2026-04-02",
        author="NexusHelium",
        body=md(
            """
            Guys everything in KSP2 Redux is now loot boxes sorry
            """
        ),
    ),
    Post(
        slug="i-am-nexushelium",
        title="This Is Real and I Am NexusHelium",
        date="2026-04-02",
        author="NexusHelium",
        body=md(
            """
            This is real and I am NexusHelium
            """
        ),
    ),
    Post(
        slug="exclusive-quote-from-foonix",
        title="An Exclusive Quote from foonix",
        date="2026-04-02",
        author="NexusHelium",
        body=md(
            """
            This is an EXCLUSIVE quote from foonix
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1489079416758866000/IMG_7072.png?ex=69ecc686&is=69eb7506&hm=89752a2e1517aa015c2e8eb38c3cf8b4b74b567145882158ab740b26f6ed8bdf&", "exclusive-quote.png", "Exclusive quote"),
        ],
    ),
    Post(
        slug="april-fools-image",
        title="April Fools Image",
        date="2026-04-02",
        author="munix",
        body="",
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1489079677153968148/image.png?ex=69ecc6c4&is=69eb7544&hm=3323976a75c9dfb419a377a5338f32f3f795357fbb2fbef02a5c3da89a690219&", "april-fools-image.png", "April Fools image"),
        ],
    ),
    Post(
        slug="europe-is-not-real",
        title="Europe's Not Real",
        date="2026-04-02",
        author="NexusHelium",
        body=md(
            """
            Also Europe’s not real
            """
        ),
    ),
    Post(
        slug="that-is-real-news-too",
        title="That's Real News Too",
        date="2026-04-02",
        author="NexusHelium",
        body=md(
            """
            That’s real news too
            """
        ),
    ),
    Post(
        slug="custom-flags-teaser",
        title="Custom Flags Teaser",
        date="2026-04-09",
        author="munix",
        body=md(
            """
            Can you guess what new feature we're adding next? **Spoiler:** custom flags are coming in beta 5.
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1491873472060592219/image.png?ex=69ed0d71&is=69ebbbf1&hm=fd9e5019be22368dda89e4c274606ab4bfe96aef87fdb351e8297abbcebcf373&", "custom-flags.png", "Custom flags"),
        ],
    ),
    Post(
        slug="urp-port-devlog",
        title="Early URP Port Devlog",
        date="2026-04-15",
        author="munix",
        body=md(
            """
            I thought I'd make a short devlog to show off what I've been working on the past couple of days.

            To give a bit of context, KSP2 uses the Built-in Render Pipeline. In Unity, a render pipeline is the sequence of GPU steps (culling, batching, lighting, shading, post-processing, ...) that turns scene data into pixels each frame. The original, old Built-in Render Pipeline is a hardcoded implementation of that sequence, where you can tweak the parameters, but not really the logic itself. Meanwhile, the newer Scriptable Render Pipeline (which is an umbrella term for both the Universal Render Pipeline and the High Definition Render Pipeline) exposes that logic in C#, so that you can define exactly how objects are drawn, how lighting is evaluated, how render passes are structured, etc.

            Now, the issue is that the BRP is going to be deprecated in Unity 6.5, and completely removed possibly as early as Unity 6.8, which coincidentally is also the stable release of CoreCLR support (which we *really, really, really* want for the potential [crazy performance boost](https://discussions.unity.com/t/expected-performance-of-new-coreclr-vs-mono-vs-il2cpp/910032/2) and the access to modern C#). Generally, we also want to be able to keep upgrading the game and not be hard stuck on a specific Unity version.

            So, in order to solve this issue, we'll need to eventually port the game from BRP to URP or HDRP. While HDRP would make the most sense with its current feature set compared to URP, Unity just recently announced that it will no longer be developed, and that URP will eventually receive all of its features and become the single recommended pipeline to use. That means that for future use, it makes more sense to start with URP right away, rather than have to go through *another* port in a couple of months/years.

            In our case, porting from BRP to SRP is not an easy task though, arguably much more difficult than our big upgrade from Unity 2022.3 to Unity 6.3 (and now 6.4 in development). That's because we don't have access to the source code of the game's shaders, and shaders are often very particular about which render pipeline they work on. That said, there are some ways (dark magic) to "hack" around this and get stuff to render using these normally incompatible shaders, and the video in this post is a look at the first "playable" version of the very early and experimental URP port of the game. Many things are still missing, but it's honestly been going much better than I expected, so I'm feeling positive about this little side-quest that I'm on!
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1493783356226142228/Video_Project_27.mp4?ex=69ecbfe9&is=69eb6e69&hm=b0c0b13d0b2e27eb69c8178be2e3c5c65d0a7d27a14d70b88e589d8bc28f98c5&", "urp-port.mp4", "URP port"),
        ],
    ),
    Post(
        slug="sas-and-input-update",
        title="SAS, Flight Input, and Precision Mode",
        date="2026-04-17",
        author="munix",
        body=md(
            """
            Decided to take a short break from Redux (working on the rendering pipeline) and, for a change, work a bit on Redux. This time, I looked at a few flight-control related things:

            1. SAS oscillations
            2. Flight input
            3. Precision mode

            The main one is SAS. In stock KSP2, SAS has a tendency to oscillate a lot more than it did in KSP1, especially on vessels with a lot of control authority, meaning that rockets and planes can sometimes wobble back and forth instead of smoothly settling in the target direction. This gets especially noticeable under physics warp.

            After comparing the KSP1 and KSP2 implementations, the PID controller used for SAS is basically the same, and not really an issue. The bigger differences are in the surrounding logic: how SAS estimates when it should stop pushing, when the flight control state gets updated, and how often the telemetry system updates data that SAS needs.

            The first fix was related to the "coasting" logic. Basically, SAS needs to predict when the vessel is already rotating fast enough that it should stop applying torque and let itself coast into the target direction. KSP2 had a small difference from KSP1 here that made it worse at predicting overshoot, so it would often push for too long, overshoot, correct back, overshoot again, and so on. Fixing the formula here to match KSP1 helped with making vessels settle down instead of wobbling forever.

            The second fix was about timing. Gimbals, control surfaces, reaction wheels, RCS, etc. all consume the flight control state during FixedUpdate, and with this change, SAS now updates that control state earlier in the fixed update order. That means parts are working with fresher SAS commands, instead of commands that are slightly behind what the vessel is currently doing.

            There was also a fun little physics warp rabbit hole. SAS depends on telemetry data, but that was normally refreshed through the regular Update path (there's always 1 Update per frame, so the frequency changes with FPS). Under physics warp, especially at lower FPS, you can get multiple FixedUpdate ticks between regular Updates (FixedUpdate is, as the name suggests, fixed - by default at 50 per second - and it scales with time warp speed), meaning SAS ends up acting on stale telemetry data. This was fixed by updating the necessary telemetry data on FixedUpdate instead of Update.

            Outside of SAS, I also tweaked the manual flight inputs. Stock KSP2 input is very instant, which can feel a bit twitchy with keyboard controls. The updated version is closer to KSP1, where pitch/yaw/roll ramp up and decay back down instead of snapping immediately to full input or zero.

            Precision mode is completely reworked. In stock KSP2, it simply limited the control authority of user inputs to 10% of the maximum. Now it also acts closer to the KSP1 version, where you can still go from -100% to 100% of the input, but the buildup and decay are much slower, meaning it's now much easier to make finer inputs, while still letting you go all the way to the max if you keep holding the key.

            All in all, these changes should make vessel controls and SAS feel a lot better, though it's obviously not an all-powerful fix that will get rid of all issues.

            In the attached video, you can see all of these changes: SAS on a rocket with very high control authority at 1x, 2x, and 4x physics warp, SAS on a plane, and then the updated normal and precision input behavior (with SAS disabled).
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1494732565209415851/sas-and-input.mp4?ex=69ece82e&is=69eb96ae&hm=2069d844b81d6393d6c059a70d21c4d209d692055816ff4b945f6ff841217d69&", "sas-and-input.mp4", "SAS and input"),
        ],
    ),
    Post(
        slug="project-shakespeare",
        title="Project Shakespeare",
        date="2026-04-20",
        author="munix",
        body=md(
            """
            Everyone, meet The Secret Feature™, or as we like to call it, Project Shakespeare (to honor the never-implemented, never-explained mod type called Shakespeare that can be found in the stock game's code).

            This is a very basic KSP1 **part-only** mod loader with currently *mostly* functional command modules, deployables and animations, decouplers, fuel tanks, engines, gimbals, plumes, engine mode switching, variant switching, and more. It includes support for some popular modded part modules as well, such as B9 part switching and animated decouplers.

            There's a *lot* that doesn't work properly yet, such as WIP control surfaces (that's why I didn't put on the grid fins yet, as they result in a funny, although very motion sickness-inducing death spin), or RCS thrusters. Engine plumes are also just using the default KSP2 methalox plume attached in place of where the KSP1/Waterfall plume would be, and for some parts (e.g. the booster fuel tank in the video) the textures don't look right, either.

            **IMPORTANT**: this is **NOT** going to be a "plug-and-play" feature where you just copy all 300 of your KSP1 mods into the Redux folder and can play without any issues. It is extremely limited with a small selection of part modules and types that it can handle, it's only able to do handle basic Module Manager patching logic in order to support things like engine plumes defined in MM patches instead of the base .cfg file (which is a pattern often used in KSP1 mods), and also, it's *EXTREMELY* slow. I've seen loading times of like 2-3 minutes with 3 part mods, and that will possibly get even slower as I iterate on it more and introduce more module translations and other functionality (though it can be somewhat mitigated by the caching of translated parts and modules).

            The purpose of this feature is to be a proof-of-concept, technical demo that lets your imagination run wild with what could be possible if your favorite KSP1 mod authors ported their mods for KSP2 for real, and it also serves as a technical showcase of what sorts of authoring and conversion tools we can and will provide to KSP1 mod developers to help them with the process of converting their mods over to KSP2 Redux.

            Note: this will not be a part of beta 5, you'll need to wait a bit longer for us to polish this more.

            Mods used in the showcase are [Tundra Exploration](https://forum.kerbalspaceprogram.com/topic/166915-112x-tundra-exploration-v72-april-6th-2026-restockalike-spacex-falcon-9-crew-dragon-xl-haven-1/) and [Kerbal Reusability Expansion](https://forum.kerbalspaceprogram.com/topic/195546-112x-kre-kerbal-reusability-expansion/), some of my favorite KSP1 mods.
            """
        ),
        media=[
            Media("https://cdn.discordapp.com/attachments/1340177004569301075/1495614600194822204/Video_Project_29.mp4?ex=69ecd1e3&is=69eb8063&hm=9729ee5e0add691216bca76c43edfaac5fa6e36d5dd05d4a9c155efbbec47db6&", "project-shakespeare.mp4", "Project Shakespeare"),
        ],
    ),
    Post(
        slug="api-docs-update",
        title="API Documentation Pipeline Update",
        date="2026-04-21",
        author="cheese_queen",
        body=md(
            """
            A short dev update from what ive been doing for today:

            I have been working on our workflow to automatically generate API documentation from the doc comments we write in the code.

            This is not as simple as it may seem because unity does not have any way to export the xml documentation like msbuild would normally have, so instead I had to force unity in the CI pipeline to generate the project files as it would with rider, then have a modern dotnet sdk build the files to generate the documentation files, which took a lot of fanangling as you might imagine (i even had to write a script to selectively fix an error for this step that only occurs when using the dotnet sdk).

            Then later on in the CI/CD pipeline, I invoke docfx to build all the documentation, and push to a github repo (for ease of hosting it on our own domain).

            You can see current documentation here: http://api.ksp2redux.org/

            This is for the develop branch so it wont accurately reflect whats in the beta, however once the next beta is out it will redirect for that beta.
            """
        ),
    ),
]


def slugify(text: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or "post"


def clean_text(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n").strip()
    text = re.sub(r"<:([a-zA-Z0-9_]+):\d+>", "", text)
    text = re.sub(r"<@&\d+>", "", text)
    text = re.sub(r"<@(\d+)>", lambda m: USER_NAMES.get(m.group(1), ""), text)
    text = re.sub(
        r"<#(\d+)>",
        lambda m: f"[#{CHANNEL_NAMES.get(m.group(1), m.group(1))}]({DISCORD_GUILD_BASE}/{m.group(1)})",
        text,
    )
    text = re.sub(r"\|\|(.+?)\|\|", r"**Spoiler:** \1", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = "\n".join(line.rstrip() for line in text.splitlines())
    return text.strip()


def escape_yaml(value: str) -> str:
    return value.replace('"', '\\"')


def description_for(body: str) -> str:
    lines = [line.strip() for line in clean_text(body).splitlines()]
    filtered = [line for line in lines if line and not line.startswith("#") and not line.startswith(">")]
    text = " ".join(filtered)
    text = re.sub(r"\[[^\]]+\]\(([^)]+)\)", r"\1", text)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= 160:
        return text
    return text[:157].rstrip() + "..."


def ensure_clean_dirs() -> None:
    BLOG_DIR.mkdir(parents=True, exist_ok=True)
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)


def extension_from_url(url: str) -> str:
    parsed = urllib.parse.urlparse(url)
    suffix = Path(parsed.path).suffix
    return suffix or ".bin"


def download_file(url: str, destination: Path) -> str | None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(request) as response, destination.open("wb") as out:
            shutil.copyfileobj(response, out)
    except (urllib.error.URLError, urllib.error.HTTPError) as exc:
        if destination.exists():
            destination.unlink()
        return str(exc)
    return None


def media_markup(media: Media, relative_path: str) -> str:
    lower = relative_path.lower()
    alt = media.alt or Path(relative_path).stem.replace("-", " ")
    if lower.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp")):
        return f"![{alt}]({relative_path})"
    if lower.endswith((".mp4", ".webm", ".mov")):
        return f'<video controls preload="metadata" src="{html.escape(relative_path)}"></video>'
    return f"[{alt}]({relative_path})"


def write_post(post: Post) -> None:
    post_dir = MEDIA_DIR / post.slug
    post_dir.mkdir(parents=True, exist_ok=True)

    media_blocks: list[str] = []
    for index, media in enumerate(post.media, start=1):
        filename = media.filename or f"asset-{index}{extension_from_url(media.url)}"
        target = post_dir / filename
        error = download_file(media.url, target)
        if error:
            media_blocks.append(
                f"*Unable to recover `{filename}` from Discord: {error}*"
            )
            continue
        media_blocks.append(media_markup(media, f"/blog/redux-news/{post.slug}/{filename}"))

    body = clean_text(post.body)
    if media_blocks:
        body = f"{body}\n\n## Media\n\n" + "\n\n".join(media_blocks) if body else "## Media\n\n" + "\n\n".join(media_blocks)

    content = (
        "---\n"
        f'title: "{escape_yaml(post.title)}"\n'
        f"date: {post.date}\n"
        f'author: "{escape_yaml(post.author)}"\n'
        f'description: "{escape_yaml(description_for(body) or post.title)}"\n'
        "---\n\n"
        f"{body}\n"
    )
    (BLOG_DIR / f"{post.slug}.mdx").write_text(content, encoding="utf-8")


def main() -> int:
    ensure_clean_dirs()
    for post in POSTS:
        write_post(post)
    print(f"Exported {len(POSTS)} posts to {BLOG_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
