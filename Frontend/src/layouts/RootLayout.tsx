import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";

const RootLayout = () => {
  return (
    <div className="bg-background text-on-background antialiased selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default RootLayout;
