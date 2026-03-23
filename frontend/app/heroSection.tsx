"use client";

import { useRef } from "react";
import { useScroll } from "motion/react";
import BackgroundVideo from "@/app/backgroundVideo";
import HeroText from "@/app/heroText";

const HeroSection = () => {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    return (
        <section ref={ref} className="relative h-screen w-full overflow-hidden">
            <BackgroundVideo scrollYProgress={scrollYProgress} />
            <HeroText scrollYProgress={scrollYProgress} />
        </section>
    );
};

export default HeroSection;
