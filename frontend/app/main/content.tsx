"use client"
import React from 'react';
import { motion } from "motion/react";
import { Globe, BookOpen, LayersIcon, Repeat2 } from "lucide-react";

const steps = [
    {
        icon: Globe,
        title: "Learn the alphabet and phonetics",
        description: "Get familiar with how the language sounds before attempting words. Correct pronunciation from day one prevents bad habits.",
    },
    {
        icon: BookOpen,
        title: "Build your core vocabulary",
        description: "Learn the 600 most common words to cover 80% of everyday conversation. Use the spaced repetition system to lock them in.",
    },
    {
        icon: LayersIcon,
        title: "Create your personal decks",
        description: "Add words specific to your goals — travel, business, or culture. Use the conjugation flashcards to study grammar. Your decks grows with you as your needs evolve.",
    },
    {
        icon: Repeat2,
        title: "Review and retain long-term",
        description: "Use scheduled reviews to fight forgetting. The algorithm spaces reviews optimally so you never over-study or under-study.",
    },
];

const stepTransition = (i: number) => ({
    duration: 0.35,
    type: "spring" as const,
    damping: 16,
    stiffness: 100,
    delay: i * 0.25,
});

const MainContent = () => {
    return (
        <div className="min-h-screen md:pl-20 flex flex-col py-16 md:py-8 px-4 sm:px-8 md:px-16 box-border mx-0 sm:mx-6 md:mx-20">
            <motion.h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 md:mb-16 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, type: "spring", damping: 16, stiffness: 100 }}
            >
                Steps for your{" "}
                <span className="italic bg-gradient-to-tr to-complement2 from-complement bg-clip-text text-transparent">
                    language learning
                </span>{" "}
                journey
            </motion.h1>

            <motion.div
                className="flex-1 flex items-center"
            >
                <div className="w-full">

                    {/* Mobile steps — vertical list */}
                    <div className="flex flex-col gap-6 md:hidden">
                        {steps.map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={i}
                                    className="flex items-start gap-4"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={stepTransition(i)}
                                >
                                    <div className="w-10 h-10 shrink-0 rounded-full bg-surface border border-border flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-contrastDark" />
                                    </div>
                                    <div className="flex flex-col gap-1 pt-1">
                                        <span className="text-sm font-semibold text-neutral-100">{step.title}</span>
                                        <span className="text-xs text-neutral-400 leading-relaxed">{step.description}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Desktop steps — horizontal timeline */}
                    <div className="hidden md:block">

                        {/* Above content row */}
                        <div className="flex flex-row">
                            {steps.map((step, i) => {
                                const isAbove = i % 2 === 0;
                                return (
                                    <div
                                        key={i}
                                        className="flex-1 flex flex-col items-center justify-end pb-8 text-center px-3 min-h-[120px] lg:min-h-[160px]"
                                    >
                                        {isAbove && (
                                            <motion.div
                                                className="flex flex-col items-center gap-1"
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={stepTransition(i)}
                                            >
                                                <span className="text-sm md:text-base font-semibold text-neutral-100">
                                                    {step.title}
                                                </span>
                                                <span className="text-xs md:text-sm text-neutral-400 leading-relaxed max-w-[150px] lg:max-w-[180px]">
                                                    {step.description}
                                                </span>
                                            </motion.div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Nodes row with connecting line */}
                        <div className="relative flex flex-row">
                            <div
                                className="absolute top-1/2 left-[12.5%] right-[12.5%] h-px -translate-y-1/2 bg-gradient-to-r from-contrast to-contrast/40"
                                aria-hidden="true"
                            />
                            {steps.map((step, i) => {
                                const Icon = step.icon;
                                return (
                                    <div key={i} className="flex-1 flex justify-center">
                                        <motion.div
                                            className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center z-10 relative"
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={stepTransition(i)}
                                        >
                                            <Icon className="w-5 h-5 text-contrastDark" />
                                        </motion.div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Below content row */}
                        <div className="flex flex-row">
                            {steps.map((step, i) => {
                                const isBelow = i % 2 === 1;
                                return (
                                    <div
                                        key={i}
                                        className="flex-1 flex flex-col items-center justify-start pt-8 text-center px-3 min-h-[120px] lg:min-h-[160px]"
                                    >
                                        {isBelow && (
                                            <motion.div
                                                className="flex flex-col items-center gap-1"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={stepTransition(i)}
                                            >
                                                <span className="text-sm md:text-base font-semibold text-neutral-100">
                                                    {step.title}
                                                </span>
                                                <span className="text-xs md:text-sm text-neutral-400 leading-relaxed max-w-[150px] lg:max-w-[180px]">
                                                    {step.description}
                                                </span>
                                            </motion.div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                    </div>

                </div>
            </motion.div>
        </div>
    );
};

export default MainContent;
