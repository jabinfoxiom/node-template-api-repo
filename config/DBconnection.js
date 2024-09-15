const mongoose = require("mongoose");
const User = require("../model/User");
module.exports.connect = async () => {
  try {
    const uri = process.env.DB_URL;
    mongoose.set("strictQuery", false);
    mongoose
      .connect(
        uri,
        { dbName: process.env.DB_NAME },
        { useNewUrlParser: true, useUnifiedTopology: true }
      )
      .then(() => {
        console.log(`Connected to the database ${process.env.DB_NAME}`);
      });

    const user = await User.findOne({ role: "super_admin" }).catch((err) => {
      console.error("Error connecting to the database:", err);
    });
    if (!user) {
      await User({
        name: "Super admin",
        email: "superadmin@gmail.com",
        password: "12345",
        role: "super_admin",
      })
        .save()
        .catch((err) => {
          console.error("Error connecting to the database:", err);
        });
    }
  } catch (error) {
    console.log("Database connection error \n", error);
    return false;
  }
};
