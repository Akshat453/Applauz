require("dotenv").config();

const { app } = require("./app");
const port = process.env.PORT || 5055;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
