import App from "./app";
import connectDB from "./config/db";

const app = new App();
connectDB();
app.listen();
