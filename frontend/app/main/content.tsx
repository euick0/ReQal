 "use client"

import React, {useState} from 'react';
import {motion} from "motion/react"
import {Card, CardContent, CardTitle} from "@/components/ui/card";
import {Line, LineChart, XAxis, YAxis} from "recharts";
import {ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart";

const cards = [
    {
        title: "Learn according to your needs",
        content: "Create flashcards with custom words so you learn what you want",
    },
    {
        title: <span>Cover the basics of any language, <span className="italic">fast</span></span>,
        content: "Quickly learn 80% of any language with the most common 600 words",
    },
    {
        title: "Master grammar easily",
        content: "No memorizing entire conjugation charts, just use the power of flashcards",
    },
];

const reviewDays = [1, 2, 4, 10, 16, 24];
const reviewDaySet = new Set(reviewDays);

const stabilityAfterReview: Record<number, number> = {
    0:  1.5,
    1:  2.5,
    2:  5,
    4:  10,
    10: 16,
    16: 22,
    24: 30,
};

const retentionData = Array.from({length: 30}, (_, i) => {
    const day = i + 1;
    const withoutFlashcards = Math.round(100 / (1 + (day - 1) / 1.5));
    let lastReview = 0;
    for (const r of reviewDays) { if (r <= day) lastReview = r; }
    const daysSinceReview = day - lastReview;
    const S = stabilityAfterReview[lastReview] ?? 1.5;
    const withFlashcards = reviewDaySet.has(day) ? 100 : Math.round(100 * Math.exp(-daysSinceReview / S));
    return {day: `Day ${day}`, withoutFlashcards, withFlashcards};
});

const chartConfig = {
    withFlashcards: {label: "With flashcards", color: "#2FA4A9"},
    withoutFlashcards: {label: "Without flashcards", color: "#6b7280"},
};

const containerVariants = {
    hidden: {},
    visible: {transition: {staggerChildren: 0.4}},
};

const cardVariants = {
    hidden: {opacity: 0, y: 200},
    visible: {opacity: 1, y: 0, transition: {duration: 0.6, type: "spring" as const, damping: 12, stiffness: 50}},
};

const fadeVariants = {
    hidden: {opacity: 0},
    visible: {opacity: 1, transition: {duration: 0.6}},
};

const Content = () => {
    const [flipped, setFlipped] = useState([false, false, false]);
    const toggle = (i: number) => setFlipped(f => f.map((v, idx) => idx === i ? !v : v));

    return (
        <>
            <motion.div initial={{opacity: 0, y: 200}} whileInView={{opacity: 1, y: 0}}
                        transition={{duration: 0.6, type: "spring", damping: 12, stiffness: 50}}
                        viewport={{margin: "0px 0px -150px 0px"}}
                        className="relative z-1 mx-10 -mt-26 overflow-hidden">
                <Card className=" mx-32 bg-backgroundLight border-0">
                    <CardContent>
                        <h2 className="text-5xl font-bold text-center my-8">Flashcards that grow with <span
                            className="bg-gradient-to-tr from-contrast to-contrastDark bg-clip-text text-transparent">your</span> progress
                        </h2>
                    </CardContent>
                    <motion.div className="flex flex-row gap-8 mx-8 h-full"
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{margin: "0px 0px -150px 0px"}}>
                        {cards.map((card, i) => (
                            <motion.div key={i} className="flex-1"
                                        variants={cardVariants}
                                        whileHover={{rotate: -2}}>
                                <div style={{perspective: 1000}} className="h-120 cursor-pointer"
                                     onClick={() => toggle(i)}>
                                    <motion.div
                                        animate={{rotateY: flipped[i] ? 180 : 0}}
                                        transition={{duration: 0.6, type: "spring", damping: 14, stiffness: 60}}
                                        style={{transformStyle: "preserve-3d", position: "relative", height: "100%"}}
                                    >
                                        <div style={{backfaceVisibility: "hidden", position: "absolute", inset: 0}}>
                                            <Card
                                                className="bg-background border-0 h-full flex items-center justify-center">
                                                <CardTitle
                                                    className="mx-auto text-3xl text-center px-6">{card.title}</CardTitle>
                                            </Card>
                                        </div>
                                        <div style={{
                                            backfaceVisibility: "hidden",
                                            transform: "rotateY(180deg)",
                                            position: "absolute",
                                            inset: 0
                                        }}>
                                            <Card
                                                className="bg-background border-0 h-full flex items-center justify-center ">
                                                <CardContent
                                                    className="mx-auto text-2xl text-center px-6">{card.content}</CardContent>
                                            </Card>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </Card>
            </motion.div>
            <motion.div className="h-135 z-10 mx-18 my-20 flex flex-row gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{margin: "0px 0px -150px 0px"}}>

                <motion.div variants={fadeVariants} className="flex-3/5">
                    <Card className="bg-backgroundLight border-0 p-6 flex flex-col gap-4 h-full">
                        <div>
                            <h3 className="text-2xl font-bold text-neutral-100">Retention over time</h3>
                            <p className="text-neutral-400 mt-1">Flashcards vs wihtout</p>
                        </div>
                        <ChartContainer config={chartConfig} className="flex-1 min-h-0 w-full">
                            <LineChart data={retentionData}>
                                <XAxis
                                    dataKey="day"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{fill: "#9ca3af", fontSize: 12}}
                                    ticks={[...reviewDays.map(d => `Day ${d}`), "Day 30"]}
                                />
                                <YAxis domain={[0, 100]} hide/>
                                <ChartTooltip content={
                                    <ChartTooltipContent
                                        indicator="line"
                                        formatter={(value, name, item) => (
                                            <>
                                                <div className="shrink-0 rounded-[2px] w-1 self-stretch"
                                                     style={{backgroundColor: item.color}}/>
                                                <div className="flex flex-1 justify-between leading-none items-center">
                                                    <span className="text-muted-foreground">
                                                        {chartConfig[name as keyof typeof chartConfig]?.label ?? name}
                                                    </span>
                                                    <span className="ml-8 font-mono font-medium text-foreground tabular-nums">{value}%</span>
                                                </div>
                                            </>
                                        )}
                                    />
                                }/>
                                <Line dataKey="withoutFlashcards" stroke="var(--color-withoutFlashcards)" strokeWidth={2}
                                      dot={false}/>
                                <Line dataKey="withFlashcards" stroke="var(--color-withFlashcards)" strokeWidth={2}
                                      dot={false}/>
                            </LineChart>
                        </ChartContainer>
                    </Card>
                </motion.div>
                <motion.div variants={fadeVariants} className="flex-2/5">
                    <Card className="bg-backgroundLight border-0 h-full">
                        <div className="flex flex-col justify-center ml-28 flex-1">
                            <CardTitle
                                className="text-left text-[150px] bg-gradient-to-tr from-complement2 to-complement bg-clip-text text-transparent left-0 relative">
                                3x
                            </CardTitle>
                            <CardContent className="text-xl left-0 relative text-left mx-0! px-0 text-neutral-200 pr-32 font-semibold">
                                More retention long term by using flashcards compared to cramming words
                            </CardContent>
                        </div>
                    </Card>
                </motion.div>

            </motion.div>
        </>

    );
};

export default Content;
