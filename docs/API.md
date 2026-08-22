# Chat Application API — reference

This documents the API as it actually behaves, written after exercising every
endpoint against the live server (`https://frontend-task-chatapp.onrender.com`)
with `curl`. Two things pushed me to verify live rather than transcribe the
provided material:

- The hosted **Swagger UI** at `/docs/` is an unconfigured default install —
  its `swagger-initializer.js` still points at `https://petstore.swagger.io/v2/swagger.json`,
  not this API. It renders, but it documents the Swagger Petstore demo, not
  this service. Not usable as a source.
- The provided **Postman collection**'s "negative" example responses are, in
  most cases, copies of the same body as the adjacent positive example
  (same 200/201 payload, just relabeled) rather than a captured error. Its
  request bodies and endpoints are accurate; its example *responses* for
  error cases generally aren't.

Everything below is what the server actually returned. Where the collection
disagreed with reality, that's called out explicitly.

## Base URL

```
https://frontend-task-chatapp.onrender.com/api
```

The Postman collection's `baseUrl` variable is set to the origin **without**
`/api`, which 404s on every request. The collection's own top-level
description mentions "the `/api` REST base" in passing (contrasting it with
where Socket.IO connects) — the variable itself just doesn't include it.
Every request below needs the `/api` prefix.

Socket.IO, conversely, connects at the **root origin** (no `/api`) — confirmed
via a raw Engine.IO handshake (`GET /socket.io/?EIO=4&transport=polling`
returns 200 at the root, 404 under `/api`).

## Auth

`POST /auth/login` returns a JWT. Send it as `Authorization: Bearer <token>`
on every other endpoint. There's no refresh flow — a token is valid until it
expires (the sample decodes to a 7-day lifetime).

## Error shape

Consistent across every endpoint:

```json
{ "error": { "message": "human-readable message", "code": "MACHINE_CODE" } }
```

Validation errors (400) additionally include a `details` array:

```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [{ "path": "name", "message": "name is required" }]
  }
}
```

Codes observed: `VALIDATION_ERROR` (400), `FORBIDDEN` (403), `NOT_FOUND` (404),
`NO_TOKEN` (401, missing/invalid bearer token).

---

## `POST /auth/login`

Logs in an existing phone number, or registers a new one automatically —
there's no separate sign-up endpoint.

**Body**

| field | type   | required | notes                                             |
| ----- | ------ | -------- | -------------------------------------------------- |
| phone | string | yes      | Not format-validated server-side — any non-empty string is accepted (confirmed: `"abc"` returns 200). |
| name  | string | yes      | Required even for an existing phone (400 `VALIDATION_ERROR` if omitted). Not confirmed whether it updates the stored name for a returning user or is ignored — treat it as "the name shown from now on" to be safe. |

**Response `200`**

```json
{
  "token": "eyJ...",
  "user": { "_id": "...", "name": "Ada Lovelace", "phone": "+15551234567", "createdAt": "..." }
}
```

## `GET /auth/me`

Returns the authenticated user. `401 NO_TOKEN` if the bearer token is
missing/invalid.

```json
{ "_id": "...", "name": "Ada Lovelace", "phone": "+15551234567", "createdAt": "..." }
```

## `GET /users/search?q=`

Finds users by name/phone substring. **`q` is optional** — omitting it
returns the entire user directory (confirmed live), not an error or an empty
list. Client-side, treat an empty/short query as "don't search yet" rather
than relying on the API to guard this.

**Response `200`** — a bare array (not wrapped in `{ data: [...] }`):

```json
[{ "_id": "...", "name": "Ada Lovelace", "phone": "+15551234567" }]
```

## `GET /conversations`

Every conversation (direct + group) the authenticated user is part of.

**Response `200`**

```json
{ "data": [ /* see below */ ] }
```

Each item's shape depends on `type`, and the two types are populated
**inconsistently**:

```jsonc
// type: "group"
{
  "_id": "...", "type": "group", "name": "Project Team",
  "createdBy": "...", "admins": ["..."],
  "participants": [{ "_id": "...", "name": "...", "phone": "..." }],
  "lastMessage": { "text": "...", "sender": "...", "createdAt": "..." }, // or {} if no messages yet
  "updatedAt": "..."
}

// type: "direct"
{
  "_id": "...", "type": "direct",
  "participant": { "_id": "...", "name": "...", "phone": "..." }, // the OTHER user only, singular
  "lastMessage": { "text": "...", "sender": "...", "createdAt": "..." },
  "updatedAt": "..."
}
```

Notes:
- Direct items have no `name`/`admins`/`createdBy` (not applicable); group
  items have `participants` (plural, includes you) where direct items have
  `participant` (singular, excludes you) — genuinely different shapes per
  `type`, not just optional fields.
- **`createdAt` is absent from every item in this list response** (present
  on the individual mutation endpoints below, just not here).
- `lastMessage` is `{}` (empty object, not `null`/absent) for a conversation
  with no messages yet.

## `POST /conversations` — start a direct conversation

**Body**: `{ "userId": "<other user's id>" }`

**Response `201`** — deliberately under-populated compared to the list
endpoint above:

```json
{ "_id": "...", "participants": ["<my id>", "<their id>"], "createdAt": "..." }
```

No `type`, no `updatedAt`, and `participants` here is a **raw two-id array**,
not the populated `participant` object the list endpoint returns. If you need
to render this conversation immediately (before the next `GET /conversations`
refetch), don't trust this response for participant details — you already
have the full user object from whichever `/users/search` result the caller
picked, so use that instead of re-deriving it from this response.

