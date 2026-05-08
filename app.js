const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");
const cookieParser = require("cookie-parser");

const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
// 1) Global Middlewares

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://unpkg.com",
          "https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.min.js",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://*.tile.openstreetmap.org",
          "https://tile.openstreetmap.org",
          "https://api.tinyfox.dev/img?animal=fox",
        ],
        connectSrc: [
          "'self'",
          "https://unpkg.com",
          "https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.min.map",
        ],
        styleSrc: [
          "'self'",
          "https://unpkg.com",
          "https://fonts.googleapis.com",
          "'unsafe-inline'",
        ],
        fontSrc: ["'self'", "https:", "data:", "https://fonts.gstatic.com"],
      },
    },
  }),
);

// Logging if in Dev
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`You are in DEV`);
}

// Limit requests from same IP via API
const limiter = rateLimit({
  max: 100,
  windowMs: 3600 * 1000, //1 hour
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Data sanitisation against NoSQL query injections
app.use(mongoSanitize());

// Data sanitisation against cross-site scripting attacks (XSS)
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  }),
);

// Serving static files
//app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, "public")));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.cookies);
  next();
});

// Routes

app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
