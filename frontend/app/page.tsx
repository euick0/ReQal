import Header from "@/components/header";
import Content from "@/app/content";
import HeroSection from "@/app/heroSection";
import Footer from "@/app/footer";

const Home = () => {
    return (
        <>
            <Header/>
            <main className="overflow-x-hidden">
                <HeroSection/>
                <Content/>

                <Footer/>
            </main>
        </>
    );
};

export default Home;