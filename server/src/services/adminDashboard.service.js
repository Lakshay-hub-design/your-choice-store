import Order, { ORDER_STATUS } from "../models/Order.js";
import Product from "../models/Product.js";

/**
 * Get the data required for the main admin dashboard.
 */
const getDashboard = async () => {
  /*
   * Run independent database queries in parallel.
   */
  const [
    totalOrders,
    totalProducts,
    pendingOrders,
    lowStockProducts,
    outOfStockProducts,
    revenueResult,
    recentOrders,
    topSellingProducts,
    lowStockItems,
  ] = await Promise.all([
    /*
     * 1. Total orders
     *
     * Includes every order, including cancelled orders,
     * because this represents total orders placed.
     */
    Order.countDocuments(),

    /*
     * 2. Total active/non-archived products
     */
    Product.countDocuments({
      isArchived: false,
    }),

    /*
     * 3. Orders that still require fulfillment.
     */
    Order.countDocuments({
      orderStatus: {
        $in: [
          ORDER_STATUS.PLACED,
          ORDER_STATUS.CONFIRMED,
          ORDER_STATUS.PROCESSING,
          ORDER_STATUS.SHIPPED,
        ],
      },
    }),

    /*
     * 4. Low stock products.
     *
     * Stock must be:
     * > 0
     * <= product's own lowStockThreshold
     *
     * $expr lets us compare two fields.
     */
    Product.countDocuments({
      isArchived: false,
      isActive: true,

      stock: {
        $gt: 0,
      },

      $expr: {
        $lte: ["$stock", "$lowStockThreshold"],
      },
    }),

    /*
     * 5. Out of stock products.
     */
    Product.countDocuments({
      isArchived: false,
      isActive: true,

      stock: {
        $lte: 0,
      },
    }),

    /*
     * 6. Revenue
     *
     * For your current system, DELIVERED orders are
     * the safest definition of completed revenue.
     *
     * Cancelled/pending orders are therefore excluded.
     */
    Order.aggregate([
      {
        $match: {
          orderStatus: ORDER_STATUS.DELIVERED,
        },
      },

      {
        $group: {
          _id: null,

          totalRevenue: {
            $sum: "$pricing.grandTotal",
          },
        },
      },
    ]),

    /*
     * 7. Latest orders
     */
    Order.find()
      .sort({
        createdAt: -1,
      })
      .limit(7)
      .select(
        "orderNumber shippingAddress pricing paymentMethod paymentStatus orderStatus placedAt createdAt items"
      )
      .lean(),

    /*
     * 8. Best-selling products
     */
    Product.find({
      isArchived: false,
      sold: {
        $gt: 0,
      },
    })
      .sort({
        sold: -1,
      })
      .limit(5)
      .select("name slug sku images price stock sold")
      .lean(),

    /*
     * 9. Products requiring inventory attention.
     *
     * This includes low and zero stock.
     */
    Product.find({
      isArchived: false,
      isActive: true,

      $expr: {
        $lte: ["$stock", "$lowStockThreshold"],
      },
    })
      .sort({
        stock: 1,
      })
      .limit(6)
      .select("name slug sku images stock lowStockThreshold")
      .lean(),
  ]);

  const totalRevenue = revenueResult?.[0]?.totalRevenue ?? 0;

  return {
    stats: {
      totalRevenue,
      totalOrders,
      totalProducts,
      pendingOrders,
      lowStockProducts,
      outOfStockProducts,
    },

    recentOrders,

    topSellingProducts,

    lowStockItems,
  };
};

const adminDashboardService = {
  getDashboard,
};

export default adminDashboardService;
