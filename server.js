const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const dotenv = require("dotenv");
const morgan = require("morgan");
const path = require("path");
const chatRoutes = require("./src/routes/chatRoutes");
const {
  initializePropertiesData,
} = require("./src/controllers/chatController");

dotenv.config();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

initializePropertiesData().then(() => {
  console.log("Property data loaded successfully");
});

app.use("/chat", chatRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
