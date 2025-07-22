import { simulation, constantUsersPerSec, global, scenario, getParameter, pause, exec, repeat, regex } from "@gatling.io/core";
import { http, ws } from "@gatling.io/http";

export default simulation((setUp) => {
  // Load VU count from system properties
  // Reference: https://docs.gatling.io/guides/passing-parameters/
  const vu = parseInt(getParameter("vu", "1"));

  const httpProtocol = http
  .baseUrl("http://localhost:3000")
  .acceptHeader("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
  .doNotTrackHeader("1")
  .acceptLanguageHeader("en-US,en;q=0.5")
  .acceptEncodingHeader("gzip, deflate")
  .userAgentHeader("Gatling2")
  .wsBaseUrl("ws://localhost:3000");

const scn = scenario("WebSocket")
  .exec(
    http("Home").get("/"),
    pause(1),
    exec(session => session.set("id", "Gatling" + session.userId())),
    ws("Connect WS").connect("/"),
    pause(1),
    repeat(5, "i").on(
      ws("Say Hello WS")
        .sendText("{\"text\": \"Hello, I'm #{id} and this is message #{i}!\"}")
        .await(30).on(
          ws.checkTextMessage("checkName").check(regex("(.*)"))
        )
    ),
    pause(1),
    ws("Close WS").close()
  );
  setUp(
    scn.injectOpen(constantUsersPerSec(2).during(15))
  ).protocols(httpProtocol);
});
