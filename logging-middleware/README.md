# @app/logging-middleware

Reusable logging client and Express middleware that posts logs to the evaluation service.

Usage (backend):

```ts
import { initLogger, Log, expressLogger } from "@app/logging-middleware";

initLogger({
  baseURL: "http://20.244.56.144",
  // Either provide an accessToken (preferred for frontend) or backend credentials to auto-fetch.
  email: process.env.EVAL_EMAIL!,
  name: process.env.EVAL_NAME!,
  rollNo: process.env.EVAL_ROLL!,
  accessCode: process.env.EVAL_ACCESS_CODE!,
  clientID: process.env.EVAL_CLIENT_ID!,
  clientSecret: process.env.EVAL_CLIENT_SECRET!,
});

app.use(expressLogger());

await Log("backend", "info", "service", "app started");
```

Usage (frontend):

```ts
import { initLogger, Log } from "@app/logging-middleware";

initLogger({ accessToken: import.meta.env.VITE_LOG_TOKEN });
await Log("frontend", "info", "page", "shortener page mounted");
```

