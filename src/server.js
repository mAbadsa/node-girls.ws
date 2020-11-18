const http = require("http");
const router = require("./router");

const server = http.createServer(router);

const port = 3001;

server.listen(port, () => {
    console.log("Server is running on PORT", port);
})