const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Order = require("./models/Order");
const Product = require("./models/Product");
const User = require("./models/User");

dotenv.config();

const demoProducts = [
    {
        name: "[Demo] Everyday Backpack",
        description: "A lightweight backpack with a padded laptop compartment.",
        price: 2499,
        category: "Accessories",
        stock: 25,
        imageUrl: "https://placehold.co/600x600/png?text=Everyday+Backpack",
        rating: 4.5,
        numReviews: 12
    },
    {
        name: "[Demo] Wireless Headphones",
        description: "Comfortable wireless headphones for work and travel.",
        price: 3999,
        category: "Electronics",
        stock: 18,
        imageUrl: "https://placehold.co/600x600/png?text=Wireless+Headphones",
        rating: 4.7,
        numReviews: 24
    },
    {
        name: "[Demo] Ceramic Coffee Mug",
        description: "A durable ceramic mug for your favorite hot drinks.",
        price: 599,
        category: "Home",
        stock: 40,
        imageUrl: "https://placehold.co/600x600/png?text=Ceramic+Mug",
        rating: 4.2,
        numReviews: 8
    },
    {
        name: "[Demo] Cotton T-Shirt",
        description: "A soft, everyday cotton T-shirt.",
        price: 999,
        category: "Clothing",
        stock: 30,
        imageUrl: "https://placehold.co/600x600/png?text=Cotton+T-Shirt",
        rating: 4.4,
        numReviews: 16
    }
];

async function seedDatabase() {
    if (!process.env.MONGO_URL) {
        throw new Error("MONGO_URL is missing. Add it to backend/.env before seeding.");
    }

    await mongoose.connect(process.env.MONGO_URL);

    try {
        const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Admin123!";
        const [admin, customer] = await Promise.all([
            User.findOneAndUpdate(
                { email: "demo.admin@shopnext.local" },
                {
                    $set: {
                        name: "Demo Admin",
                        email: "demo.admin@shopnext.local",
                        password: await bcrypt.hash(adminPassword, 10),
                        role: "admin",
                        verified: true
                    }
                },
                { new: true, upsert: true, runValidators: true }
            ),
            User.findOneAndUpdate(
                { email: "demo.customer@shopnext.local" },
                {
                    $set: {
                        name: "Demo Customer",
                        email: "demo.customer@shopnext.local",
                        password: await bcrypt.hash("Customer123!", 10),
                        role: "user",
                        verified: true
                    }
                },
                { new: true, upsert: true, runValidators: true }
            )
        ]);

        const products = await Promise.all(
            demoProducts.map(({ name, ...product }) =>
                Product.findOneAndUpdate(
                    { name },
                    { $set: { name, ...product } },
                    { new: true, upsert: true, runValidators: true }
                )
            )
        );

        const orderSpecs = [
            {
                paymentId: "demo-payment-1001",
                items: [
                    { productId: products[0]._id, quantity: 1, price: products[0].price },
                    { productId: products[1]._id, quantity: 1, price: products[1].price }
                ],
                totalAmount: products[0].price + products[1].price,
                status: "delivered"
            },
            {
                paymentId: "demo-payment-1002",
                items: [
                    { productId: products[2]._id, quantity: 2, price: products[2].price },
                    { productId: products[3]._id, quantity: 1, price: products[3].price }
                ],
                totalAmount: products[2].price * 2 + products[3].price,
                status: "shipped"
            }
        ];

        await Promise.all(
            orderSpecs.map((order) =>
                Order.findOneAndUpdate(
                    { paymentId: order.paymentId },
                    {
                        $set: {
                            ...order,
                            user: customer._id,
                            address: {
                                fullName: customer.name,
                                street: "123 Demo Street",
                                city: "Sample City",
                                postalCode: "10001",
                                country: "India"
                            }
                        }
                    },
                    { new: true, upsert: true, runValidators: true }
                )
            )
        );

        console.log(`Seeded ${products.length} demo products and 2 demo orders.`);
        console.log("Demo admin: demo.admin@shopnext.local");
        console.log(`Demo admin password: ${adminPassword}`);
        console.log("Demo customer: demo.customer@shopnext.local");
        console.log("Demo customer password: Customer123!");
        console.log("Use these demo accounts only in a local development database.");
        console.log(`Admin account ready: ${admin.email}`);
    } finally {
        await mongoose.disconnect();
    }
}

seedDatabase().catch((error) => {
    console.error("Failed to seed database:", error.message);
    process.exitCode = 1;
});