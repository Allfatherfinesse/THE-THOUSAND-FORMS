# App publication and full-screen update

## Live app

https://thousand-forms-ashen-courtyard.ezcookings.chatgpt.site

The user's 2026-11-13 request to make this playable as an app like HIGH WATER
authorized publishing the prepared private game. HIGH WATER was inspected only;
no HIGH WATER files or hosting settings were changed.

Native private publication succeeded on **2026-11-13 at 02:46:46 UTC**. The current
audience is owner-only, with no groups or external viewers.

- Site: `appgprj_6af64b53873c8191a5464b24bcd1694f`
- Saved version: **1**,
  `appgprj_6af64b53873c8191a5464b24bcd1694f~appgver_d7a2cfde9f0c8191ac3bd782b154f782`
- Deployment: `appgdep_6af67a0d84748191b6f368b5a09af4fd`
- Deployed source: `4b88352604dd607a2a54a50ba94717bd95ab26d4`
- Native status: `succeeded`

This is the tested browser version prepared on 2026-11-12. It already fills its
container and resizes with the host, so it can be opened in the app's expanded
view. It does not yet contain the explicit in-game full-screen button added below.

## New source update, not yet hosted

The newer `Browser/` source adds an explicit full-screen button, app manifest/icons,
input cleanup on full-screen/resize/focus changes, Escape-to-exit-and-pause, touch
pointer ownership/cancellation, and preservation of paused state. Rejected full-
screen requests show a fallback instruction while keeping the game usable.

Uploading that update is currently blocked by the Sites credential service:

> Sites Git is not yet enabled for this client. Use a hosted Work session, or try
> again with the latest Codex and Sites plugin after rollout.

The returned code was `sites_git_client_upgrade_required` (`CONFLICT`, HTTP 409).
An ordinary Git check also required credentials; no authentication bypass was
attempted. The already-saved artifact could be deployed independently, which is
why the playable link above is live while the full-screen update remains source-
only. Do not claim these newer files are the deployed version.

When Sites source access is available, reuse this Site ID and owner-only audience,
push the exact new source, package it, then save/deploy the new version. Do not
create a replacement Site or upload changed assets under the old commit SHA.
