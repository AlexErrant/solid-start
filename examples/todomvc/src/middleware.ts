import { createMiddleware } from "@solidjs/start/middleware";

export default createMiddleware({
  onBeforeResponse: [
    event => {
      event.response.headers.set("Set-Cookie", "myCookie=someValueMaybeAUsername;");
    }
  ]
});
