# Walking from every browser and device, with usage models: design

*Date: 2026-11-04. Status: draft for the owner's review. Nothing here is built.*

**What this recommends.** Add browsers in three levels, in this order. **Level 1, engines:** Firefox and WebKit next to Chromium, through the Playwright 1.63.0 the server already pins. All three are already baked into the box, so the box needs no new download. **Level 2, simulated devices:** phone and tablet sizes, touch and slow connections on those engines, each walk labeled as simulated. **Level 3, real devices:** an Android phone over ADB first, and a real iPhone only when a product's users justify it, because Playwright cannot drive iPhone Safari.

Every walk stamps its level, engine, browser version, device and host into its signed start event, its manifest, its seal, each finding and the report. A simulated Safari walk can never read as an iPhone walk.

The Walker gets a `usage` block: how this person holds the device, types, connects and gets interrupted. The server enforces the parts it can (keyboard-only, zoom, connection, interruptions) and charges patience for the rest. Findings can become **checks**: small YAML files that assert a property by role and name, not a replay of clicks. They export to Playwright Test, run across the matrix, and live in the product's repo.

**What it costs.** Level 1 and 2 cost no money. They take about 600 MB of disk the box already holds. Per walk, measured here, the browser takes about 160 MB (Chromium headless shell), 290 MB (WebKit) or 390 MB (Firefox) with one page open. One walk at a time stays the rule, so a matrix run takes longer but uses no more memory. Level 3 Android costs a phone and a host with USB. Level 3 iPhone needs a Mac and an iPhone, or a paid device cloud whose prices could not be read from this box (section 7.4). The build is six slices; slice 1 is a few days' work and ships Firefox and WebKit walks on the box with honest labels.

**Before anything else**, the probes found three gaps in today's Chromium guard that hold on every engine. They are in section 3.3 and are slice 0.

---

## Contents

1. What is settled, and what was probed
2. Browser and device matrix
3. The server's rules on each engine
4. Honesty in the record
5. Usage models
6. Walkers written by outside teams
7. Choosing a matrix
8. Tests built from walks
9. Where it runs and what it costs
10. Expert personas
11. Build order
12. Decisions
13. Appendix: probe log

---

## 1. What is settled, and what was probed

### 1.1 Settled

<!-- decision-lint: not-a-decision -->
The owner confirmed the reading of "usage models" and "tests" on 2026-11-04 ("yes"). A usage model is how a person actually uses a device: one thumb on a phone, mouse and keyboard, a shaky connection, an interrupted session. The persona carries it into the walk. Tests are repeatable checks built from what walks find. This spec treats that as ruled.

