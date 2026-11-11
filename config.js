/* =====================================================================
   EDIT EVERYTHING HERE.
   Photos & audio: put the files in the photos/ and audio/ folders and
   write their paths, e.g. src: "photos/first-date.jpg".
   Leave src as "" to show a placeholder photo.
   Photos are optional everywhere: delete any you don't have. A chapter can
   have 0, 1 or 2 photos and the page fills up with mementos instead.
   An empty filmRoll [] or booth [] hides that part completely.
   stamp = the orange film date stamp, written DD MM 'YY (e.g. "07 10 '26"). Any text works, "" hides it.
   mementos = little extras on each scrapbook page. Types:
     { type: "ticket",  title: "...", date: "...", red: true }
     { type: "receipt", title: "...", date: "...", lines: [["item","price"]], total: "..." }
     { type: "note",    text: "..." }
     { type: "sticker", text: "...", heart: true }
     { type: "tag",     label: "...", text: "..." }
     { type: "chat",    with: "...", date: "...", messages: [["them","..."],["me","..."]] }
     { type: "screenshot", src: "photos/chat.jpg", caption: "..." }   (a real screenshot, framed like a phone)
     { type: "leaf" }
   A photo can also have  arrow: "this one ♡"  for a little hand-drawn
   pointer next to it (best on a page with just one photo).

   WHERE EACH PHOTO GOES (top of the site to the bottom):
     booth          3 black & white strip photos, top of the first screen   any shape, shown cropped & B&W
     cover          the big polaroid on the first screen, ALSO on the       portrait (4:5)
                    front of the book she opens
     chapters       the photos on each scrapbook page                       shape set by ar: "4/5" portrait,
                                                                            "1/1" square, "3/2" landscape
     filmRoll       the sideways film strip on the cork board               landscape (3:2)
     somedayPhoto   the polaroid paper-clipped to the "someday" notebook    square (1:1)
     finalLetter    photo: the polaroid beside the last letter              portrait (4:5)
                    scan:  a photo of your handwritten letter               any
   Tip: every empty photo on the site says "config.js → ..." to show which line it is.
   ===================================================================== */
