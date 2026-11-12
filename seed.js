
require("dotenv").config();

const mongoose = require("mongoose");

const Category = require("./models/category.model");
const Trip = require("./models/trip.model");
const User = require("./models/user.model");
const Favorite = require("./models/favorite.model");

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        // ================= USERS =================

        const usersData = [
            {
                fullName: "Admin Rehla",
                email: "admin@rehla.com",
                password: "Admin123456",
                phone: "01000000001",
                profileImgPath: "",
                role: "admin",
            },
            {
                fullName: "Ahmed Mohamed",
                email: "ahmed@gmail.com",
                password: "User123456",
                phone: "01000000002",
                profileImgPath: "",
                role: "user",
            },
            {
                fullName: "Sara Ahmed",
                email: "sara@gmail.com",
                password: "User123456",
                phone: "01000000003",
                profileImgPath: "",
                role: "user",
            },
            {
                fullName: "Omar Ali",
                email: "omar@gmail.com",
                password: "User123456",
                phone: "01000000004",
                profileImgPath: "",
                role: "user",
            },
        ];

        const users = {};

        for (const userData of usersData) {
            const user = await User.findOneAndUpdate(
                { email: userData.email },
                {
                    $setOnInsert: userData,
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                }
            );

            users[userData.email] = user._id;
        }

        console.log("Users Seeded Successfully!");
        console.log("Users:", usersData.length);

        // ================= CATEGORIES =================

        const categoriesData = [
            {
                nameEn: "Adventure",
                nameAr: "مغامرات",
                slug: "adventure",
                image:
                    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
                isActive: true,
            },
            {
                nameEn: "Beach",
                nameAr: "شواطئ",
                slug: "beach",
                image:
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
                isActive: true,
            },
            {
                nameEn: "Historical",
                nameAr: "تاريخية",
                slug: "historical",
                image:
                    "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e",
                isActive: true,
            },
            {
                nameEn: "Camping",
                nameAr: "تخييم",
                slug: "camping",
                image:
                    "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d",
                isActive: true,
            },
        ];

        const categories = {};

        for (const item of categoriesData) {
            const category = await Category.findOneAndUpdate(
                { slug: item.slug },
                {
                    $set: item,
                    $setOnInsert: {
                        isDeleted: false,
                    },
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                }
            );

            categories[item.slug] = category._id;
        }

        console.log("Categories Seeded Successfully!");

        // ================= TRIPS =================

        const today = new Date();

        const getDate = (days) => {
            const date = new Date(today);
            date.setDate(date.getDate() + days);
            return date;
        };

        const tripsData = [
            {
                title: "Siwa Oasis Adventure",
                from: "Cairo",
                description:
                    "Explore the beautiful Siwa Oasis, salt lakes and desert landscapes.",
                destination: "Siwa",
                price: 3500,
                capacity: 20,
                availableSeats: 20,
                startDate: getDate(15),
                endDate: getDate(18),
                category: categories.adventure,
                status: "published",
                coverImage:
                    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
                gallery: [],
                included: [
                    "Transportation",
                    "Accommodation",
                    "Breakfast",
                ],
                excluded: ["Personal expenses"],
                cancelPolicy: "Free cancellation before 7 days.",
                days: [
                    {
                        dayNumber: 1,
                        title: "Arrival in Siwa",
                        activities: [
                            {
                                time: "09:00 AM",
                                title: "Arrival",
                                description: "Arrive and check in at the hotel.",
                                location: "Siwa",
                                image: "",
                            },
                            {
                                time: "04:00 PM",
                                title: "Salt Lakes",
                                description: "Enjoy swimming in the salt lakes.",
                                location: "Siwa Salt Lakes",
                                image: "",
                            },
                        ],
                    },
                    {
                        dayNumber: 2,
                        title: "Desert Safari",
                        activities: [
                            {
                                time: "10:00 AM",
                                title: "Desert Safari",
                                description: "Explore the Great Sand Sea.",
                                location: "Great Sand Sea",
                                image: "",
                            },
                        ],
                    },
                ],
            },

            {
                title: "Sharm El Sheikh Beach Trip",
                from: "Cairo",
                description:
                    "Enjoy crystal clear water, beaches and snorkeling in Sharm El Sheikh.",
                destination: "Sharm El Sheikh",
                price: 5000,
                capacity: 25,
                availableSeats: 25,
                startDate: getDate(25),
                endDate: getDate(29),
                category: categories.beach,
                status: "published",
                coverImage:
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
                gallery: [],
                included: ["Hotel", "Transportation", "Breakfast"],
                excluded: ["Snorkeling equipment"],
                cancelPolicy: "Cancellation allowed before 5 days.",
                days: [
                    {
                        dayNumber: 1,
                        title: "Beach Day",
                        activities: [
                            {
                                time: "11:00 AM",
                                title: "Beach Relaxation",
                                description: "Enjoy the beautiful beach.",
                                location: "Sharm El Sheikh",
                                image: "",
                            },
                        ],
                    },
                ],
            },

            {
                title: "Luxor Historical Tour",
                from: "Cairo",
                description:
                    "Discover ancient Egyptian civilization and famous temples.",
                destination: "Luxor",
                price: 4200,
                capacity: 15,
                availableSeats: 15,
                startDate: getDate(35),
                endDate: getDate(38),
                category: categories.historical,
                status: "published",
                coverImage:
                    "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e",
                gallery: [],
                included: ["Transportation", "Tour Guide"],
                excluded: ["Lunch", "Personal expenses"],
                cancelPolicy: "Free cancellation before 3 days.",
                days: [
                    {
                        dayNumber: 1,
                        title: "Explore Luxor",
                        activities: [
                            {
                                time: "09:00 AM",
                                title: "Karnak Temple",
                                description: "Visit the famous Karnak Temple.",
                                location: "Karnak",
                                image: "",
                            },
                        ],
                    },
                ],
            },

            {
                title: "Fayoum Camping Experience",
                from: "Cairo",
                description:
                    "Spend an amazing night camping in the beautiful Fayoum desert.",
                destination: "Fayoum",
                price: 1800,
                capacity: 18,
                availableSeats: 18,
                startDate: getDate(45),
                endDate: getDate(47),
                category: categories.camping,
                status: "published",
                coverImage:
                    "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d",
                gallery: [],
                included: [
                    "Camping Equipment",
                    "Dinner",
                    "Breakfast",
                ],
                excluded: ["Personal expenses"],
                cancelPolicy:
                    "No refund after 2 days before departure.",
                days: [
                    {
                        dayNumber: 1,
                        title: "Camping Day",
                        activities: [
                            {
                                time: "05:00 PM",
                                title: "Camping Setup",
                                description: "Prepare the camping area.",
                                location: "Fayoum",
                                image: "",
                            },
                        ],
                    },
                ],
            },
        ];

        const trips = {};

        for (const tripData of tripsData) {
            const trip = await Trip.findOneAndUpdate(
                { title: tripData.title },
                {
                    $set: {
                        ...tripData,
                        isDeleted: false,
                    },
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                }
            );

            trips[tripData.title] = trip._id;
        }

        console.log("Trips Seeded Successfully!");
        console.log("Trips:", tripsData.length);

        // ================= FAVORITES =================

        const favoritesData = [
            {
                user: users["ahmed@gmail.com"],
                trip: trips["Siwa Oasis Adventure"],
            },
            {
                user: users["ahmed@gmail.com"],
                trip: trips["Luxor Historical Tour"],
            },
            {
                user: users["sara@gmail.com"],
                trip: trips["Sharm El Sheikh Beach Trip"],
            },
            {
                user: users["sara@gmail.com"],
                trip: trips["Fayoum Camping Experience"],
            },
            {
                user: users["omar@gmail.com"],
                trip: trips["Siwa Oasis Adventure"],
            },
        ];

        for (const favoriteData of favoritesData) {
            await Favorite.updateOne(
                {
                    user: favoriteData.user,
                    trip: favoriteData.trip,
                },
                {
                    $setOnInsert: favoriteData,
                },
                {
                    upsert: true,
                    runValidators: true,
                }
            );
        }

        console.log("Favorites Seeded Successfully!");
        console.log("Favorites:", favoritesData.length);

        console.log("\n========== SEED SUMMARY ==========");
        console.log("Users:", usersData.length);
        console.log("Categories:", categoriesData.length);
        console.log("Trips:", tripsData.length);
        console.log("Favorites:", favoritesData.length);
        console.log("==================================");

    } catch (error) {
        console.error("Seeding Error:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB Disconnected");
    }
};

seedData();