The three levels and their order (1, then 2, with 3 where a product's users justify it) were put to the owner the same day. This spec keeps them.

### 1.2 What was probed

Every probe ran in this box, outside the repo (`/tmp/mswprobe1`), on 2026-11-04:

- **Host:** Ubuntu 24.04.5 on WSL2 (Linux 6.6.87.2), x86_64, 12 cores, 28 GB of RAM shared with other lanes. No `/dev/kvm`, no USB, no branded Chrome or Edge.
- **Playwright:** 1.63.0, the pinned version, with the box's baked builds in `/ms-playwright`: Chromium 153.0.8010.12 (build 1243, with its headless shell), Firefox 155.0 (build 1543), WebKit 26.6 (build 2359). `/opt/playwright/baked.json` lists 1.63.0 with all three, so **1.63.0's browsers are baked**.
- **Network:** the box's proxy blocks most of the web. GitHub and the npm registry answer. Playwright's docs were read from its repository at the `v1.63.0` tag and at `main`. Vendor pricing pages, StatCounter and Apple's developer site answered `403 Filtered`. No web-fetch tool was available. Anything below from those sources is marked **not verified** or **guess**.

The probes:

1. **The server's own test suite on each engine.** A copy of `server/` with `chromium.launch` swapped for the engine named in an environment variable, and nothing else changed. 106 tests.
2. **An engine feature probe**: the context options the server uses, touch, CDP, axe, the vitals observers, the guard's view of each request, pop-ups, the fake clock, offline, rotate, service workers, `route.fetch` without redirects, and a route-level delay.
3. **A guard probe** that drives the server's real `installGuard`: an off-list pop-up, service workers allowed and blocked, and a transact POST answered by a 303 to the same origin and to an off-list origin.
4. **A rotate probe** isolating Firefox's hang.
5. **A memory probe**: PSS (proportional set size) of the browser's process tree for one walk-shaped context.

Results are in the sections they bear on, and in full in section 13.

---

## 2. Browser and device matrix

### 2.1 The levels

| Level | Name in the record | What runs | Where |
|---|---|---|---|
| 1 | `engine` | A rendering engine at desktop size, through Playwright: Chromium, Firefox or WebKit. Branded Chrome and Edge are Chromium channels | Any host Playwright supports: Linux box, Windows, Mac |
| 2 | `simulated-device` | The same engines with a phone or tablet viewport, touch, a mobile user agent where the engine allows it, and simulated connections | Same hosts |
| 3 | `real-device` | A real browser on a real phone or tablet | A host with the device attached, or a device cloud |

### 2.2 The matrix

"Distance" is how far the walk is from the real browser a person uses. "Box" is this Linux factory box.

| Real browser | Level 1 or 2: what runs | Host | Distance from the real thing | Level 3: route to the real thing |
|---|---|---|---|---|
| **Chrome, desktop** | Playwright Chromium (headless shell by default). Channel `chrome` runs the installed Google Chrome | Box: Chromium only. Windows, Mac: Chromium, or `chrome` if installed | Chromium is "ahead of Stable": Playwright 1.63.0 ships Chromium 153 and was "tested against" Chrome 153 (release notes). The headless shell is a separate build, and Chrome's new headless mode "differs" from it (Playwright `browsers.md`). Missing: Chrome's proprietary codecs, enterprise policies, extensions, sign-in | Level 1 with channel `chrome` on a Windows or Mac host *is* the real browser, driven by automation |
| **Edge, desktop** | Channel `msedge`. Edge is Chromium; there is no separate engine to test | Windows, Mac (installed Edge). Not the box: no Edge, and the download is blocked | Same engine as Chrome. Differences are Edge's own features (policies, tracking prevention, sidebar), not layout or script behavior | Level 1 with channel `msedge` is the real browser |
| **Firefox, desktop** | Playwright Firefox 155.0, a patched build. Playwright "doesn't work with the branded version of Firefox" | Box, Windows, Mac | Close to Firefox Stable at the same version. Missing: the branded build's extensions and settings. Media codecs vary by OS | None needed for desktop |
| **Safari, macOS** | Playwright WebKit 26.6, "derived from the latest WebKit main branch", often ahead of Safari. Playwright "doesn't work with the branded version of Safari" | Box (Linux WebKit), Windows, Mac (macOS 15 or later: 1.59 removed macOS 14 for WebKit) | **WebKit on Linux or Windows is not Safari.** It shares the engine (layout, CSS, JavaScript) but not Safari's networking stack, media codecs, fonts, Intelligent Tracking Prevention, content blockers, autofill or user interface. Playwright advises WebKit on a Mac "for the closest-to-Safari experience" | Real Safari on macOS has only `safaridriver` (WebDriver), not Playwright. Guess, not checked against Apple's docs from here |
| **Safari, iPhone** | Level 2: WebKit with `isMobile`, touch and an iPhone-sized viewport (Playwright's `iPhone` device descriptors) | Box, Windows, Mac | **Far.** It is a phone-sized WebKit window on a desktop OS. Missing: iOS Safari's address bar and safe areas, the soft keyboard, iOS font rendering, iOS memory limits, tab freezing, iOS networking and privacy features, real touch gestures. `maxTouchPoints` reads 0 in the probe even with `hasTouch` | No Playwright route. A real iPhone needs WebDriver: Apple's `safaridriver` on a Mac with the iPhone attached and remote automation on in Safari's settings (guess, from memory; Apple's page was blocked here), or a device cloud's iOS devices through Appium or WebDriver. Section 3.4 says what that loses |
| **Chrome, Android** | Level 2: Chromium with `isMobile`, touch and a phone viewport | Box, Windows, Mac | Moderate. Same engine family as Chrome on Android (Chromium), different build and OS. Missing: Android's soft keyboard, real touch, memory and CPU limits, real cellular networks | Playwright's **experimental** `_android` API: "Chrome for Android and Android WebView", over ADB, "Chrome 87 or newer", with "Enable command line on non-rooted devices" in `chrome://flags`. Known limits: no raw USB, the device must be awake, "not everything works" (1.63.0 typings). `launchBrowser()` returns a browser context, so the server's route-based guard should carry over (guess: no device here). Needs a host with USB or a network ADB connection, not the box |
| **Samsung Internet** | Level 2: Chromium, phone viewport, Samsung's user agent string | Box, Windows, Mac | Moderate. Samsung Internet is Chromium-based, but lags Chrome's version and adds its own features (ad blocking add-ons, a dark mode that rewrites colors, video assistant) | `_android`'s `launchBrowser` takes `pkg`: "package name to launch instead of default Chrome for Android". Whether Samsung Internet accepts Playwright's command line and exposes its debugging socket is a **guess**, untested |
| **Firefox, Android** | Level 2: Firefox, phone viewport, touch. **Not `isMobile`**: Playwright says it "is not supported in Firefox", and in the probe it hangs `setViewportSize` (section 3.2) | Box, Windows, Mac | Far: Firefox for Android (Fenix, GeckoView) is a different app on the same engine. The simulation has no mobile viewport meta handling | No Playwright route. GeckoView automation exists through Mozilla's own tools (guess, not researched here) |
| **Chrome or Firefox, iPhone** | Treat as Safari on iPhone | — | On iPhone, other browsers use WebKit. In the EU, Apple has allowed other engines since iOS 17.4 (guess, from memory) | As Safari on iPhone |
| **In-app browsers** (a link opened inside a messaging or social app) | Level 2 with the app's user agent, if the product's analytics show it | Box | Far: in-app web views add their own toolbars, block some features and share no cookies with the main browser | A real device with the app. Out of scope until a product needs it |
| **Older browsers** | Not supported. Playwright pins one recent build per engine | — | — | A device cloud's older OS images |

### 2.3 Device clouds

Prices and features could not be read from the vendors' own pages from this box (section 1.2), so **no price is quoted here**. Each row says what to check on the vendor's own page from a host with web access, and what to record: the plan name, monthly and yearly price, parallel sessions, the date read, and the URL. The capability notes are from memory and are **guesses** until checked.

| Provider | Check on its own page | Capability notes (guess until checked) | Reaching a local or staging site |
|---|---|---|---|
| BrowserStack | Automate (desktop) and Automate on real mobile devices, App Live or Live | Playwright on desktop browsers; Playwright on some real Android devices; iOS real devices through Appium or WebDriver, not Playwright | BrowserStack Local, a tunnel binary run on the host |
| Sauce Labs | Virtual cloud and real device cloud plans | Playwright on desktop browsers; real devices through Appium | Sauce Connect, a tunnel |
| LambdaTest (since renamed, per its own announcements; check its page) | Web automation and real device plans | Playwright on desktop; Playwright on some real Android devices; iOS through Appium | LambdaTest Tunnel |
| AWS Device Farm | Per device-minute price, and unmetered slot price | Real Android and iOS devices through Appium; desktop browser testing through Selenium | Private devices and VPC configuration on AWS's side; a public staging address otherwise |
| Your own devices | A Mac (for iPhone), an Android phone, cables | Android through Playwright `_android`; iPhone through `safaridriver` | The device is on your own network; no tunnel needed |

Whatever the provider, the tunnel decides what the device can reach, so section 3.4's rule on where Level 3 may walk applies to all of them.

---

## 3. The server's rules on each engine

### 3.1 What assumes Chromium today

From the code at `main` (`6dcd4b1`):

| Place | What it assumes | Firefox 155 (probed) | WebKit 26.6 (probed) |
|---|---|---|---|
| `server/src/walk/session.ts:100` | `chromium.launch` | `firefox.launch` works | `webkit.launch` works |
| `server/src/walk/manifest.ts:21` | Records `chromium: browser.version()` | Needs an `engine` field (section 4) | Same |
| `server/src/browser/conditions.ts:5-8` `contextOptions` | `isMobile: v.touch` for phone and tablet | **`isMobile` must not be passed.** Playwright: "not supported in Firefox". With it, `setViewportSize` hangs (rotate test fails) | Works |
| `server/src/browser/conditions.ts:11-15` `emulateNetwork` | `newCDPSession` for `slow-3g` | "CDP session is only available in Chromium". Two session tests fail | Same |
| `server/src/browser/conditions.ts:42` rotate | `page.setViewportSize` | Hangs with `isMobile` (see above); works without it | Works |
| `server/src/browser/conditions.ts:35` offline | `context.setOffline` | Works | Works. After going back online, `navigator.onLine` still read `false` once in the probe (cause not found; guess: WebKit's online event is late) |
| `server/src/browser/guard.ts:13-35` | `context.route("**/*")` sees every request | Sees every request in the probe, including beacons | Same |
| `server/src/browser/guard.ts:17` | `req.frame().page()` tells a main-frame navigation | **Throws for a pop-up's first navigation, on all three engines.** Playwright: the frame is not available "when navigation request is issued before the corresponding frame is created" | Same |
| `server/src/browser/guard.ts:49` `forward` | `route.fulfill({ response })` for an ordinary POST→303 confirmation | Works | **Throws "Cannot fulfill with redirect status: 303".** Two guard tests time out, and the throw reaches Node as an unhandled rejection. Upstream: microsoft/playwright#18318; current docs: "WebKit rejects the call" |
| `server/src/browser/conditions.ts:6` service workers | `serviceWorkers: "block"` | Holds: registration never became ready, no page was controlled | Holds. **With service workers allowed, a worker's POST skipped the context's route and reached the server**, so on WebKit the block is load-bearing |
| `server/src/instrument/inquisition.ts:20-23` `requestfailed` | Ignores Chromium's `BLOCKED_BY_CLIENT` text | Guard aborts read `NS_ERROR_ABORT` | Guard aborts read `Blocked by Web Inspector`. An aborted main-frame navigation fired no `requestfailed` event in the probe (the left-site guard test waits for one and times out; the guard itself did block) |
| `server/src/instrument/inquisition.ts:8-12` `VITALS_INIT` | LCP, CLS, INP observers | `layout-shift` is not in `supportedEntryTypes`, so **CLS reads 0, which looks like a stable page**. LCP and INP work | Same as Firefox |
| `server/src/instrument/inquisition.ts:26` axe | `@axe-core/playwright` | Works, same violations as Chromium | Works, same violations |
| `server/src/walk/session.ts:385` touch | `tap()` when the viewport has touch | `tap()` works with `hasTouch`. `navigator.maxTouchPoints` is 0 | Works. `maxTouchPoints` is 0 |
| `server/src/walk/session.ts:121` fake clock | `page.clock.install` and `fastForward` | Works | Works |
| `server/src/walk/session.ts:340` load time | Navigation Timing `loadEventEnd` | Works | Works |
| Headless | Playwright's default headless Chromium is the headless shell, a separate build | — | — |

**Walker `devices` and journey `viewports` today.** Both are validated by the schema (`server/src/formats/schemas.ts:16`, `:58`) and read by nothing else. `start_walk` takes its viewport from the caller (`server/src/mcp/server.ts:32`), so a walk on a viewport the Walker never uses is not refused. Journey `locales` is the same. The four viewports (`server/src/formats/viewports.ts`) set width, height and touch, and `contextOptions` turns touch into `isMobile` and `hasTouch`. There is no user agent, device scale factor or device name.

**The suite on each engine (probe 1):**

| Engine | Passed | Failed | Why each failed |
|---|---|---|---|
| Chromium 153 | 106 | 0 | — |
| Firefox 155 | 101 | 5 | 2: no CDP for `slow-3g`. 1: rotate hangs with `isMobile`. 1: the service-worker test waits on a registration promise that never settles (the block holds; the test hangs instead of reading `false`). 1: read-only subrequest test timed out under load, and **passed when run alone** |
| WebKit 26.6 | 101 | 5 | 2: no CDP for `slow-3g`. 2: `route.fulfill` refuses a 303 (transact, payment origin). 1: no `requestfailed` event for the blocked navigation; the guard did block it |

### 3.2 Each rule, engine by engine

"Holds" means the probe or the suite showed it working on that engine. "New method" means the rule can hold, but only once the server does something different on that engine. "Cannot hold" means no method was found.

| Rule | Chromium | Firefox | WebKit | Real Android Chrome (`_android`) | Real iPhone Safari (WebDriver) |
|---|---|---|---|---|---|
| Screen-only view (screenshot, visible text, options; no DOM tool) | Holds | Holds | Holds | Guess: holds (same Chromium context) | New method: screenshot and page script through WebDriver. The DOM code in `options.ts` runs as an injected script |
| Rate before acting, four Wharton questions | Holds (pure server logic) | Holds | Holds | Holds | Holds |
| Act on what you saw (state hash, drift rule) | Holds | Holds | Holds | Guess: holds | Holds if the same perception code runs through WebDriver |
| No passwords | Holds | Holds | Holds | Holds | Holds (the server refuses before acting) |
| Touch acts | Holds | Holds with `hasTouch`; no `isMobile` | Holds | Real touch through Playwright on the device (guess) | Real taps through WebDriver |
| Stay on the site (main frame) | Holds, **except pop-ups** (3.3) | Same | Same | Guess: same | **Cannot hold in the browser**: WebDriver has no request interception. See 3.4 |
| Background writes blocked | Holds | Holds | Holds while service workers are blocked | Guess: holds | **Cannot hold** in the browser |
| Read-only (writes to the site stopped) | Holds | Holds | Holds | Guess: holds | **Cannot hold** in the browser |
| Transact with one-hop redirects | Holds, **except a 303 to an off-list origin** (3.3) | Same | **Cannot hold today**: `fulfill` refuses 3xx. New method needed (3.3) | Guess: as Chromium | Needs a test copy (3.4) |
| Read channels | Holds | Holds | Same fulfill problem when a read answers 3xx | Guess | Cannot hold |
| Service workers blocked | Holds | Holds | Holds, and required | Guess | Unknown |
| Masking before screenshots | Holds | Holds | Holds | Guess | New method (injected script) |
| Instrument pass | Holds | CLS not measured: new method (report `null`) | Same | Guess | Partial: axe through injected script; no console or network events without BiDi |
| `slow-3g` | CDP | New method: route delay (3.5) | New method: route delay | CDP should work (guess) | Cannot hold: a real network is whatever the device has. Record it |
| Offline at step N | Holds | Holds | Holds | Guess | Cannot hold through WebDriver (a cloud may offer it) |
| Rotate | Holds | Holds once `isMobile` is dropped | Holds | Real rotation through ADB (guess) | Through WebDriver or Appium orientation (guess) |
| Wait (fake clock) | Holds | Holds | Holds | Guess | Cannot hold |
| Signed events, seal | Holds (server side) | Holds | Holds | Holds | Holds |
| Replay | Holds | Holds | Holds | Guess | New method: replay through the same driver |

**The rule for a rule that cannot hold.** At `start_walk`, the server knows the platform before it opens a page. It looks up each of the journey's rules and conditions in a fixed table (the one above, kept in code) and does one of three things:

1. **Enforced**: it runs as today.
2. **Approximate**: it runs another way, and the start event records `approximate` with the method (for example `network: route-delay`). The report shows it beside every finding from that walk.
3. **Cannot hold**: `start_walk` fails and names the rule. A journey may say `accept_unenforced: [rule, …]` for rules that may be dropped; then the walk runs, and the start event, seal and report carry `not-enforced: <rule>`. The safety rules (read-only, stay on the site, background writes, no passwords, masking) can never be in `accept_unenforced`. A walk that cannot enforce them refuses.

Nothing weakens without a record of it.

### 3.3 Three gaps found on every engine (slice 0)

These are in today's Chromium server, not new to other engines. The probes found them, and they need fixing before any matrix work:

1. **A pop-up to an off-list origin is not blocked.** `target="_blank"` to `localhost:<port>/offsite` loaded on Chromium, Firefox and WebKit, with an empty `blocked` list, and the site logged `GET /offsite`. Cause, confirmed by the route log and by Playwright's `Request.frame` docs: for a navigation issued before its frame exists, `req.frame()` throws; `guard.ts:17` catches it and treats the request as not a main-frame navigation, so a GET goes through. Fix: when `isNavigationRequest()` is true and the frame is unavailable, treat the request as a main-frame navigation. The guard must fail closed. A GET writes nothing, so this breaks "stay on the site", not read-only.
2. **A transact POST answered by a 303 to an off-list origin is followed unchecked** on Chromium and Firefox: the site logged `GET localhost/offsite-after-post`, and nothing was blocked. Playwright's current `network.md`: after a fulfilled 3xx, "Chromium and Firefox follow the redirect without calling your handler". Fix: in `forward`, check a 301, 302 or 303 `Location` against the origin list before fulfilling, and block it as `left-site` when it is off the list.
3. **WebKit cannot fulfill a 3xx at all**, so every transact POST with an ordinary confirmation redirect fails there. The POST does reach the site, then the page hangs. The throw becomes an unhandled rejection, which ended a probe process that had no handler. Fix for every engine, so they behave alike: for a 3xx with an allowed `Location`, fulfill a `200` with an HTML page that does a script-free redirect (`<meta http-equiv="refresh">`) to that location, so the next request goes back through the route; or abort the original and `page.goto` the location. Either way, catch every error in the route handler.

These fixes are small and testable on Chromium today. They are slice 0 because the matrix makes them more visible, not because they are new.

### 3.4 Real iPhones and the guard

Without Playwright, a real iPhone walk is driven through WebDriver, which cannot stop a request in the browser. The guard can then live in only two places: the site (a test copy where writes are harmless) or a proxy between the device and the site.

A proxy can see methods only for plain HTTP. For HTTPS it sees a `CONNECT` and nothing inside, unless the device trusts a certificate the proxy makes, which is a step that weakens the device. So:

- **Rule:** a Level 3 walk where the in-browser guard cannot hold runs only on an environment where `run.json` says `kind: test`, `test_copy: true` and `seeded_data: true`, with every journey origin in `allowed_for_transact`. It is a transact walk by definition. Read-only on a live site is refused at start. The seal says `guard: environment`, not `guard: route`.
- A proxy guard is possible for a staging site served over plain HTTP inside a tunnel. It is not worth building until someone needs it (decision D-3).

### 3.5 Network conditions without CDP

`slow-3g` today is CDP's 400 ms latency and 64 kB/s each way. Without CDP, the server can:

1. **Delay in the route.** Every request already passes through the guard's route. The route waits `latency` before continuing; for bandwidth, it fetches the response (`route.fetch`), waits `bytes / rate`, then fulfills. The probe: a 400 ms route delay made a page load take 438 ms on Chromium, 604 ms on Firefox and 505 ms on WebKit, against about 40 ms without it. It misses WebSockets, a streamed response's pacing (the whole body arrives at once after the wait), and the browser cache. Fulfilling with fetched responses runs into the 3xx problem in 3.3, so it waits on slice 0.
2. **A throttling proxy** started by the server and passed as the browser's `proxy`. It shapes every byte, WebSockets included, on every engine, and later for devices in a tunnel. It conflicts with the box's own egress proxy (the server would have to chain to it), and it is more to build.
3. **Refuse** `slow-3g` off Chromium.

Recommendation: route delay, recorded as `network: { condition: slow-3g, method: route-delay }`, labeled approximate in the report. Chromium keeps CDP. Decision D-1.

---

## 4. Honesty in the record

### 4.1 One `platform` record per walk

The server builds it at `start_walk`, from what it launched, not from what the caller says. It goes into the signed `start` event first, so it sits under the HMAC chain and the seal's `head` covers it. Then it is copied into the manifest, the seal, each finding (as `platform_id` and `platform_label`) and the report.

Schema draft, `formats/platform.schema.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["id", "level", "engine", "browser", "device", "host", "network", "rules", "not", "label"],
  "properties": {
    "id": { "type": "string", "description": "sha256 of the canonical record minus id, first 12 hex" },
    "level": { "enum": ["engine", "simulated-device", "real-device"] },
    "engine": { "enum": ["chromium", "firefox", "webkit"] },
    "browser": {
      "type": "object",
      "required": ["name", "version", "driver"],
      "properties": {
        "name": { "type": "string", "examples": ["Chromium headless shell", "Google Chrome", "Microsoft Edge", "Playwright Firefox", "Playwright WebKit", "Chrome for Android", "Safari"] },
        "version": { "type": "string", "examples": ["153.0.8010.12"] },
        "channel": { "type": ["string", "null"], "examples": ["chrome", "msedge", null] },
        "build": { "type": ["string", "null"], "examples": ["chromium_headless_shell-1243", "webkit-2359"] },
        "driver": { "type": "string", "examples": ["playwright 1.63.0", "playwright 1.63.0 _android (experimental)", "safaridriver"] }
      }
    },
    "device": {
      "type": "object",
      "required": ["kind"],
      "properties": {
        "kind": { "enum": ["desktop", "simulated", "real"] },
        "viewport": { "enum": ["phone-small", "phone", "tablet", "desktop"] },
        "size": { "type": "object", "properties": { "width": { "type": "integer" }, "height": { "type": "integer" } } },
        "touch": { "type": "boolean" },
        "is_mobile": { "type": "boolean" },
        "user_agent": { "enum": ["engine-default", "descriptor"] },
        "descriptor": { "type": ["string", "null"], "examples": ["iPhone 15", "Pixel 7", null] },
        "model": { "type": ["string", "null"], "description": "real devices only: maker and model" },
        "os": { "type": ["string", "null"], "examples": ["Android 16", "iOS 26.1"] }
      }
    },
    "host": {
      "type": "object",
      "required": ["where", "os", "arch"],
      "properties": {
        "where": { "enum": ["box", "windows", "mac", "linux", "own-device", "device-cloud"] },
        "os": { "type": "string" },
        "arch": { "type": "string" },
        "provider": { "type": ["string", "null"], "description": "device cloud name, when where is device-cloud" }
      }
    },
    "network": {
      "type": "object",
      "properties": {
        "condition": { "enum": ["none", "slow-3g", "flaky", "real"] },
        "method": { "enum": ["none", "cdp", "route-delay", "proxy", "device"] }
      }
    },
    "rules": {
      "type": "object",
      "description": "each rule and condition the journey uses, with how it ran",
      "additionalProperties": { "enum": ["enforced", "approximate", "not-enforced"] }
    },
    "not": {
      "type": "array", "items": { "type": "string" },
      "description": "what this walk is not, from a fixed table in the server, never from input",
      "examples": [["not Safari", "not an iPhone"]]
    },
    "label": { "type": "string" }
  }
}
```

The label is built from the record by the server, never typed by a person. Examples:

- `Playwright WebKit 26.6 on Linux (box), phone 390×844, touch. Simulated device: not Safari, not an iPhone.`
- `Chromium headless shell 153 on Linux (box), desktop 1440×900. Engine: not Google Chrome.`
- `Google Chrome 153 (channel chrome) on Windows 11, desktop 1440×900.`
- `Chrome for Android 153 on a real Pixel phone, Android 16, own device, Playwright _android (experimental).`

The `not` table lives in code, keyed by engine, channel, host and device kind. WebKit on any host is "not Safari". A simulated device is "not a real <device>". The headless shell is "not Google Chrome". Firefox with a phone viewport is "not Firefox for Android".

### 4.2 Findings, fingerprints and the report

- Each finding gets `platform_id` and `platform_label`. The fingerprint (spec 8.2) stays the same across platforms, so one problem on three engines is one fingerprint seen three times.
- A report groups findings by fingerprint and shows the platforms each was seen on, and the matrix cells it was **not** seen on. The phrase "on all browsers" is allowed only when every cell of the run's declared matrix shows it.
- A finding seen only on a simulated device carries the label line beside its title in the report, in the same type size as the title.
- The seal gets `platform` (the whole record). Today's seal fields stay. `seal.json` is never re-written, so the platform recorded at the seal is the one the walk ran on.
- `msw compare` matches only like with like: a finding fixed on `webkit-phone` is not "fixed" on `chromium-desktop` unless that cell ran too.

### 4.3 Finding schema changes

```json
{
  "platform_id": { "type": "string" },
  "platform_label": { "type": "string" },
  "usage_model": { "type": ["string", "null"], "description": "the Walker's usage model id, when it had one" },
  "seen_on": { "type": "array", "items": { "type": "string" }, "description": "report-level only: platform ids where the same fingerprint appeared" }
}
```

`viewport` stays for old readers. The finding's `viewport` and its platform's `device.viewport` must agree, or the report refuses the run.

---

## 5. Usage models

### 5.1 What a usage model is for

A Walker today says who the person is and what they want. A usage model says how they use the device: the hand, the input, the connection, what interrupts them. It is in the spec only where it changes what the walk can find.

What it is not: a device. The device comes from the matrix cell, and the usage model must fit it (section 5.4).

### 5.2 Format

A Walker gets an optional `usage` block. It may name a preset from `formats/usage-models/` and override fields. Schema draft (added to `walker.schema.json`):

```json
"usage": {
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "model": { "type": "string", "pattern": "^[a-z0-9-]+$", "description": "a preset id; its fields are the defaults" },
    "input": { "enum": ["one-thumb", "two-thumbs", "mouse-keyboard", "keyboard-only", "screen-reader-like", "touch-stylus"] },
    "hand": { "enum": ["right", "left", "either"], "default": "right" },
    "zoom": { "type": "integer", "minimum": 100, "maximum": 400, "description": "browser zoom percent" },
    "text_size": { "type": "integer", "minimum": 100, "maximum": 200, "description": "OS text size percent" },
    "connection": {
      "oneOf": [
        { "enum": ["fast", "slow-3g"] },
        { "type": "object", "properties": { "flaky": { "type": "object", "properties": {
          "drop_every_steps": { "type": "integer", "minimum": 2 }, "seconds": { "type": "integer", "minimum": 1, "maximum": 120 } }, "required": ["drop_every_steps", "seconds"] } }, "required": ["flaky"] }
      ]
    },
    "interruptions": {
      "type": "array",
      "items": { "type": "object", "required": ["kind"], "properties": {
        "kind": { "enum": ["lock", "app-switch", "call", "rotate", "notification-cover"] },
        "at_step": { "type": "integer", "minimum": 1 },
        "every_steps": { "type": "integer", "minimum": 2 },
        "minutes": { "type": "integer", "minimum": 0, "maximum": 1440, "description": "how long away" } } }
    },
    "session": {
      "type": "object",
      "properties": {
        "returns_after_minutes": { "type": "integer", "minimum": 1 },
        "tabs": { "enum": ["one", "many"] },
        "autofill": { "type": "boolean", "description": "expects the browser to fill name and address" },
        "reading": { "enum": ["skims", "reads-everything"] },
        "uses_back": { "enum": ["rarely", "often"] }
      }
    },
    "source": {
      "type": "object", "required": ["kind"],
      "properties": { "kind": { "enum": ["product-analytics", "user-research", "published-study", "assumption"] }, "note": { "type": "string" } }
    }
  }
}
```

`source` is required whenever `usage` is present. "Assumption" is allowed and printed as such in the report.

### 5.3 What the server enforces, and what the agent plays

The line: **the server enforces what changes what the person can reach or perceive. The agent plays judgment.** The server charges patience where an input makes a step harder; the agent cannot refund it.

| Field | Server enforces | Agent plays |
|---|---|---|
| `input: keyboard-only` | Options are only elements in the Tab order. Acting on option N means the server presses Tab (or Shift+Tab) until focus reaches it, then Enter or Space. If focus never reaches it in 150 presses, the act is refused as `not reachable by keyboard` and recorded as an accessibility finding. Each 10 presses cost 1 patience. A focus that never becomes visible in the screenshot is recorded. `tap` and `click` are refused | Deciding what to look for |
| `input: screen-reader-like` | The look has **no screenshot**. It returns the page's accessibility snapshot (Playwright `ariaSnapshot`) in reading order, and options from it. Labeled "screen-reader-like: not a real screen reader"; real screen readers (VoiceOver, TalkBack, NVDA) are not emulated | Listening in order, not scanning |
| `input: one-thumb` | On a phone viewport, targets smaller than 24×24 CSS px (WCAG 2.2 target size minimum) cost 1 patience when chosen. Targets in the top quarter of the screen, on the side away from the hand, cost 1 more. The server checks the bounding box, so the cost is the same on every engine | Hesitating, mis-tapping |
| `input: two-thumbs` | Small targets cost 1 patience. No reach cost | — |
| `input: mouse-keyboard` | Desktop or tablet viewports only. Acts use `click` | — |
| `zoom` | The viewport's CSS size is divided by `zoom/100`, and `deviceScaleFactor` is multiplied by it. That is what browser zoom does to layout. The screenshot is the same pixel size | — |
| `text_size` | Today's `text_scale` approximation (root font size), labeled as it is today | — |
| `connection` | `slow-3g` as in 3.5. `flaky`: offline for `seconds` every `drop_every_steps` acts, through `setOffline` | Deciding to retry or leave |
| `interruptions: rotate` | Today's `rotate_at_step` | — |
| `interruptions: lock`, `app-switch`, `call` | The server opens a blank tab in front (the page's `visibilityState` goes hidden on engines where focus moves; guess, untested), advances the fake clock by `minutes` if the journey has `wait`, then brings the page back. On Chromium it may also freeze the page through CDP (`Page.setWebLifecycleState`). The record says which method ran | Coming back confused, or not at all |
| `interruptions: notification-cover` | A fixed banner the server draws over the top 80 px for one look. The page is not changed for anything else | Reading past it |
| `session.returns_after_minutes` | A second leg of the same walk: cookies kept, the fake clock advanced, the page reloaded. Needs `wait` | Remembering less |
| `session.tabs: many` | Adds `new-tab` and `switch-tab` moves | — |
| `session.autofill`, `reading`, `uses_back` | Nothing. A browser's autofill cannot be simulated honestly | All of it |

Usage-model costs are their own reason in `patience_charges` (for example `usage: small-target`), so a report can show how much of a run-away came from the device.

### 5.4 Composing a Walker, a journey, a usage model and a platform

The walk's settings come from four places, in order, each allowed to narrow what the one before allowed and never to widen it:

1. **Walker**: who they are, `devices`, `usage`.
2. **Journey**: the goal; `viewports` may narrow the Walker's devices; `silly.conditions` add conditions.
3. **Matrix cell** (run file): engine, viewport, level.
4. **Server table**: what that platform can enforce (3.2).

Rules at `start_walk`:

- The viewport must be in the Walker's `devices` (and the journey's `viewports`, when set). This is new: today they are not checked.
- `input` must fit the viewport: `one-thumb` and `two-thumbs` need `phone-small`, `phone` or `tablet`; `mouse-keyboard` needs `desktop` or `tablet`. A misfit refuses with the reason.
- When the journey's `silly.conditions` and the usage model both set the connection, the walk refuses. The two are not merged silently.
- The platform's `rules` record covers usage-model fields too, so `input: screen-reader-like` on any engine reads `approximate`.

### 5.5 Worked examples

**1. A night-shift worker on the bus, one thumb, shaky signal.**

```yaml
usage:
  model: one-thumb-commuter
  input: one-thumb
  hand: right
  connection: { flaky: { drop_every_steps: 5, seconds: 8 } }
  interruptions:
    - { kind: lock, at_step: 6, minutes: 3 }
  session: { tabs: one, reading: skims, uses_back: often }
  source: { kind: assumption, note: "the Walker's story says phone, bus, ten minutes" }
```

On `webkit` / `phone` it finds: a "Next" button in the top left that costs reach patience every page; a form that loses its values after the lock; a spinner with no message while offline. On `desktop` it refuses, because one thumb does not fit a desktop.

**2. A retired accountant who uses only the keyboard, at 200% zoom.**

```yaml
usage:
  input: keyboard-only
  zoom: 200
  connection: fast
  session: { tabs: many, reading: reads-everything, uses_back: rarely }
  source: { kind: user-research, note: "the product's own accessibility interviews, summarized by its owner" }
```

On `firefox` / `desktop`, the zoom makes the layout reflow as at 720 px wide. It finds: a menu that opens on hover only and is unreachable by Tab (refused act, accessibility finding); a cookie banner that traps focus; a focus ring that cannot be seen. A mouse-and-keyboard Walker would find none of these, because nothing would stop it.

**3. A volunteer coordinator with a screen reader on a phone.**

```yaml
usage:
  input: screen-reader-like
  connection: fast
  interruptions:
    - { kind: call, at_step: 4, minutes: 5 }
  session: { returns_after_minutes: 5, reading: reads-everything }
  source: { kind: assumption }
```

On `chromium` / `phone` the Walker never sees a screenshot. It finds: icon buttons read as "button" with no name; a total that is in an image; after the call, a session that expired with no spoken message. The report labels every finding "screen-reader-like: not a real screen reader". A person with VoiceOver or TalkBack must confirm before a finding is called a screen-reader bug.

---

## 6. Walkers written by outside teams

The owner expects outside teams to write their own Walkers from this repo's skills. The skills are not in the repo yet (spec section 6 lists them; `skills/` does not exist). For outside teams to get usable Walkers and usage models from them, the formats and skills need:

1. **Versioned schemas.** Each format file gets `schema_version`. The server reads the current and the previous version. A team's files keep loading after an upgrade, or `start_walk` says exactly which field changed.
2. **A validator that needs no browser.** `msw validate <files>` checks Walkers, journeys, usage models, run files and matrices against the schemas and the composition rules in 5.4 (a one-thumb Walker with only `desktop` fails here, not at walk time). The skills tell the agent to run it after writing each file.
3. **Presets with their reasons.** `formats/usage-models/` ships a handful of presets (`one-thumb-commuter`, `two-thumbs-casual`, `desk-mouse-keyboard`, `keyboard-only`, `zoom-200`, `screen-reader-like`), each with a comment saying what it finds. Teams start from a preset, not a blank block.
4. **`source` is required.** The `msw-dossier` skill asks where each usage choice came from (the product's analytics, the team's research, a published study, or an assumption) and writes it down. A Walker whose every usage field is an assumption is allowed, and the report says so.
5. **No private data in the files.** The skill writes roles, never real people, and never puts names, emails or account details in a dossier. Saved logins stay files prepared by a person, passed by path.
6. **The matrix stays out of the dossier.** A Walker lists the viewports the person uses, never the engine. Engines are the run's choice (section 7), so one Walker walks the whole matrix.
7. **Examples that pass.** Every preset and every example Walker is validated in CI, so a team copying one starts from something that loads.
8. **The findings rule travels with the skills.** The skills tell the agent where findings go (`docs/using-in-a-private-project.md`, "Where the findings go"), and that this public repo holds no records of a team's site.

---

## 7. Choosing a matrix

### 7.1 From the product's own users

A product picks its matrix from its own analytics, never from a global market figure.

1. Pull the last 90 days of sessions by browser, OS and device class (phone, tablet, desktop) from the product's own analytics. Record the source and the date range in the run file.
2. Map each browser to an engine: anything on iPhone or iPad maps to WebKit (2.2); Chrome, Edge and Samsung Internet map to Chromium; Firefox maps to Firefox.
3. Take engine × device-class cells in order of share until they cover 90% of sessions, and always include at least two engines.
4. If any cell holds a journey that takes money or creates an account, and its device class is phone with over a quarter of that journey's sessions, it earns a Level 3 cell (decision D-4).
5. Write the matrix into the run file (7.3) with the share that justified each cell and where the number came from.

When a product has no analytics, use the defaults below and say so in the run file.

### 7.2 Default sets

No share is quoted: StatCounter, the usual public source, could not be read from this box (section 1.2). These defaults rest on what each cell catches, not on market figures.

| Set | Cells | Why |
|---|---|---|
| **Small** (any project) | `chromium` / `desktop`; `webkit` / `phone` | Two engines, two sizes. WebKit on a phone is the closest the box gets to the iPhone, where every browser is WebKit, and Chromium on desktop covers Chrome and Edge |
| **Medium** | Small, plus `firefox` / `desktop` and `chromium` / `phone` | Adds the third engine and Android-sized Chromium |
| **Large** | Medium, plus `webkit` / `tablet`, `chromium` channel `chrome` and channel `msedge` on a Windows host | Adds the branded desktop browsers on a host that has them |
| **Real** | Any of the above, plus Level 3 cells chosen in 7.1 step 4 | Only when a product's users justify it |

Each set runs every journey on at least one phone and one desktop cell, as spec 5.5 already asks.

### 7.3 Matrix format

In `run.json`, schema draft:

```json
"matrix": {
  "type": "object",
  "required": ["cells", "source"],
  "properties": {
    "source": { "type": "object", "required": ["kind"], "properties": {
      "kind": { "enum": ["product-analytics", "default-small", "default-medium", "default-large"] },
      "range": { "type": "string", "examples": ["2026-08-01..2026-10-31"] },
      "note": { "type": "string" } } },
    "cells": { "type": "array", "minItems": 1, "items": { "type": "object", "required": ["id", "engine", "viewport"], "properties": {
      "id": { "type": "string", "pattern": "^[a-z0-9-]+$", "examples": ["webkit-phone"] },
      "level": { "enum": ["engine", "simulated-device", "real-device"] },
      "engine": { "enum": ["chromium", "firefox", "webkit"] },
      "channel": { "enum": ["chrome", "msedge", "chromium"] },
      "viewport": { "enum": ["phone-small", "phone", "tablet", "desktop"] },
      "descriptor": { "type": "string", "examples": ["iPhone 15", "Pixel 7"] },
      "device": { "type": "string", "description": "real devices: an ADB serial or a cloud device name, never committed to a public repo" },
      "share": { "type": "number", "minimum": 0, "maximum": 1 } } } }
  }
}
```

`start_walk` gains an optional `cell` (an id from the matrix). With no matrix, it behaves as today on Chromium, and the platform record says so.

---

## 8. Tests built from walks

### 8.1 What a check is

A **check** is a small YAML file that reaches a state by intent and asserts one property of it. It is made from a finding, and it fails while the finding stands. It does not replay the Walker's clicks: it names controls by role and accessible name, as a person would describe them, so a redesign that keeps the names keeps the check working.

Schema draft, `formats/check.schema.json`:

```yaml
id: donate-button-named          # unique in the product's repo
from:
  finding: first-timer-learn-w2   # the finding id
  fingerprint: 3f9c0a1b2d4e       # so msw compare can tie them together
  platforms: [webkit-phone]       # where the finding was seen
intent: The donate button has a name a screen reader can say
start: /donate                    # a path, joined to the run's base URL
mode: read-only                   # checks run under the same guard as walks
login: null                       # or a storage_state path, prepared by a person
reach:                            # steps by intent, not by position
  - choose: { role: radio, name: Monthly }
  - fill:   { role: textbox, name: Amount, value: "25" }
assert:
  - accessible-name: { role: button, near: Amount, not_empty: true }
cells: all                        # or a list of matrix cell ids
until: fixed                      # fails while the finding stands; passes once fixed
```

The assertions are a short, closed list, each one mapping to a finding kind:

| Assertion | For findings like |
|---|---|
| `accessible-name: { role, name or near, not_empty }` | Unlabeled controls |
| `in-viewport: { role, name, after: scroll-to-end }` | A button off-screen on a phone |
| `reachable-by-keyboard: { role, name, within_tabs }` | Keyboard traps, hover-only menus |
| `target-size: { role, name, min_css_px: 24 }` | One-thumb findings |
| `axe-rule-absent: { rule }` | Instrument findings from axe |
| `no-console-error` | Console errors on a step |
| `no-status: { at_least: 500 }` | Server errors |
| `text-visible: { text, before: { role, name } }` | A fee shown only on the last step |
| `values-kept: { after: invalid-submit or reload or offline }` | A form that clears itself |
| `one-write: { on: { role, name }, how: double-tap }` | A double-tap that donates twice (transact on a test copy only) |
| `lcp-under-ms`, `cls-under` | Performance floors. CLS only on Chromium, where it is measured (3.1) |

A Walker's judgment ("the wording confused me") does not become a check. It stays a finding for a person.

### 8.2 Running it across the matrix

`msw checks export <dir>` turns check files into Playwright Test specs that use `getByRole`. Each matrix cell becomes a Playwright project (`devices['iPhone 15']` on WebKit, `devices['Desktop Firefox']`, and so on). The exported specs import a small `@msw/checks` fixture that installs the same guard as a walk (`installGuard`, read-only by default), so a check can never write to a live site.

`msw checks run` runs them and writes one line per check and cell: `red` (the finding stands), `green` (fixed) or `cannot-run` (a control named in `reach` is gone, which is reported as "the check needs updating", never as fixed).

### 8.3 How a check relates to `replay`

| | `replay` | A check |
|---|---|---|
| Proves | That the walk happened as recorded | That a property of the site is still wrong, or now right |
| Runs | Once, after the seal, in the server process that ran the walk | Any time, in the product's CI |
| Finds controls by | The full unmasked name, kept only in memory | Role and name written in the check by a person or a skill |
| Compares | The exact page-state hash | One assertion |
| Survives a redesign | No | Yes, while names hold |

When `replay` reproduces a finding, the server may write a **draft** check next to the walk: the `reach` steps from the replayed acts, using the names shown to the Walker (masked). A person reviews and edits it before it is kept, because masked names will not match the page. Unmasked names are never written to disk, as today.

### 8.4 Where checks live

They follow the findings rule (`docs/using-in-a-private-project.md`). A check is code, not a record: it has no screenshots, no event log and no page text beyond control names. So:

- By default, checks live with the findings, in the home the product's owner chose.
- An owner may keep checks in the product repo's own test folder (`tests/msw/`) even when the findings live elsewhere, if the check files name nothing private. A public product repo may hold checks only on that condition.
- This repo holds only the format, the exporter, the fixture and example checks against the Cheese Shop.

Decision D-5.

---

## 9. Where it runs and what it costs

### 9.1 Install size (measured, `du -sh` in `/ms-playwright`, builds for 1.63.0)

| Build | Size |
|---|---|
| Chromium 1243 (full, headed and new headless) | 393 MB |
| Chromium headless shell 1243 (the server's default headless) | 261 MB |
| Firefox 1543 | 306 MB |
| WebKit 2359 | 294 MB |

All four are already baked in the box for 1.63.0. Adding Firefox and WebKit costs the box nothing. A Windows or Mac host downloads them with `npx playwright install firefox webkit`. Branded Chrome and Edge are installed separately (`npx playwright install msedge`) and only outside the box, whose wall blocks the download.

### 9.2 Memory per walk (measured)

PSS of the browser's process tree, one context with a 390×844 touch viewport and blocked service workers, the fixture home page loaded, then a second tab. Measured once each on 2026-11-04 in this box, so treat the numbers as rough:

| Engine | Launched, no page | One page | Two tabs |
|---|---|---|---|
| Chromium headless shell 153 | 108 MB | 157 MB | 169 MB |
| Chromium full, new headless 153 | 193 MB | 320 MB | 335 MB |
| Firefox 155 | 144 MB | 391 MB | 428 MB |
| WebKit 26.6 | 46 MB | 291 MB | 383 MB |

The server's Node process, the agent and axe runs come on top. A real site with heavy scripts will use more. Launch took 0.1 to 2 s for each engine when the box was quiet, and up to 7.7 s for Firefox under load.

### 9.3 One walk at a time

One server process still serves one walk at a time. A matrix run is the same Walker walking each cell in turn: `start_walk` with a `cell`, `quit`, `replay`, then the next cell. The server already allows a new walk after `quit`. Replay must run before the next `start_walk`, because it works only on the last quit walk. The walk folder name gains the cell: `<walker>-<journey>-<cell>-<locale>`.

Running cells in parallel would mean several server processes, one per agent, each with its own browser. This PC is short on memory, so the default is one cell at a time, and a `--parallel` setting is left for hosts that have room (decision D-6).

### 9.4 Box and host

- **The network wall.** The box can reach a site only through its proxy. The guard's `route.fetch` already uses it (`proxyFromEnv`). A throttling proxy (3.5 option 2) would have to chain to it. Device clouds and their tunnels need outside network, so Level 3 runs on a host, not the box.
- **Baked versions.** The box has one baked build per pinned Playwright version. A Playwright upgrade means adding the version to the box's list and rebuilding the image before any lane can walk. The server should keep pinning one exact version.
- **No KVM, no USB** in the box, so no Android emulator and no attached phone there. Level 3 Android runs on a host with ADB.
- **Windows** runs all three engines (Playwright: "Windows 11+, … or WSL") and has Edge installed, so it is the natural host for the branded desktop cells.
- **macOS** needs version 15 or later for WebKit. It is the only host for a real iPhone through `safaridriver`.

### 9.5 Money

Levels 1 and 2: none. Level 3 Android: an Android phone and a cable, on a host you already have. Level 3 iPhone: a Mac and an iPhone, or a device cloud. Cloud prices are not quoted (2.3); check them on the vendors' pages on the day a product needs Level 3.

---

## 10. Expert personas

The owner asked for Walkers who are experts, for example for a particular kind of financial institution. Nothing in the browser and device design changes for them. The guide's rules stand (`docs/using-in-a-private-project.md`, "Writing Walkers who are experts"): a role, not a real person; simulated feedback labeled as such; sourced facts; claims checked against the source.

Three things in this spec touch them:

1. **Usage models are where experts differ most from first-timers.** An expert on a desk uses many tabs, the keyboard and the back button. That is what changes their findings, more than their knowledge does. Give expert Walkers a usage model like any other.
2. **Domain facts get a `source`, like usage choices.** The `msw-dossier` skill asks for a source for every domain fact in an expert's `prior_knowledge` (a regulation, a published rule, the product's own documentation) and writes it next to the fact. A finding that rests on a domain claim ("this rate should be shown before the form") cites that source in `expected`, so a person can check it.
3. **An expert's finding about correctness is not a usability finding.** The report shows it as "simulated expert opinion, check against the source", and a check (section 8) is made from it only when the source gives a rule a page can be tested against.

---

## 11. Build order

Each slice ships something usable and leaves the server's tests green on Chromium.

**Slice 0: fix the three guard gaps (3.3).** Pop-ups fail closed, a 3xx `Location` is checked before it is followed, and a 3xx is never fulfilled as-is. Every route handler catches its errors. Tests for each, on Chromium. *Ships: a guard that holds on the cases the probes broke.*

**Slice 1: Firefox and WebKit at Level 1 and 2, with honest labels.** Small. `start_walk` takes an optional `engine`; `contextOptions` drops `isMobile` on Firefox; the platform record (4.1) goes into the start event, manifest, seal and findings; CLS becomes `null` where `layout-shift` is unsupported; `slow-3g` and other conditions an engine cannot do make the walk refuse, per 3.2; the instrument filter learns each engine's abort text. The suite runs on all three engines in CI; Chromium-only tests are marked as such. *Ships: real walks on Firefox and WebKit in the box, each labeled.*

**Slice 2: the matrix and the report.** `matrix` in `run.json`, `cell` on `start_walk`, Walker `devices` and journey `viewports` enforced, walk folders named by cell, a report that groups by fingerprint and shows the cells each finding was and was not seen on. `slow-3g` by route delay, labeled approximate. Branded `chrome` and `msedge` channels on hosts that have them. *Ships: one run across the small default set with one report.*

**Slice 3: usage models.** The `usage` block, the presets, the composition rules, `msw validate`, and the enforced parts in order of value: keyboard-only, zoom, one-thumb costs, flaky connection, interruptions, screen-reader-like. *Ships: the three worked examples walkable on the Cheese Shop.*

**Slice 4: checks.** The check format, `msw checks export` to Playwright Test, the `@msw/checks` guard fixture, `msw checks run` across the matrix, and draft checks from reproduced findings. *Ships: Cheese Shop checks that go red on its planted flaws and green when they are fixed.*

**Slice 5: Level 3 Android.** A launcher for `_android` on a host with ADB, recorded as experimental, with the rule table entries proved on a real phone. *Ships: one walk on a real Android phone.* An iPhone is not in this slice; it waits on decision D-2.

---

## 12. Decisions

```yaml decision
id: D-1
question: How should slow-3g run on Firefox and WebKit, which have no CDP?
options:
  - route delay, labeled approximate — reuses the guard's route; misses WebSockets and stream pacing
  - throttling proxy in the server — shapes every byte on every engine; must chain to the box proxy; more to build
  - refuse slow-3g off Chromium — honest and free; loses slow-network walks on two engines
recommended: route delay, labeled approximate
rationale: [Likely] The probe showed a 400 ms route delay landing on all three engines; the label keeps it honest, and a proxy can follow if WebSockets matter.
evidence:
  - server/src/browser/conditions.ts:11
  - probe 2 route_delay_400ms 438/604/505 ms (section 13)
disposition: none
private: false
```

```yaml decision
id: D-2
question: When a product needs a real iPhone, which route should MSW build first?
options:
  - not until a product's users justify it — no cost now; design kept in 2.2 and 3.4
  - own Mac and iPhone with safaridriver — one-time hardware cost; WebDriver driver to build; test copies only
  - device cloud through Appium or WebDriver — monthly fee unverified; tunnel needed; test copies only
recommended: not until a product's users justify it
rationale: [Likely] Playwright cannot drive iPhone Safari, the guard cannot hold without it, and no current product has shown the need with its own numbers.
evidence:
  - Playwright browsers.md v1.63.0 WebKit section
  - section 3.4 of this spec
disposition: none
private: false
```

```yaml decision
id: D-3
question: Should a real-device walk ever run against a live site through an MSW write-blocking proxy?
options:
  - no, real devices walk test copies only — simple and safe; no live-site real-device walks
  - yes, for plain-HTTP staging inside a tunnel — more reach; HTTPS still needs a device certificate
recommended: no, real devices walk test copies only
rationale: [Likely] A proxy cannot see HTTPS methods without a certificate on the device, so the safe rule is the environment rule.
evidence:
  - section 3.4 of this spec
disposition: none
private: false
```

```yaml decision
id: D-4
question: What earns a product a Level 3 real-device cell?
options:
  - phone share over a quarter on a journey that takes money or makes accounts — clear trigger from the product's own analytics
  - any product with phone traffic — more real-device walks; cost grows with every product
  - only when a person asks for it — no rule; easy to forget
recommended: phone share over a quarter on a journey that takes money or makes accounts
rationale: [Guessing] The threshold is a judgment, not a measurement; it ties paid devices to the journeys where a phone-only bug costs most.
evidence:
  - section 7.1 step 4 of this spec
disposition: none
private: false
```

```yaml decision
id: D-5
question: Where do checks built from findings live by default?
options:
  - with the findings, wherever the owner chose — one rule to explain; checks may sit away from CI
  - in the product repo's tests folder when they name nothing private — checks run in CI; owner must review names
recommended: with the findings, wherever the owner chose
rationale: [Likely] It follows the findings rule exactly; the owner can move checks into the test folder when they choose.
evidence:
  - docs/using-in-a-private-project.md, Where the findings go
  - section 8.4 of this spec
disposition: none
private: false
```

```yaml decision
id: D-6
question: Should a matrix run walk its cells one at a time, or in parallel?
options:
  - one at a time by default, parallel as a setting — fits this PC's memory; slower runs
  - parallel by default — faster; several browsers and agents at once on a short-memory PC
recommended: one at a time by default, parallel as a setting
rationale: [Likely] Firefox and WebKit each took about 290 to 390 MB per walk in the probe, and this PC is short on memory.
evidence:
  - section 9.2 of this spec
disposition: none
private: false
```

```yaml decision
id: D-7
question: Should the screen-reader-like usage model ship, given it is not a real screen reader?
options:
  - ship it, labeled not a real screen reader — finds unnamed and out-of-order content; needs a person to confirm
  - leave it out until real screen-reader automation exists — no risk of false confidence; misses those findings
recommended: ship it, labeled not a real screen reader
rationale: [Likely] An accessibility-snapshot walk with no screenshot finds real naming and order problems, and the label plus a human confirmation rule keeps it honest.
evidence:
  - section 5.3 and 5.5 example 3 of this spec
disposition: none
private: false
```

```yaml decision
id: D-8
question: Should keyboard-only walks be enforced by the server pressing Tab, or played by the agent?
options:
  - server presses Tab and refuses unreachable controls — real keyboard findings; slower walks
  - agent plays keyboard-only — no server work; the agent will click anyway, as the Vizron study found
recommended: server presses Tab and refuses unreachable controls
rationale: [Likely] The design's founding finding is that agents told to act like someone still act like experts; only the server can stop a click.
evidence:
  - docs/superpowers/specs/2026-10-11-ministry-of-silly-walks-design.md section 2
disposition: none
private: false
```

---

## 13. Appendix: probe log

All on 2026-11-04 in the factory box described in 1.2, with Playwright 1.63.0 and `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright`. Probe scripts lived in `/tmp/mswprobe1`, outside the repo, and are not kept.

**Probe 1, the suite.** `npx vitest run` on a copy of `server/`, with only the launch call swapped. Chromium: 106 passed in 188 s. Firefox: 101 passed, 5 failed. WebKit: 101 passed, 5 failed, plus 2 unhandled errors `route.fulfill: Cannot fulfill with redirect status: 303`. The failures are listed in 3.1. Rerun alone, the Firefox read-only subrequest test passed. Rerun alone with `DEBUG=pw:api`, the WebKit left-site test showed `route.abort` succeeding and the `requestfailed` wait timing out.

**Probe 2, engine features.** One context like the server's phone context (`isMobile` except where noted, `hasTouch`, `es-419`, dark, reduced motion, service workers blocked):

| Check | Chromium 153 | Firefox 155 | WebKit 26.6 |
|---|---|---|---|
| Context with `isMobile` and `hasTouch` | ok | ok (but see rotate) | ok |
| `newCDPSession` | ok | "only available in Chromium" | same |
| Media queries: dark, reduced motion, coarse pointer, no hover | all true | all true | all true |
| `maxTouchPoints` | 1 | 0 | 0 |
| `tap`, `click`, `touchscreen.tap` | ok | ok | ok |
| axe violations on the probe page | 4, same ids | 4, same ids | 4, same ids |
| `supportedEntryTypes` has `layout-shift` | yes | no | no |
| LCP and INP observed | yes | yes | yes |
| Navigation Timing load time | yes | yes | yes |
| Blocked form submit, page stays | ok (`net::ERR_ABORTED`) | ok (`NS_ERROR_ABORT`) | ok (`Blocked by Web Inspector`) |
| Pop-up with opener | ok | ok | ok |
| Fake clock fast-forward | advanced | advanced | advanced |
| `setOffline` | fetch failed while offline | same | same; `navigator.onLine` read false after restore |
| `setViewportSize` (rotate) | ok | hung over 25 s | ok |
| `route.fetch({ maxRedirects: 0 })` on a 307 | saw 307 | saw 307 | `fulfill` threw on 3xx |
| 400 ms route delay, page load | 438 ms | 604 ms | 505 ms |
| Guard route saw POST `fetch` and `sendBeacon` | yes | yes | yes |
| Pop-up navigation: `req.frame()` | threw | threw | threw |

**Probe 3, the real guard.** `installGuard` from `server/src/browser/guard.ts`:

| Case | Chromium | Firefox | WebKit |
|---|---|---|---|
| Read-only, `target="_blank"` link to an off-list origin | loaded, not blocked | loaded, not blocked | loaded, not blocked |
| Service workers blocked: registration ready, page controlled | no, no | no, no | no, no |
| Service workers allowed: worker's POST to an off-list origin | blocked by the route | worker never controlled the page | **reached the site, not blocked** |
| Transact POST, 303 to the same origin | followed | followed | `fulfill` threw; page hung; POST reached the site |
| Transact POST, 303 to an off-list origin | followed off-site, not blocked | followed off-site, not blocked | as above |

**Probe 4, Firefox rotate.** A 390×844 context, `setViewportSize` to 844×390: no options, ok in 135 ms; `hasTouch` only, ok in 35 ms; `isMobile` only, hung over 15 s; `isMobile` and `hasTouch`, hung. Upstream issue #43028 reports a `setViewportSize` hang in headed Firefox; this one is headless and tied to `isMobile`, and no matching issue was found.

**Probe 5, memory.** PSS from `/proc/<pid>/smaps_rollup`, summed over the browser's process tree. Results in 9.2.

**Not probed:** branded Chrome and Edge (not installed, download blocked), any real device (no USB, no KVM), any device cloud (outside network blocked), WebKit on macOS, the `_android` API, and every vendor price.