window.CONFIG = {
    password: "0710",                    // set to "" to remove the lock
    passwordHint: "the day we first got together (day · month)",   // a 4-number password shows as a little combination lock
    wrongAnswers: ["nope ♡ try again", "think harder, i’ll wait", "hmm, do you not remember?? 😤"],   // shown one by one on wrong tries
    lastHint: "it’s the night you said yes (00:55) ♡",   // shown after all the wrong answers above
    postmarkCity: "KATHMANDU",           // the postmark on the envelope
    postmarkDate: "",                    // the date on the postmark, e.g. "14.11.2026" ("" = the day she opens it). Never use your 'since' date: it's the password!
    title: "you & me",                   // the cut-out letters in the hero
    to: "My Love",                         // their name
    from: "Rii",
    since: "07.10.2026",                 // the day you became official (dd.mm.yyyy)
    sinceTime: "00:55",                       // optional exact time it happened, e.g. "18:10" (blank = midnight)
    timeZone: "Asia/Kathmandu",          // the counter, anniversaries and dates follow Kathmandu time wherever it's opened ("" = the phone's own time)
    counter: true,                       // the live "together for" counter in the hero (false to hide)
    // your own special days for the counter to look forward to (every year). "dd.mm" + what to call it.
    // On the day, the counter glows and hearts pop out. Remove the // in front to turn one on.
    specialDays: [
        { date: "08.08", label: "your birthday" },
        // { date: "21.09", label: "our first hangout" },
    ],
    friendsSince: "2025",                // when you became friends (shown on the ticket)
    garden: true,                        // "our little garden": a new tulip every month, each one blooms on your monthly anniversary (false to hide)
    nightMode: true,                     // after 11pm (Kathmandu time) the site dims, stars come out and a goodnight note pops up once a night (false = off)
    nightNote: "it’s late. go to sleep, i’ll still be here tomorrow ♡",
    // her favourite songs, played like a mixtape. Put the files in the audio/ folder.
    // Add as many as you like; they play in order and loop. artist can be left "".
    playlist: [
        { src: "audio/Love-Story.mp3", title: "Love Story", artist: "Taylor Swift" },
        { src: "audio/Blank-Space.mp3", title: "Blank Space", artist: "Taylor Swift" },
        { src: "audio/Putali.mp3", title: "Putali", artist: "The Elements" },
        { src: "audio/Mockingbird.mp3", title: "Mockingbird", artist: "Eminem" }
    ],
    mixtapeTitle: "songs for you",        // handwritten on the big cassette
    autoplayMusic: true,                  // start the mixtape softly when she opens the book
    musicVolume: 0.8,                     // 0 to 1

    bgMusic: true,                       // soft generated music, used only if the playlist above is empty (false = off)
    bgVolume: 0.5,                       // background music volume, 0 to 1

    // PHOTO BOOTH STRIP: the 3 black & white photos at the top left of the first screen (they show in black & white)
    booth: ["photos/2.jpg", "photos/3.jpg", "photos/4.jpg"],                 // top, middle, bottom. Use [] to hide the strip
    // COVER: the big tilted polaroid on the first screen. The same photo is also on the front of the book cover.
    // Best: a portrait photo of her (or of you two). caption = handwriting under it, stamp = orange date in the corner
    cover: { src: "photos/1.jpg", caption: "my favourite person (and me)", stamp: "01 11 '26" },

    // SCRAPBOOK: each chapter is one page. Its photos are taped polaroids on that page.
    // ar = photo shape: "4/5" portrait, "1/1" square, "3/2" landscape (pick the one closest to your photo)
    chapters: [
        {
            title: "how it happened", when: "just friends → us", scrawl: "we had no idea.",
            photos: [   // page 1, left: the mirror selfie from your first hangout, as friends
                { src: "photos/5.JPG", caption: "our first hangout", stamp: "21 09 '26", ar: "3/4" }
            ],
            mementos: [
                // page 1, right: your real screenshot of the texts
                { type: "screenshot", src: "photos/6.jpg", caption: "" },
                { type: "ticket", title: "first hangout · strictly friends", date: "21.09.2026" },
                { type: "note", text: "\"just friends\" (sure.)" },
                { type: "ticket", title: "the text that changed everything", date: "07.10.26 · 00:55", red: true },
                { type: "sticker", text: "07.10<br>00:55" },
                { type: "note", text: "best multiple-choice question I ever asked" }
            ]
        },
        {
            title: "us, now", when: "one month in", scrawl: "only the beginning",
            photos: [   // page 2: first photo on the right, second on the left
                { src: "photos/7.JPG", caption: "the day you got your first flowers", stamp: "01 11 '26", ar: "1/1" },   // shows on the right: a photo from the day you gave her her first flowers
                { src: "photos/8.JPG", caption: "our comfort place, again",     stamp: "12 10 '26", ar: "4/5" }    // shows on the left: the comforting place, your 2nd time there
            ],
            mementos: [
                { type: "ticket", title: "first flowers · from me", date: "01.11.2026", red: true },
                { type: "note", text: "our place, visit no. 2. still feels like home" },
                { type: "sticker", text: "month<br>one!" }
            ]
        },
        {
            title: "things I know about you", when: "a small field guide", scrawl: "I pay attention ♡",
            photos: [],   // page 3: no photos, just the kraft tags (you can add photos here too)
            mementos: [
                { type: "tag", label: "my favourite moment with you", text: "the first time you said i love you" },
                { type: "tag", label: "your comfort song", text: "Love Story (it’s track one for a reason)" },
                { type: "tag", label: "when you’re tired", text: "you go quiet and lean on me" },
                { type: "tag", label: "your favourite flower", text: "tulip (one day)" },
                { type: "tag", label: "the face you make", text: "when we don’t have anything to talk about" },
                { type: "sticker", text: "100%<br>you", heart: true }
            ]
        }
    ],

    // FILM ROLL: the strip of film frames on the cork board, left to right. Landscape photos fit best.
    // Each frame is a path, or { src: "...", caption: "..." } to add a caption. Add as many frames as you like.
    filmRoll: ["photos/9.jpg", "photos/10.jpg", "photos/11.jpg", "photos/12.jpg"],          // use [] to hide the film strip

    reasons: [
        "you were my best friend before anything else",
        "you said yes to a multiple choice question",
        "with you, I never have to pretend",
        "you notice every time I feel off, and you always know how to fix it",
        "you’re the first person I want to tell everything to",
        "you make ordinary days feel like something I’ll remember",
        "you know the worst version of me and still picked me",
        "you make me want to be better without ever asking me to",
        "I don’t just love you. I like who I am when I’m with you",
        "you’re the most lovable person I know, and you make me feel loved in return",
        "you’re strong in ways you don’t give yourself credit for",
        "I’d pick you on every version of every day"
    ],

    letters: [
        { when: "you miss me", body: "Hi, it’s me.\nIf you’re reading this, you miss me. I miss you too, probably more than I say.\nWhen we were just friends, I didn’t notice how much I looked forward to you. Now I notice it every day. You’re the first person I want to talk to when something happens, good or bad.\nSo text me. Even if it’s just a 'hi'. It means more than you think." },
        { when: "you’ve had a long day", body: "Whatever happened today, you did enough.\nAnd when you’re ready, tell me about it. I don’t need you to be okay all the time. I just want to be the person you come to when you’re not." },
        { when: "you can’t sleep", body: "You’re overthinking again, aren’t you.\nHere’s something better to think about instead: remember the day when we confessed to each other.\nI go back to that one when I can’t sleep. It works for me, so maybe it’ll work for you.\nIf it doesn’t, you know I’ll pick up." },
        { when: "you’re bored", body: "Okay, a question for you to think about:\nIf we could go anywhere for one day, just us, where would you pick?\nDon’t overthink it. Text me your answer.\nI already know mine, and I want to see if we pick the same place." },
        { when: "you doubt yourself", body: "I’ve known you long enough to be sure about this.\nYou always think you can’t, and then you do.\nI believe in you, even on the days you don’t." },
        { when: "you need to smile", body: "If you need a reason to smile today, here’s one: you make me really, really happy just by being in my life." }
    ],

    someday: [
        "a long ride together, just the two of us",
        "our first anniversary, 07.10.2027",
        "a lego date",
        "write each other letters and swap them",
        "a photo booth, for this exact strip",
        "make volume two of this book"
    ],

    // SOMEDAY PHOTO: the small square polaroid paper-clipped to the "someday, together" notebook (null to hide)
    somedayPhoto: null,

    finalLetter: {
        showScan: true,  // true = a scanned handwritten note, false = the lined letter paper
        scan: "",        // a photo of your real handwritten letter, e.g. "photos/letter.jpg"
                         // (with showScan on and no photo here, your letter below is written out in ink)
        voice: "",  // you reading it, e.g. "audio/voice.m4a"
        photo: { src: "photos/13.jpg", caption: "us ♡", stamp: "" },   // FINAL PHOTO: the polaroid next to the last letter, with the pressed tulip (null to hide)
        body: "a year ago u were my friend and i had no idea any of this would happen. during that year i never thought i would get so close with you, and then 07.10 happened.\n\nthis past month has honestly been one of the happiest ones for me. i made this little book bcz i wanted u to have something to come back to whenever u miss us.\n\nure my girlfriend, my best friend, the person i wanna share these things with. i love you for you.\n\ni hope one day u see urself the way i see u. not just as someone who is loved, but as someone who deserves every bit of it. u dont have to earn it, u dont have to prove anything. u are worth loving simply bcz u are u.\n\ni think the scariest part of liking u when we both had no idea was the thought of losing someone who was so close to me if i said something. and now i get to have both. u didnt just say yes to me, u trusted me with ur heart and with our friendship at the same time. i will never take that for granted.\n\nthis is only volume one. i cant wait to fill the next pages with u.\n\nand at last i love you so soo much i hope you know that."
    },

    // BOUQUET: a little button at the very end. Tapping it wraps, shakes, unwraps and pops out a bouquet of roses, lilies and tulips. null = off.
    bouquet: {
        button: "one more thing…",               // handwritten on the button
        title: "for you ♡",                      // shown when it pops
        note: "you got your first flowers on 01.11. these ones never wilt ♡"   // on the kraft tag that swings in
    },

    // a sealed envelope at the very end that only opens on a date. null = off.
    // To turn it on: sealedLetter: { opensOn: "07.10.2027", title: "our first year", body: "..." }
    sealedLetter: null
};