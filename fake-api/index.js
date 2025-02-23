const jsonServer = require("json-server");
const pause = require("connect-pause");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
//커스텀 db 사용하려면 아래 내용 생성하고 주석 풀기
// const customDb = require("./customDb/index.js");
// const router = jsonServer.router(customDb);
const middleWares = jsonServer.defaults();

server.use(middleWares);


// POST, PUT and PATCH 핸들러, body-parser 사용해야함.
// 이러면 json 서버에서 바디파서 사용할 수 있음.
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  console.log("req.url :>> ", req.url);
  switch (req.method) {
    case "POST":
      req.body.createdAt = Date.now();
      break;
    case "GET":
      console.log("req.query :>> ", req.query);
      console.log("req.params :>> ", req.params);
      const page = req.query._page || req.query.page;
      if (!!page && page.trim().length !== 0) {
        req.query._page = page;
      }
      const size = req.query._limit || req.query.size;
      if (!!size && size.trim().length !== 0) {
        req.query._limit = size;
      }
      break;
    default:
      break;
  }
  // Continue to JSON Server router
  next();
});
server.get("/api/users/:email/exists", (req, res, next) => {
  console.log("1. req.params :>> ", req.params);
  const { email } = req.params;
  const db = router.db; // LowDB 인스턴스 사용
  const usersContent = db.get("users.content");
  res.json({ result: usersContent.some((row) => row.email === email).value() });
});


server.use(pause(50));
server.use(jsonServer.rewriter({
  "/api/users/*/exists": "/users?email=$1",
  "/api/auth/me": "/me",
  "/api/*": "/$1",
}));


server.use(router);


const port = Number(process.env.SERVER_PORT || 8080);
server.listen(
  port,
  () => {
    console.log(`Go to http://localhost:${port}/`)
  }
);

