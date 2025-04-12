import mongoose from "mongoose";

export const dbConnection = () => {
  mongoose.connect(process.env.MONGO_URI, {
      dbName: "MERN_STACK_HOSPITAL_MANAGEMENT_SYSTEM_DEPLOYED",
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    }).then(() => {
      console.log("Connected to database");
    }).catch((err) => {
      console.log(`Some error occurred while connecting to the database: ${err}`);
    });
};
