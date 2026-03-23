import { motion, useTransform, MotionValue } from "motion/react";

interface HeroTextProps {
    scrollYProgress: MotionValue<number>;
}

const HeroText = ({ scrollYProgress }: HeroTextProps) => {
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);

    return (
        <motion.div
            style={{ y}}
            initial={{ opacity: 0}}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, type: "spring", damping: 12, stiffness: 50 }}
            className="w-full h-full flex flex-col items-center justify-center overflow-hidden"
        >
            <h1 className="text-center text-6xl font-semibold">Learn any language</h1>
            <h1 className="text-center text-6xl font-bold p-1 bg-gradient-to-tr from-primary to-complement bg-clip-text text-transparent pb-5">
                Travel wherever you want
            </h1>
        </motion.div>
    );
};

export default HeroText;
