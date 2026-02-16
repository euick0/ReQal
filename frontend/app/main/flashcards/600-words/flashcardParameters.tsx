"use client"

import React from 'react';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"
import {Item, ItemContent, ItemDescription, ItemTitle} from "@/components/ui/item";
import {Input} from "@/components/ui/input";
import {Field, FieldLabel} from "@/components/ui/field";
import {Button} from "@/components/ui/button";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";
import ImageParameter from "@/app/main/flashcards/600-words/imageParameter";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {
    AudioPlayerButton,
    AudioPlayerDuration,
    AudioPlayerProgress,
    AudioPlayerProvider,
    AudioPlayerTime
} from "@/components/ui/audio-player";
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import ProgressDialog from "@/app/main/flashcards/600-words/progressDialog";
import {FlashcardContext} from "@/app/main/flashcards/600-words/flashcardPreviews";

const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
    "Portuguese",
    "Russian",
    "Italian",
    "Korean"
]

const pathways = [
    {pathName: "1st path", pathDescription: "What's the image called?"},
    {pathName: "2nd path", pathDescription: "All of the above + What's the word about?"},
    {
        pathName: "3rd path",
        pathDescription: "All of the above + How do you spell this?"
    }
]

const track = {
    id: "track-1",
    src: "/audio/exampleAudio.mp3",
    data: {}
}

