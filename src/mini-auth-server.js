const express = require("express");
const app = express();
const port = 5173;

app.get("/callback", (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send("Missing code");
  }

  res.send(`
    <script>
      window.opener.postMessage(${JSON.stringify(code)}, "*");
      window.close();
    </script>
  `);
});

app.listen(port, () => {
  console.log("Mini auth server running on http://localhost:5173");
});
