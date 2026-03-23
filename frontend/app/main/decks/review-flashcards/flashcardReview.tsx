"use client"

import React from "react"
import Image from "next/image"
import clsx from "clsx"
import {toast} from "sonner"
import {Card} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {
    AudioPlayerButton,
    AudioPlayerDuration,
    AudioPlayerProgress,
    AudioPlayerProvider,
    AudioPlayerTime,
    useAudioPlayer,
} from "@/components/ui/audio-player"
import {FlashcardRow, ConjugationFlashcardRow} from "@/lib/backendUtils"
import {Skeleton} from "@/components/ui/skeleton"
import {
    GetDueFlashcards,
    GetDueConjugationFlashcards,
    UpdateFlashcardReview
} from "@/lib/backendUtils"

// ---------------------------------------------------------------------------
// Local types
// ---------------------------------------------------------------------------

type DueFlashcard = FlashcardRow & {ease: number}
type DueConjugationFlashcard = ConjugationFlashcardRow & {ease: number}

type ReviewCard =
    | {type: "regular"; variant: 1 | 2 | 3; data: DueFlashcard}
    | {type: "conjugation"; variant: 1 | 2 | 3; data: DueConjugationFlashcard}

// ---------------------------------------------------------------------------
// SM-2 (Pass / Fail only)
// ---------------------------------------------------------------------------

function computeNextReview(reviewDate: string, ease: number, passed: boolean) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const due = new Date(reviewDate)
    due.setHours(0, 0, 0, 0)

    // How many days overdue the card was (0 if due today)
    const daysSinceDue = Math.max(0, Math.floor((today.getTime() - due.getTime()) / 86_400_000))
    // Treat the current interval as at least 1 day
    const currentInterval = daysSinceDue + 1

    let newEase: number
    let newInterval: number

    if (passed) {
        newEase = Math.min(3800, ease + 150)
        newInterval = Math.max(1, Math.round((currentInterval * ease) / 1000))
    } else {
        newEase = Math.max(1300, ease - 200)
        newInterval = 1
    }

    const nextDate = new Date(today)
    nextDate.setDate(nextDate.getDate() + newInterval)

    return {
        newEase,
        newReviewDate: nextDate.toISOString().split("T")[0],
    }
}

// ---------------------------------------------------------------------------
// Queue builder — expands each card into pathway-driven variants then shuffles
// ---------------------------------------------------------------------------

function buildQueue(
    regular: DueFlashcard[],
    conjugation: DueConjugationFlashcard[]
): ReviewCard[] {
    const queue: ReviewCard[] = []

    for (const card of regular) {
        queue.push({type: "regular", variant: 1, data: card})
        if (card.pathway >= 2) queue.push({type: "regular", variant: 2, data: card})
        if (card.pathway >= 3) queue.push({type: "regular", variant: 3, data: card})
    }

    for (const card of conjugation) {
        queue.push({type: "conjugation", variant: 1, data: card})
        if (card.pathway >= 2) queue.push({type: "conjugation", variant: 2, data: card})
        if (card.pathway >= 3) queue.push({type: "conjugation", variant: 3, data: card})
    }

    // Fisher-Yates shuffle
    for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[queue[i], queue[j]] = [queue[j], queue[i]]
    }

    return queue
}

// ---------------------------------------------------------------------------
// Shared sub-components
// ---------------------------------------------------------------------------