//TODO add status for each word, word list fix
const FlashcardParameters = () => {
    const pathContext = React.useContext(FlashcardContext);
    
    if (!pathContext) {
        throw new Error("FlashcardParameters must be used within PathsContext.Provider");
    }
    
    const {
        translatedWord,
        setTranslatedWord,
        translatedWordGender,
        setTranslatedWordGender,
        imagePath,
        setImagePath,
        audioPath,
        setAudioPath,
        imageCaption,
        setImageCaption,
        translationCaption,
        setTranslationCaption,
        IPATranslation,
        setIPATranslation,
        pathway,
        setPathway
    } = pathContext;

    const wordList = [
        "actor", "adjective", "adult", "afternoon", "air", "airport", "alive", "animal",
        "apartment", "apple", "April", "arm", "army", "art", "artist", "attack (noun)",
        "August", "author (noun)", "baby", "back (body)", "back (direction)", "bad", "bag (noun)", "ball",
        "banana", "band (music)", "bank", "bar (location)", "bathroom", "beach", "beard", "beat (verb)",
        "beautiful", "bed", "bedroom", "beef", "beer", "bend (verb)", "beverage", "bicycle",
        "big/large", "bill (noun)", "billion", "bird", "black", "blind (adjective)", "blood", "blue",
        "boat", "body", "bone", "book", "bottle", "bottom", "box (noun)", "boy",
        "brain", "bread", "break (verb)", "breakfast", "bridge (noun)", "brother", "brown", "build (verb)",
        "building", "burn (verb)", "bus", "buy (verb)", "cake", "call (verb)", "camera", "camp (noun)",
        "car", "card", "carry (verb)", "cat", "catch (verb)", "ceiling", "cell phone", "centimeter",
        "chair (noun)", "cheap", "cheese", "chicken", "child", "church", "circle (noun)", "city",
        "clay", "clean (adjective)", "clean (verb)", "clock", "close (verb)", "clothing", "club (the location)", "coat (noun)",
        "coffee", "cold", "color (noun)", "computer", "consonant", "contract (noun)", "cook (verb)", "cool (adjective)",
        "copper", "corn", "corner (noun)", "count (verb)", "country (United States, Spain)", "court", "cow", "crowd (noun)",
        "cry (verb)", "cup", "curved", "cut (verb)", "dance (verb)", "dark", "date (May 7)", "daughter",
        "day", "dead", "deaf", "death", "December", "deep", "diamond", "die (verb)",
        "dig (verb)", "dinner", "direction", "dirty", "disease", "doctor", "dog", "dollar",
        "door", "dot", "down", "draw (verb)", "dream (noun)", "dress (noun)", "drink (verb)", "drive (verb)",
        "drug (noun)", "dry", "dust (noun)", "ear", "Earth", "east", "eat (verb)", "edge",
        "egg", "eight", "eighteen", "eighty", "election", "electronics", "eleven", "energy",
        "engine", "evening", "exercise (noun)", "expensive", "explode (verb)", "eye (noun)", "face (noun)", "fall (season)",
        "fall (verb)", "family", "famous", "fan (electric)", "fan (sport)", "farm (noun)", "fast", "father",
        "February", "feed (verb)", "female", "fifteen", "fifth (5th)", "fifty", "fight (verb)", "find (verb)",
        "finger", "fire (noun)", "first (1st)", "fish (noun)", "five", "flat (adjective)", "floor", "flower",
        "fly (verb)", "follow (verb)", "food", "foot (body part)", "foot (measurement)", "forest", "fork", "forty",
        "four", "fourteen", "fourth (4th)", "Friday", "friend", "front", "game", "garden",
        "gasoline", "gift", "girl", "glass", "go (verb)", "God", "gold", "good",
        "grandfather", "grandmother", "grass", "gray", "green", "ground", "grow (verb)", "gun",
        "hair", "half", "hand", "hang (verb)", "happy", "hard", "hat", "he",
        "head", "healthy", "hear (a sound)", "heart", "heat (noun)", "heaven", "heavy", "hell",
        "high", "hill", "hole", "horse",
        "hospital", "hot", "hotel", "hour", "house", "human", "hundred", "husband",
        "I", "ice", "image", "inch", "injury", "inside", "instrument (musical)", "island",
        "it", "January", "job", "juice", "July", "jump (verb)", "June", "key",
        "kill (verb)", "kilogram", "king", "kiss (verb)", "kitchen", "knee", "knife", "lake",
        "lamp", "laptop", "laugh (verb)", "lawyer", "leaf", "learn (verb)", "left (direction)", "leg",
        "lemon", "letter", "library", "lie down (verb)", "lift (verb)", "light (/dark)", "light (/heavy)", "light (noun)",
        "lip", "listen (music) (verb)", "location", "lock (noun)", "long", "loose", "lose (verb)", "loud",
        "love (verb)", "low", "lunch", "magazine", "male", "man", "manager", "map",
        "March", "market", "marriage", "marry (verb)", "material", "May", "mean (/nice)", "medicine",
        "melt (verb)", "metal", "meter", "milk", "million", "minute", "mix/stir (verb)", "Monday",
        "money", "month", "moon", "morning", "mother", "mountain", "mouse", "mouth",
        "movie", "murder (noun)", "music", "narrow", "nature", "neck", "needle", "neighbor",
        "network", "new", "newspaper", "nice", "night", "nine", "nineteen", "ninety",
        "no", "north", "nose", "note (on paper)", "November", "nuclear", "number", "ocean",
        "October", "office", "oil", "old (/new)", "old (/young)", "one", "open (verb)", "orange (color)",
        "orange (food)", "outside", "page", "pain",
        "paint", "pants", "paper", "parent", "park (location)", "pass (verb)", "patient (noun)", "pattern",
        "pay (verb)", "peace", "pen", "pencil", "person", "photograph", "piece", "pig",
        "pink", "plane", "plant (noun)", "plastic", "plate", "play (verb)", "player", "pocket",
        "poison (noun)", "police", "pool", "poor", "pork", "pound (weight)", "pray (verb)", "president",
        "price", "priest", "prison", "program (computer)", "pull (verb)", "push (verb)", "queen", "quiet",
        "race (ethnicity)", "race (sport)", "radio", "rain (noun)", "red", "religion", "reporter", "restaurant",
        "rice", "rich", "right (direction)", "ring", "river", "roof", "room (in a house)", "root",
        "run (verb)", "sad", "salt", "sand", "Saturday", "school", "science", "screen",
        "sea", "season", "second (2nd)", "second (time)", "secretary", "see (a bird)", "seed", "sell (verb)",
        "September", "seven", "seventeen", "seventy", "sex (gender)", "sex (the act)", "shake (verb)", "shallow",
        "she", "ship", "shirt", "shoes", "shoot (a gun)", "short (long)", "short (vs. tall)", "shoulder",
        "sick", "side", "sign (noun)", "sign (verb)", "silver", "sing (verb)", "sister", "sit (verb)",
        "six", "sixteen", "sixty", "skin", "skirt", "sky", "sleep (verb)", "slow",
        "small/little", "smell (verb)", "smile (verb)", "snow (noun)", "soap", "soft", "soil/earth", "soldier",
        "son", "song", "sound", "soup", "south", "space (outer space)", "speak/say (verb)", "spoon",
        "sport", "spring (season)", "square", "stain",
        "stand (verb)", "star", "stone", "stop (verb)", "store/shop", "straight", "street/road", "strong",
        "student", "sugar", "suit (noun)", "summer", "sun", "Sunday", "sweat (noun)", "swim (verb)",
        "T-shirt", "table", "tall", "taste (verb)", "tea", "teach (verb)", "teacher", "team",
        "tear (drop)", "technology", "telephone", "television", "temperature", "ten", "theater", "they",
        "thick", "thin", "think (verb)", "third (3rd)", "thirteen", "thirty", "thousand", "three",
        "throw (verb)", "Thursday", "ticket (train)", "tight", "time (noun)", "tire (of a car)", "toe", "tongue",
        "tool", "tooth", "top", "touch (verb)", "town", "train (noun)", "train station", "transportation",
        "tree", "truck", "Tuesday", "turn (verb)", "twelve", "twenty", "twenty-one (etc.)", "two",
        "ugly", "university", "up", "valley", "verb", "victim", "voice (noun)", "vowel",
        "waiter", "wake up (verb)", "walk (verb)", "wall", "war", "warm (adjective)", "wash (verb)", "watch (TV) (verb)",
        "water (noun)", "wave (ocean)", "we", "weak", "wear (verb)", "wedding", "Wednesday", "week",
        "weight", "west", "wet (adj.)", "white", "wide", "wife", "win (verb)", "wind (noun)",
        "window", "wine", "wing", "winter", "woman", "wood", "work (verb)", "world",
        "write (verb)", "yard", "year", "yellow", "yes", "you (singular/ plural)", "young", "zero"
    ];


    return (
        <div className="box-border pt-17 pr-0 pl-9  w-full overflow-y-hidden ">
            <ScrollArea className="w-full h-[calc(100vh-70px)] overflow-auto overflow-x-visible">
                <Field className="w-auto pr-6">
                    <div className="">
                        <Combobox items={languages}>
                            <ComboboxInput placeholder="Select a language" className="w-64 mb-4"/>
                            <ComboboxContent>
                                <ComboboxEmpty>No items found.</ComboboxEmpty>
                                <ComboboxList>
                                    {(item) => (
                                        <ComboboxItem key={item} value={item}>
                                            {item}
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>

                        <div className="flex gap-2">
                            <Combobox
                                items={pathways}
                                itemToStringValue={(pathway: (typeof pathways)[number]) => pathway.pathName}
                                itemToStringLabel={(pathway: (typeof pathways)[number]) => pathway.pathName}>
                                <ComboboxInput placeholder="Select a pathway" className="w-64 mb-4"/>
                                <ComboboxContent>
                                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                                    <ComboboxList>
                                        {(pathway) => (
                                            <ComboboxItem key={pathway.pathDescription} value={pathway}>
                                                <Item size="sm" className="p-0">
                                                    <ItemContent>
                                                        <ItemTitle className="whitespace-nowrap">
                                                            {pathway.pathName}
                                                        </ItemTitle>
                                                        <ItemDescription className="whitespace-pre-line">
                                                            {pathway.pathDescription}
                                                        </ItemDescription>
                                                    </ItemContent>
                                                </Item>
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>

                            <HoverCard openDelay={100} closeDelay={200}>
                                <HoverCardTrigger><Button variant="outline" size="icon">
                                    ?
                                </Button>
                                </HoverCardTrigger>
                                <HoverCardContent side="right" align="center">
                                    <h5 className="font-bold">1st Path</h5>
                                    <p className="text-sm">For easy languages and reviewing ones that you have
                                        already
                                        learnt</p>
                                    <h5 className="font-bold">2nd Path</h5>
                                    <p className="text-sm">For new intermediate level languages</p>
                                    <h5 className="font-bold">3rd Path</h5>
                                    <p className="text-sm">For hard languages (especially those with logograms)</p>
                                </HoverCardContent>
                            </HoverCard>
                        </div>

                        <div>
                            <Input className="w-96 mb-4 mr-2" placeholder="Translated word"
                                   value={translatedWord}
                                   onChange={({target}) => setTranslatedWord(target.value)}/>
                            <Input className="w-20 mb-4 mr-2" placeholder="Gender"
                                   value={translatedWordGender}
                                   onChange={({target}) => setTranslatedWordGender(target.value)}/>
                            <Input className="w-70 mb-4" placeholder="IPA translation"
                                   value={IPATranslation}
                                   onChange={({target}) => setIPATranslation(target.value)}/>
                        </div>

                        <ImageParameter>
                            <div className="ml-3 mt-3">
                                <FieldLabel htmlFor="customImage" className="mb-1">Or choose your own
                                    image...</FieldLabel>
                                <Input className="w-96 mb-4" placeholder="Or choose your own image" type="file"
                                       id="customImage"
                                       accept="image/*"
                                       multiple={true}/>
                            </div>
                        </ImageParameter>
                        <div
                            className="w-full flex flex-col bg-primary-foreground rounded-lg mb-4 border-sidebar-border border">
                            <AudioPlayerProvider>
                                <div className="flex items-center gap-4 p-4">
                                    <AudioPlayerButton className="bg-primary  [&>svg]:invert" item={track}/>
                                    <AudioPlayerProgress className="flex-1 "/>
                                    <AudioPlayerTime/>
                                    <AudioPlayerDuration/>
                                </div>
                            </AudioPlayerProvider>

                            <FieldLabel htmlFor="customAudio" className="mb-1 ml-4">Or choose your own audio
                                file...</FieldLabel>
                            <Input className="w-96 mb-4 ml-4" placeholder="Or choose your audio file" type="file"
                                   id="customAudio"
                                   accept="audio/*"
                                   multiple={true}/>
                        </div>
                        <div className="flex items-center">
                            <Input className="w-70 mb-4 mr-2" placeholder="Optional: Image caption"
                                   value={imageCaption}
                                   onChange={({target}) => setImageCaption(target.value)}/>
                            <Input className="w-70 mb-4" placeholder="Optional: Translation caption"
                                   value={translationCaption}
                                   onChange={({target}) => setTranslationCaption(target.value)}/>
                        </div>
                        <div>
                            <Button className="text-white mr-4" size="default" type="submit">Create</Button>
                            <Button className="text-white" variant="ghost" size="default">Edit Last</Button>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="text-white mr-4" variant="ghost"
                                            size="default">Progress</Button>
                                </DialogTrigger>
                                <DialogContent className="w-300 h-100">
                                    <DialogHeader className="">
                                        <DialogTitle className="mb-5">57 out of 604 completed</DialogTitle>
                                        <ProgressDialog words={wordList}/>
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </Field>
                <ScrollBar className="absolute pl-8"></ScrollBar>
            </ScrollArea>
        </div>
    )
};

export default FlashcardParameters;
