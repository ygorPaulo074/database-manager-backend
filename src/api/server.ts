import Express = require("express");

const app = Express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
  console.log("Press Ctrl+C to stop the server");
  console.log("Visit http://localhost:3000 in your browser");
});
