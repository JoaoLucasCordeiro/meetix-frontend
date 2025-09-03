import About from "@/components/shared/landing-page/About"
import Footer from "@/components/shared/landing-page/Footer"
import Hero from "@/components/shared/landing-page/Hero"
import Team from "@/components/shared/landing-page/Team"

const LandingPage = () => {
  return (
    <main className="min-h-screen flex flex-col">
      <Hero />
      <About/>
      <Team/>
      <Footer/>
    </main>
  )
}

export default LandingPage