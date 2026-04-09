import Fotter from "@/components/Fotter";
import Navbar from "@/components/Navbar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { initializeReminderScheduler } from "@/lib/courseReminders";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    initializeReminderScheduler();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <Component {...pageProps} />
      <Fotter/>
    </div>
  );
}
