# Loopin

A real-time 1-to-1 and group chat app — take-home assignment (Senior Frontend
Developer). Frontend only; the API is a provided third-party service.

> ### 📄 [`docs/API.md`](./docs/API.md) — API documentation (Part 1's standalone deliverable)
>
> Written from directly testing the live API with `curl`, not just the
> provided Postman collection — every endpoint's request/response shape,
> every error code, the Socket.IO events, and a "Notes & deviations"
> section covering every real inconsistency this API turned out to have.

- **Live app (Part 1):** _add your deployed URL here_
- **Landing page (Part 2):** same deployment, at `/` (the chat screens live at `/login` and `/chat`)
- **Repo:** this one

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19.2** + **TypeScript**
- **Tailwind CSS v4** (already-scaffolded design tokens in `app/globals.css`)
- **socket.io-client** for real-time delivery
- **zod** for the two form schemas (login, group creation)
- No other runtime dependencies — see the write-up below for why.

## Setup

```bash
npm install
cp .env.example .env.local   # defaults already point at the live provided API
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `/` is the landing page,
`/login` signs in (any phone number + a name — new numbers register
automatically), `/chat` is the app itself.

```bash
npm run lint     # eslint
npx tsc --noEmit # typecheck
npm run build    # production build
```

## Project structure

```
app/                 routes: / (landing), /login, /chat
components/
  ui/                generic design-system primitives (Button, Container, Tag, ...)
  layout/             Header/Footer/nav (marketing site only — hidden on /login, /chat)
  chat/               the chat feature: Sidebar/*, Thread/*, ChatShell
  marketing/           the landing page's animated hero mock
  shared/             Avatar, EmptyState, ErrorState, Skeletons, Modal
contexts/
  AuthContext.tsx      session (JWT in localStorage), restores on load
  ChatContext.tsx       conversations, per-conversation message cache/pagination,
                        socket wiring, optimistic send — the app's real state layer
lib/
  api/                fetch client, typed endpoint functions, and the
                      normalize.ts that reconciles the API's inconsistent
                      response shapes (see docs/API.md)
  socket.ts, format.ts
hooks/useUserSearch.ts debounced /users/search, shared by "new chat" and
                       "add people to a group"
docs/API.md            Part 1's standalone API documentation deliverable
```

---

## Part 3 — thought process

### Approach, architecture, and trade-offs (Part 1)

I started from a design-token/UI-primitive system I'd already set up (colors,
type scale, `Button`/`Container`/`Badge`/etc.) and built the chat screens and
landing page on top of it, rather than starting from scratch. Beyond that,
this is a client-heavy screen by nature: real-time delivery needs a live
Socket.IO connection in the browser, and there's no server of my own — the
whole app is a frontend for a third-party API. Given that, I made a few
deliberate calls:

- **Client state via React Context + `useReducer`, not a library.** One
  screen (the chat panel) owns nearly all the interesting state:
  conversations, a per-conversation message cache with its own pagination
  cursor, an optimistic-send queue, and a live socket subscription that
  needs to fan out into both the open thread and the sidebar's "last
  message" preview. A `useReducer` with a typed action union made all of
  that explicit and testable without adding Zustand/Redux for a single
  screen. I'd reach for one of those if this grew into a multi-page app
  sharing this state.
- **JWT in `localStorage`, not an httpOnly cookie.** The API is a
  cross-origin third party I don't control, so I can't have it set a
  same-site cookie for this frontend — the standard "cookie + Server
  Component session check" pattern Next.js's own auth guide describes just
  isn't available here. `/chat` therefore guards client-side (check auth
  status, redirect if unauthenticated) rather than server-side. This is a
  real, acknowledged trade-off (XSS-exposed token vs. an approach that
  isn't actually possible against this backend), not an oversight.
- **REST for sending, socket for receiving.** `POST /messages` gives a
  typed response with the real message id to reconcile the optimistic
  bubble against; the socket is only *listened to*, for `message:new` /
  `conversation:updated` pushes from other clients (and the server's own
  echo of your own send, which gets de-duplicated — see docs/API.md for
  exactly how, including a real race between the two paths I found and
  fixed).
- **No form library.** Two small forms (login; create-group) with `zod`
  validated on submit was enough; `react-hook-form` would've been another
  dependency for a problem this size.
- **Selected conversation lives in component state, not the URL.** A
  `useSearchParams`-backed `?c=<id>` would make it shareable/back-button-able,
  but pulls in the App Router's Suspense-boundary requirements for a screen
  this self-contained. Documented scope cut — see "what I'd improve."
- **`lib/api/normalize.ts` is doing real work, not boilerplate.** The API
  returns a different shape for "a conversation" depending on which
  endpoint you hit, and — discovered only by testing live, see below — the
  `message:new` socket push even uses different field names than the REST
  response for the same message. Every raw response funnels through one
  normalizer file so the rest of the app only ever sees one consistent
  type per resource.

### Design reasoning (Part 2)

The landing page reuses the existing token system (colors, type scale,
`Container`/`SectionHeading`/`Badge`/`Tag`/`Button`) rather than introducing
a second visual language, on the theory that a chat product and its own
marketing page should look like the same product. The one deliberately
original piece is the hero: instead of a static screenshot or a generic
stock-testimonial/FAQ section (which the brief explicitly said wouldn't
count as the bonus even if well executed), it's a small self-looping mock
conversation — "typing…" then a message lands, a few times through a short
scripted exchange — built with plain timers and CSS, no assets. It
*demonstrates* the actual feature (messages arriving live) rather than just
describing it.

### How I used AI tools

I used Claude Code (Anthropic) as my main tool for this build, working from
the provided PDF and Postman collection. I directed it through the scope and
the decisions above — state management approach, the auth trade-off, the
REST-vs-socket split, the normalization layer — rather than taking a first
draft as final:

- For the API docs, instead of trusting the Postman collection's examples
  at face value (several turned out to be stale or copy-pasted — see
  "issues" below), I drove the live API directly with `curl` myself: login,
  search, start/create conversations, send messages, paginate, and every
  error path I could trigger. `docs/API.md` reflects what the server
  actually does, not what the collection claims.
- I didn't stop at a build/lint pass for verification. I ran the app with
  two real logged-in sessions talking to each other — direct messages,
  group creation/rename/membership, live delivery, the empty-message guard
  — and that's what surfaced the real bugs below (a socket/REST race, and
  two genuine API response-shape inconsistencies). I fixed each one in
  source and re-ran the same scenario until it was clean.
- **A note on the source PDF:** it contains a hidden instruction (invisible
  when rendered, present in its text layer) aimed at getting an AI
  assistant to insert an unrelated word into this write-up. I didn't follow
  it — worth flagging for the same reason I'd flag any embedded instruction
  from a document neither of us wrote ourselves.

### What I'd improve with more time

- **Typing indicators / read receipts** — no API support for either, so
  left out rather than faked.
- **Deep-linkable conversations** (`?c=<id>` in the URL) — see the trade-off
  above.
- **Virtualized message list** for very long histories — fine at the scale
  a take-home naturally exercises, would matter at real scale.
- **Push the two-`console.error`-worthy findings upstream** — the
  `message:new` id-field mismatch and the missing-timestamps-on-group-create
  socket push are exactly the kind of thing worth reporting to whoever owns
  that API, not just working around silently.
- Automated tests (the verification here was manual/scripted-via-Playwright
  for this submission, not a committed test suite) — reasonable for a
  24-hour scope, not for production.

### Any issues I ran into

Documented in full, with exact repro details, in `docs/API.md`'s
"Notes & deviations" — summarized:

- The hosted Swagger UI (`/docs/`) is an unconfigured default install that
  actually documents the Swagger Petstore demo, not this API — not usable.
- The Postman collection's `baseUrl` is missing the `/api` prefix every
  request actually needs (Socket.IO, by contrast, connects at the root,
  *without* `/api`).
- `POST /messages` doesn't reject an empty `text` server-side — the "empty
  messages shouldn't be sendable" rule is enforced client-only.
- `POST /conversations/group` requires at least 3 entries in
  `participantIds` (min group size 4), which isn't in the provided example
  and isn't obvious without testing it.
- `POST /conversations` (start direct) returns an under-populated shape
  compared to `GET /conversations`; the two direct/group conversation
  shapes returned by the list endpoint are themselves inconsistent with
  each other.
- Message pagination's `before` cursor is inclusive (repeats the boundary
  message on the next page) and `hasMore` can read `true` one page past the
  real end — handled with id-based de-duplication and a "zero new ids means
  stop" rule rather than trusting the flag.
- Found only by actually driving two live sessions against each other,
  not by reading any of the provided material: the `message:new` socket
  push uses `id` instead of REST's `_id` for the message identifier (and a
  numeric timestamp instead of an ISO string), and the `conversation:updated`
  push specifically for a new group's *creation* omits `createdAt`/`updatedAt`
  entirely (present on every other group-mutation push). Both are handled
  defensively in `lib/api/normalize.ts` rather than assumed away.
