const express = require('express');
const path = require('path');
const app = express();

const rootDir = __dirname;

// EJS setup
app.set('view engine', 'ejs');
app.set('views', 'views');

// ✅ Serve static files first
app.use(express.static(path.join(rootDir, 'public')));

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Local Routes
const userRouter = require("./routes/userRouter");
const hostRouter = require("./routes/hostRouter");
const errorController = require("./controllers/errors");

app.use(userRouter);
app.use(hostRouter);

// 404 handler (always last)
app.use(errorController.PageNotFound);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
