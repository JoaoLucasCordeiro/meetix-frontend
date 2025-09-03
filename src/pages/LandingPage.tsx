import About from "@/components/shared/landing-page/About"
import Hero from "@/components/shared/landing-page/Hero"

const LandingPage = () => {
  return (
    <main className="min-h-screen flex flex-col">
      <Hero />
      <About/>
    </main>
  )
}

export default LandingPage