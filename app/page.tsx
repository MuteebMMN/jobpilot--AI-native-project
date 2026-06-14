import { cookies } from "next/headers";
import { Hero } from "@/components/homepage/Hero";
import { Features } from "@/components/homepage/Features";
import { Testimonial } from "@/components/homepage/Testimonial";
import { BottomCTA } from "@/components/homepage/BottomCTA";

export default async function Home() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has("insforge_logged_in");

  return (
    <main>
      <Hero isLoggedIn={isLoggedIn} />
      <Features />
      <Testimonial />
      <BottomCTA isLoggedIn={isLoggedIn} />
    </main>
  );
}