// Inner component that triggers autoplay; must live inside AudioPlayerProvider
function AudioAutoplay({track}: {track: {id: string; src: string; data: object}}) {
    const player = useAudioPlayer()

    React.useEffect(() => {
        player.play(track).catch(() => {
            // Browser autoplay policy may silently block this — that's fine
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [track.id])

    return null
}

function AudioRow({src, id}: {src: string; id: string}) {
    const track = React.useMemo(() => ({id, src, data: {}}), [id, src])
    return (
        <AudioPlayerProvider>
            <AudioAutoplay track={track}/>
            <div className="flex items-center gap-4 w-4/5">
                <AudioPlayerButton className="bg-primary [&>svg]:invert" item={track}/>
                <AudioPlayerProgress className="flex-1"/>
                <AudioPlayerTime/>
                <AudioPlayerDuration/>
            </div>
        </AudioPlayerProvider>
    )
}

function ImageWithSkeleton({src, isSingle}: {src: string; isSingle: boolean}) {
    const [loaded, setLoaded] = React.useState(false)
    return (
        <div
            className={clsx(
                "relative w-full overflow-hidden rounded",
                isSingle ? "h-96" : "h-64"
            )}
        >
            {!loaded && <Skeleton className="absolute inset-0 rounded"/>}
            <Image
                alt="Flashcard image"
                src={src}
                fill
                className="object-contain"
                priority
                onLoad={() => setLoaded(true)}
                onError={() => { setLoaded(true); toast.error("Failed to load image") }}
            />
        </div>
    )
}

function ImageGrid({paths, caption}: {paths: string[] | null; caption: string | null}) {
    if (!paths?.length) return null
    const isSingle = paths.length === 1
    return (
        <div className="w-full">
            <div
                className={clsx(
                    "grid gap-3 w-full p-4 pb-1",
                    isSingle ? "grid-cols-1" : "grid-cols-2"
                )}
            >
                {paths.slice(0, 4).map((src, i) => (
                    <ImageWithSkeleton key={i} src={src} isSingle={isSingle}/>
                ))}
            </div>
            {caption && <p className="text-xl text-center pb-2">{caption}</p>}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Card panel renderers — Front / Back per variant
// ---------------------------------------------------------------------------

// ---- Regular flashcard ----

function RegularFront({card, variant}: {card: DueFlashcard; variant: 1 | 2 | 3}) {
    if (variant === 1) {
        // Image → Word: show image + caption
        return (
            <div className="flex flex-col items-center w-full gap-2">
                <ImageGrid paths={card.image_paths} caption={card.image_caption}/>
            </div>
        )
    }

    if (variant === 2) {
        // Word → Image: show word + IPA + gender + audio + translation caption
        return (
            <div className="flex flex-col items-center gap-3">
                <p className="text-center">
                    <span className="text-2xl">{card.translated_word} </span>
                    {card.IPA_translation && (
                        <span className="text-2xl">/{card.IPA_translation}/</span>
                    )}
                    {card.gender && (
                        <span className="text-2xl"> {card.gender}</span>
                    )}
                </p>
                {card.audio_path && <AudioRow src={card.audio_path} id={`audio-${card.id}-front`}/>}
                {card.translation_caption && (
                    <p className="text-xl">{card.translation_caption}</p>
                )}
            </div>
        )
    }

    // variant 3 — Spelling: IPA + gender + audio + images
    return (
        <div className="flex flex-col items-center gap-3">
            <p className="text-2xl font-semibold">How do you spell this?</p>
            <div className="flex items-center gap-4">
                {card.IPA_translation && (
                    <span className="text-xl italic">/{card.IPA_translation}/</span>
                )}
                {card.gender && <span className="text-xl text-muted-foreground">{card.gender}</span>}
            </div>
            {card.audio_path && <AudioRow src={card.audio_path} id={`audio-${card.id}-front`}/>}
            <ImageGrid paths={card.image_paths} caption={null}/>
        </div>
    )
}

function RegularBack({card, variant}: {card: DueFlashcard; variant: 1 | 2 | 3}) {
    if (variant === 1) {
        // Back: word + IPA + gender + audio + translation caption
        return (
            <div className="flex flex-col items-center gap-3">
                <p className="text-center">
                    <span className="text-2xl">{card.translated_word} </span>
                    {card.IPA_translation && (
                        <span className="text-2xl">/{card.IPA_translation}/</span>
                    )}
                    {card.gender && (
                        <span className="text-2xl"> {card.gender}</span>
                    )}
                </p>
                {card.audio_path && <AudioRow src={card.audio_path} id={`audio-${card.id}-back`}/>}
                {card.translation_caption && (
                    <p className="text-xl">{card.translation_caption}</p>
                )}
            </div>
        )
    }

    if (variant === 2) {
        // Back: image + caption
        return <ImageGrid paths={card.image_paths} caption={card.image_caption}/>
    }

    // variant 3 — Back: just the word
    return <p className="text-3xl font-bold">{card.translated_word}</p>
}

// ---- Conjugation flashcard ----

function ConjugationFront({card, variant}: {card: DueConjugationFlashcard; variant: 1 | 2 | 3}) {
    if (variant === 1) {
        // Image → Word: phrase with blank + image + caption
        return (
            <div className="flex flex-col items-center w-full gap-3">
                <p className="text-2xl text-center">{card.phrase}</p>
                <ImageGrid paths={card.image_paths} caption={card.image_caption}/>
            </div>
        )
    }

    if (variant === 2) {
        // Word → Image: missing word + IPA + gender + audio + translation caption
        return (
            <div className="flex flex-col items-center gap-3">
                <p className="text-center">
                    <span className="text-2xl">{card.missing_word} </span>
                    {card.IPA_translation && (
                        <span className="text-2xl">/{card.IPA_translation}/</span>
                    )}
                    {card.gender && (
                        <span className="text-2xl"> {card.gender}</span>
                    )}
                </p>
                {card.audio_path && <AudioRow src={card.audio_path} id={`audio-${card.id}-front`}/>}
                {card.translation_caption && (
                    <p className="text-xl">{card.translation_caption}</p>
                )}
            </div>
        )
    }

    // variant 3 — Spelling: prompt + phrase + IPA + audio + images
    return (
        <div className="flex flex-col items-center gap-3">
            <p className="text-2xl font-semibold">How do you spell this?</p>
            <p className="text-xl text-center">{card.phrase}</p>
            <div className="flex items-center gap-4">
                {card.IPA_translation && (
                    <span className="text-xl italic">/{card.IPA_translation}/</span>
                )}
                {card.gender && <span className="text-xl text-muted-foreground">{card.gender}</span>}
            </div>
            {card.audio_path && <AudioRow src={card.audio_path} id={`audio-${card.id}-front`}/>}
            <ImageGrid paths={card.image_paths} caption={null}/>
        </div>
    )
}

function ConjugationBack({card, variant}: {card: DueConjugationFlashcard; variant: 1 | 2 | 3}) {
    if (variant === 1) {
        // Back: missing word + IPA + gender + audio + translation caption
        return (
            <div className="flex flex-col items-center gap-3">
                <p className="text-center">
                    <span className="text-2xl">{card.missing_word} </span>
                    {card.IPA_translation && (
                        <span className="text-2xl">/{card.IPA_translation}/</span>
                    )}
                    {card.gender && (
                        <span className="text-2xl"> {card.gender}</span>
                    )}
                </p>
                {card.audio_path && <AudioRow src={card.audio_path} id={`audio-${card.id}-back`}/>}
                {card.translation_caption && (
                    <p className="text-xl">{card.translation_caption}</p>
                )}
            </div>
        )
    }

    if (variant === 2) {
        // Back: phrase + image + caption
        return (
            <div className="flex flex-col items-center w-full gap-3">
                <p className="text-2xl text-center">{card.phrase}</p>
                <ImageGrid paths={card.image_paths} caption={card.image_caption}/>
            </div>
        )
    }

    // variant 3 — Back: just the missing word
    return <p className="text-3xl font-bold">{card.missing_word}</p>
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function FlashcardReview() {
    const [cards, setCards] = React.useState<ReviewCard[]>([])
    const [index, setIndex] = React.useState(0)
    const [isAnswerShown, setIsAnswerShown] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        ;(async () => {
            const [regular, conjugation] = await Promise.all([
                GetDueFlashcards(),
                GetDueConjugationFlashcards(),
            ])

            if (regular.error || conjugation.error) {
                setError("Failed to load cards. Please try again.")
                setIsLoading(false)
                return
            }

            const queue = buildQueue(regular.data ?? [], conjugation.data ?? [])
            setCards(queue)
            setIsLoading(false)
        })()
    }, [])

    const handleAnswer = async (passed: boolean) => {
        const current = cards[index]
        const table = current.type === "regular" ? "flashcards" : "conjugation_flashcards"
        const {newEase, newReviewDate} = computeNextReview(
            current.data.review_date!,
            current.data.ease,
            passed
        )

        // Fire-and-forget — don't block UI on network call
        UpdateFlashcardReview(current.data.id, table, newReviewDate, newEase).catch(console.error)

        setIsAnswerShown(false)
        setIndex(i => i + 1)
    }

    // ---- Loading ----
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-xl text-muted-foreground">Loading cards…</p>
            </div>
        )
    }

    // ---- Error ----
    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-xl text-destructive">{error}</p>
            </div>
        )
    }

    // ---- Empty ----
    if (cards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <p className="text-3xl font-semibold">No cards due for review</p>
                <p className="text-muted-foreground">Come back later or create more flashcards.</p>
            </div>
        )
    }

    // ---- Session complete ----
    if (index >= cards.length) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <p className="text-3xl font-semibold">Session complete!</p>
                <p className="text-muted-foreground">You reviewed {cards.length} card{cards.length !== 1 ? "s" : ""}.</p>
                <Button size="lg" className="text-white" onClick={() => { setIndex(0); setIsAnswerShown(false) }}>
                    Review again
                </Button>
            </div>
        )
    }

    // ---- Active review ----
    const current = cards[index]
    const total = cards.length
    const progress = Math.round((index / total) * 100)

    const front =
        current.type === "regular" ? (
            <RegularFront card={current.data} variant={current.variant}/>
        ) : (
            <ConjugationFront card={current.data} variant={current.variant}/>
        )

    const back =
        current.type === "regular" ? (
            <RegularBack card={current.data} variant={current.variant}/>
        ) : (
            <ConjugationBack card={current.data} variant={current.variant}/>
        )

    return (
        <>
            {/* Progress bar */}
            <div className="w-full px-80 pt-15">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Card {index + 1} / {total}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                    <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{width: `${progress}%`}}
                    />
                </div>
            </div>

            {/* Cards */}
            <div className="flex flex-row items-stretch w-full px-80 py-10 h-[calc(100vh-160px)] justify-between gap-10">
                {/* Front card */}
                <Card className="flex-1 flex flex-col items-center justify-center bg-input/10 p-6 overflow-y-auto max-h-full">
                    {front}
                </Card>

                {/* Back card — shown after "Show Answer" */}
                {isAnswerShown && (
                    <Card className="flex-1 flex flex-col items-center justify-center bg-input/10 p-6 overflow-y-auto max-h-full">
                        {back}
                    </Card>
                )}
            </div>

            {/* Buttons */}
            {!isAnswerShown ? (
                <div className="flex justify-center items-center w-full absolute bottom-0 mb-10">
                    <Button size="lg" className="text-white" onClick={() => setIsAnswerShown(true)}>
                        Show Answer
                    </Button>
                </div>
            ) : (
                <div className="flex flex-row absolute bottom-0 mb-10 gap-4 justify-center items-center w-full">
                    <Button
                        className="min-w-24 bg-red-700 hover:bg-red-800 text-white"
                        size="lg"
                        onClick={() => handleAnswer(false)}
                    >
                        Fail
                    </Button>
                    <Button
                        className="min-w-24 bg-green-700 hover:bg-green-800 text-white"
                        size="lg"
                        onClick={() => handleAnswer(true)}
                    >
                        Pass
                    </Button>
                </div>
            )}
        </>
    )
}
