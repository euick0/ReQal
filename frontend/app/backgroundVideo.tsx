import { motion, useTransform, MotionValue } from "motion/react";

interface BackgroundVideoProps {
    scrollYProgress: MotionValue<number>;
}

const BackgroundVideo = ({ scrollYProgress }: BackgroundVideoProps) => {
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

    return (
        <motion.div
            style={{ y }}
            className="absolute top-0 w-full h-full -z-10 overflow-hidden"
        >
            <video
                src="/videos/Video%20Reqal%20Background.mp4"
                autoPlay
                muted
                loop
                className="object-cover w-full h-full"
            />
            <div className="bg-black/50 w-full h-full absolute top-0 left-0" />
        </motion.div>
    );
};

export default BackgroundVideo;