## `POST /conversations/group` — create a group

**Body**: `{ "name": string, "participantIds": string[] }`

`participantIds` must contain **at least 3 users** — confirmed live via
`400 VALIDATION_ERROR`, `"a group needs at least 3 members"`. This isn't
mentioned anywhere in the provided material (the collection's own example
body uses only 2). Minimum group size is therefore 4 (you + 3).

**Response `201`** — fully populated, unlike the direct-create response above:

```json
{
  "_id": "...", "type": "group", "name": "Project Team",
  "createdBy": "<my id>", "admins": ["<my id>"],
  "participants": [{ "_id": "...", "name": "...", "phone": "..." }, ...],
  "createdAt": "...", "updatedAt": "..."
}
```

This same shape (no `lastMessage`) is returned by every group-mutating
endpoint below.

## `PATCH /conversations/:id` — rename a group

**Body**: `{ "name": string }`. Admins only — `403 FORBIDDEN`,
`"Only admins can rename the group"` otherwise (confirmed live). `404` for an
unknown id.

**Response `200`**: same group shape as create.

## `POST /conversations/:id/participants` — add members

**Body**: `{ "userIds": string[] }`. Admins only. **Response `200`**: same
group shape.

## `DELETE /conversations/:id/participants/:userId` — remove a member

Admins can remove anyone; passing your own id lets you leave the group
yourself (there's no separate "leave" endpoint — this doubles as one, per
the collection's own description). **Response `200`**: same group shape.

## `POST /conversations/:id/admins` — promote to admin

**Body**: `{ "userId": string }`. Admins only. **Response `200`**: same group
shape.

## `GET /conversations/:id/messages?limit=&before=`

Paginated message history, **newest-first** within a page.

**Response `200`**:

```json
{ "messages": [{ "_id": "...", "conversation": "...", "sender": "...", "text": "...", "createdAt": "..." }], "hasMore": true }
```

`before` is a message `_id` — the cursor to fetch older messages from. Two
bugs found by paginating live data:

- **The cursor is inclusive.** Fetching `?before=<id of the oldest message
  you already have>` returns that same message again as the *newest* item of
  the next page, instead of starting strictly before it. Client code must
  de-dupe merged pages by `_id`.
- **`hasMore` can read `true` one page past the real end.** With exactly 3
  messages in a conversation, a `limit=2` page 2 (using the message-2 id as
  `before`) returned `[message 2, message 1]` with `hasMore: true`, even
  though message 1 is the oldest message that exists. Don't trust `hasMore`
  alone to stop pagination — if a page adds zero *new* (non-duplicate) ids,
  treat that as the end regardless of the flag.

## `POST /messages` — send a message

**Body**: `{ "conversationId": string, "text": string }`.

**The server does not reject an empty `text`** — confirmed live, `text: ""`
returns `200` and creates the message. "Empty messages shouldn't be
sendable" (per the assignment) is therefore a client-only rule; nothing on
the server backs it up.

**Response `201`**:

```json
{ "_id": "...", "conversation": "...", "sender": "...", "text": "...", "createdAt": "..." }
```

## Socket.IO

Connect at the root origin (see "Base URL" above), with the JWT in the
handshake `auth`:

```js
io("https://frontend-task-chatapp.onrender.com", { auth: { token } })
```

| Direction | Event | Payload |
| --- | --- | --- |
| client → server | `message:send` | `{ conversationId, text }` |
| server → client | `message:new` | the created message |
| server → client | `conversation:updated` | the updated conversation, fired on group create/rename/membership/admin changes |

This app sends messages over REST (`POST /messages`) rather than emitting
`message:send`, so it gets a typed response with the real message id to
reconcile against the optimistic bubble it already rendered; it only
_listens_ on the socket for `message:new`/`conversation:updated` to pick up
what other clients did. The server also echoes `message:new` back to the
sender, so the client de-dupes by message id.

Two payload shapes I assumed would match the REST responses turned out not
to, both caught by capturing the raw socket payload in a real two-browser
session rather than trusting the collection's description ("same shape as
REST" isn't stated outright, but nothing suggested otherwise either):

- **`message:new`'s message id field is `id`, not `_id`.** The REST send
  response and the paginated history both use `_id`, like every other
  resource in this API. The socket push for that exact same message uses
  `id` instead — and its `createdAt` is a **numeric epoch-ms timestamp**,
  not the ISO string REST sends. Normalizing this without checking both
  field names silently produced messages with `id: undefined`, which is a
  quietly bad bug: nothing throws immediately, but a `Message` with
  `id: undefined` breaks React's list `key`s (a real "two children with
  the same key"-shaped warning first tipped me off) and defeats the
  socket/REST de-dupe entirely — every incoming message this happens to
  looks "new" forever.
- **The `conversation:updated` push for a newly-*created* group omits
  `createdAt` and `updatedAt` entirely**, even though the matching REST
  create response includes both and the `conversation:updated` push for
  every *other* group action (rename, add/remove participant, promote)
  includes them too. Since the sidebar sorts by `updatedAt`, an
  unguarded `new Date(undefined)` here threw `RangeError: Invalid time
  value` and took down the conversation list. Confirmed by capturing the
  raw payload for a create vs. a rename side by side — genuinely just the
  create push that's short two fields, not a client-side mistake.

Both are handled by normalizing defensively (accept either id field; treat a
missing timestamp as "now" rather than crashing) instead of assuming the
API is internally consistent about its own wire format.
