import express, { urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import hpp from "hpp";
import rateLimit from "express-rate-limit";

const app = express();

app.use(helmet());

app.use(compression());

app.use(morgan("dev"));
app.use(hpp());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running 🚀",
  });
});

import notFound from "./middlewares/notFound.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import authRoutes from "./routes/auth.routes.js";
import addressRoutes from "./routes/address.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import orderRoutes from "./routes/order.routes.js";

import adminProductRoutes from "./routes/admin/product.routes.js";
import adminOrderRoutes from "./routes/admin/order.routes.js";
import adminDashboardRoutes from "./routes/admin/adminDashboard.routes.js";

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);

app.use(notFound);
app.use(errorMiddleware);

export default app;
