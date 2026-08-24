/* =========================================================
   WOLHUB - SMART SEARCH
   All search, suggestion and result logic lives in this file.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const liveSuggestions = document.getElementById("liveSuggestions");
    const resultsSection = document.getElementById("resultsSection");
    const resultContainer = document.getElementById("resultContainer");
    const categoryCards = document.querySelectorAll("[data-category]");

    if (!searchForm || !searchInput || !liveSuggestions || !resultsSection || !resultContainer) {
        console.warn("WolHub: required search elements are missing.");
        return;
    }

    /*
     * Every category has:
     * - aliases: words WolHub understands as that category
     * - options: specific creator goals
     * - tools, prompts and workflows for every option
     */
    const CATEGORY_DATA = {
        image: {
            label: "AI Image Generation",
            title: "AI Image",
            question: "What kind of image do you want to create?",
            icon: "🖼️",
            aliases: [
                "image", "imege", "imge", "photo", "picture", "pic",
                "tasveer", "image banana", "photo banana", "image generate",
                "photo generate", "generate image", "generate photo",
                "ai image", "ai photo", "picture banana"
            ],
            options: [
                {
                    id: "person",
                    icon: "🧑",
                    name: "Person",
                    aliases: ["person", "portrait", "face", "human", "man", "woman", "people"],
                    tools: ["Adobe Firefly", "Canva"],
                    prompt: "Create a high-quality realistic portrait of a confident young creator, natural facial details, soft studio lighting, clean background, realistic skin texture, professional photography, balanced composition, sharp focus, premium modern look.",
                    workflow: [
                        "Choose an AI image tool such as Adobe Firefly or Canva.",
                        "Select the image or text-to-image generation feature.",
                        "Paste the ready prompt and adjust the subject or style if needed.",
                        "Generate several variations and choose the strongest result.",
                        "Refine the image, then download it in the size you need."
                    ]
                },
                {
                    id: "poster",
                    icon: "🎨",
                    name: "Poster",
                    aliases: ["poster", "posters", "event poster", "advertising poster"],
                    tools: ["Canva", "Adobe Firefly"],
                    prompt: "Design a premium modern promotional poster for a creative event. Use a clean visual hierarchy, strong headline area, attractive supporting imagery, balanced spacing, readable typography, subtle purple accents, and a professional social-media-ready composition.",
                    workflow: [
                        "Open Canva or an AI image/design tool.",
                        "Choose a poster layout or generate a suitable visual.",
                        "Use the prompt and add your event name, date, location and call-to-action.",
                        "Check typography, spacing, contrast and mobile readability.",
                        "Export the final poster as PNG or PDF."
                    ]
                },
                {
                    id: "product-image",
                    icon: "👕",
                    name: "Product Image",
                    aliases: ["product image", "product photo", "product", "product photography", "product picture"],
                    tools: ["Adobe Firefly", "Canva"],
                    prompt: "Create a premium commercial product photograph of a clean modern product placed on a minimal studio surface, soft professional lighting, realistic shadows, subtle depth, crisp details, elegant background, polished e-commerce photography, high-end brand presentation.",
                    workflow: [
                        "Prepare a clear product photo or product description.",
                        "Open Adobe Firefly or Canva and select the appropriate image tool.",
                        "Use the prompt and describe the product accurately.",
                        "Generate or edit the scene, checking that the product shape and important details remain correct.",
                        "Export the final image for your store, advertisement or social post."
                    ]
                },
                {
                    id: "room-design",
                    icon: "🏠",
                    name: "Room Design",
                    aliases: ["room design", "room", "interior", "interior design", "home design", "room decor"],
                    tools: ["Canva", "Adobe Firefly"],
                    prompt: "Redesign this room as a clean premium modern interior with warm natural lighting, tasteful neutral furniture, balanced proportions, subtle decorative elements, realistic materials, uncluttered styling, and a comfortable sophisticated atmosphere.",
                    workflow: [
                        "Take a clear photo of the room or describe its size and purpose.",
                        "Open a suitable AI image or design tool.",
                        "Use the prompt and specify the preferred style, colors and furniture.",
                        "Generate multiple concepts and compare layout, lighting and practicality.",
                        "Save the preferred concept as a reference for the final room design."
                    ]
                },
                {
                    id: "social-image",
                    icon: "📱",
                    name: "Social Media Image",
                    aliases: ["social media image", "social image", "instagram image", "facebook image", "social post image"],
                    tools: ["Canva", "Adobe Firefly"],
                    prompt: "Create a scroll-stopping social media visual for a modern creator brand. Use a clean premium composition, bold focal subject, strong visual hierarchy, generous whitespace, readable headline area, subtle purple accents, polished lighting, and a professional mobile-first look.",
                    workflow: [
                        "Decide the platform and post size you need.",
                        "Open Canva or Adobe Firefly.",
                        "Generate the visual with the prompt and add your exact text separately when needed.",
                        "Check the design on a phone-sized preview and improve readability.",
                        "Export the final image and publish it on your chosen platform."
                    ]
                },
                {
                    id: "wallpaper",
                    icon: "🌄",
                    name: "Wallpaper",
                    aliases: ["wallpaper", "phone wallpaper", "desktop wallpaper", "background", "wallpaper banana"],
                    tools: ["Adobe Firefly", "Canva"],
                    prompt: "Create a premium cinematic wallpaper with a visually striking central subject, elegant depth, clean negative space, detailed lighting, rich atmosphere, balanced composition, and enough uncluttered space for app icons or desktop elements.",
                    workflow: [
                        "Choose whether the wallpaper is for phone, tablet or desktop.",
                        "Open Adobe Firefly or Canva and set the closest available canvas size.",
                        "Paste the prompt and customize the subject, mood and colors.",
                        "Generate multiple variations and choose one with clean composition.",
                        "Crop or resize it to your device and save the final wallpaper."
                    ]
                }
            ]
        },

        video: {
            label: "AI Video",
            title: "AI Video",
            question: "What kind of video do you want to create?",
            icon: "🎬",
            aliases: [
                "video", "vedio", "vidio", "reel", "short", "movie",
                "video banana", "video banani", "video generate",
                "ai video", "youtube video", "video creation"
            ],
            options: [
                {
                    id: "reel-short",
                    icon: "📱",
                    name: "Reel / Short",
                    aliases: ["reel", "short", "reels", "shorts", "instagram reel", "youtube short"],
                    tools: ["CapCut", "Canva", "ChatGPT"],
                    prompt: "Write and structure a 30-second vertical social media reel about [TOPIC]. Start with a strong 2-second hook, use short conversational lines, suggest matching visuals for every section, include on-screen text ideas, and finish with a clear call-to-action.",
                    workflow: [
                        "Use ChatGPT to create the short script and shot ideas.",
                        "Collect or generate the required visuals and clips.",
                        "Open CapCut or Canva and create a vertical 9:16 project.",
                        "Add clips, captions, music and transitions while keeping the pace fast.",
                        "Preview on mobile, make the final edits and export the reel."
                    ]
                },
                {
                    id: "youtube-video",
                    icon: "▶️",
                    name: "YouTube Video",
                    aliases: ["youtube", "youtube video", "long video", "yt video"],
                    tools: ["ChatGPT", "Canva", "CapCut"],
                  prompt: "Create a complete YouTube video plan about [TOPIC] for beginners. Include an attention-grabbing opening, a clear 5-part structure, concise explanations, visual suggestions, natural transitions, a useful conclusion and a strong but non-spammy call-to-action.",
                    workflow: [
                        "Ask ChatGPT for the outline, script and visual plan.",
                        "Prepare the footage, images, screen recordings or other assets.",
                        "Edit the video in CapCut and create supporting graphics in Canva.",
                        "Add captions, music and clean transitions without overcrowding the video.",
                        "Review the complete video, then export and upload it to YouTube."
                    ]
                },
                {
                    id: "product-video",
                    icon: "🛍️",
                    name: "Product Video",
                    aliases: ["product video", "product ad", "product advertisement", "product promo"],
                    tools: ["Canva", "CapCut", "ChatGPT"],
                    prompt: "Create a 20-second premium product promotional video for [PRODUCT]. Show the main benefit first, then demonstrate the product, highlight 2–3 key features, use clean modern visuals, concise on-screen text, smooth transitions and finish with a clear call-to-action.",
                    workflow: [
                        "List the product's audience, main benefit and key features.",
                        "Use ChatGPT to create a short script and shot list.",
                        "Build the video in CapCut or Canva using product visuals.",
                        "Add concise text, music and a clear call-to-action.",
                        "Check that the product remains visible and accurate, then export the final video."
                    ]
                },
                {
                    id: "story-video",
                    icon: "🎬",
                    name: "Story Video",
                    aliases: ["story video", "story", "storytelling video", "cinematic story"],
                    tools: ["ChatGPT", "CapCut", "Canva"],
                    prompt: "Create a short cinematic story about [STORY IDEA] with a clear beginning, rising tension, emotional turning point and satisfying ending. Provide narration, scene descriptions, character actions, visual mood and concise dialogue suitable for a short video.",
                    workflow: [
                        "Use ChatGPT to develop the story, scenes and narration.",
                        "Prepare visuals, clips or generated images for each scene.",
                        "Arrange the scenes in CapCut in the correct story order.",
                        "Add narration, subtitles, music and subtle transitions.",
                        "Watch the final cut from beginning to end and export the finished story."
                    ]
                },
                {
                    id: "explainer-video",
                    icon: "💡",
                    name: "Explainer Video",
                    aliases: ["explainer", "explainer video", "how to video", "educational video"],
                    tools: ["ChatGPT", "Canva", "CapCut"],
                    prompt: "Create a simple 60-second explainer video script about [TOPIC]. Explain the problem, the key idea, how it works, one practical example and the main takeaway. Keep the language beginner-friendly and suggest a visual for each section.",
                    workflow: [
                        "Ask ChatGPT for the script and scene-by-scene visual plan.",
                        "Prepare diagrams, screen recordings or supporting visuals.",
                        "Build the sequence in Canva or CapCut.",
                        "Add narration, captions and simple visual emphasis.",
                        "Review for clarity and accuracy, then export the final explainer."
                    ]
                },
                {
                    id: "animation",
                    icon: "✨",
                    name: "Animation",
                    aliases: ["animation", "animated video", "animated", "motion video"],
                    tools: ["Canva", "CapCut", "ChatGPT"],
                    prompt: "Create a clean short animated video concept about [TOPIC]. Use simple visual storytelling, smooth scene changes, clear character or object movement, readable on-screen text, consistent visual style and a polished modern finish.",
                    workflow: [
                        "Define the animation concept and scene sequence with ChatGPT.",
                        "Prepare characters, graphics or visual assets.",
                        "Create the animation using Canva or CapCut.",
                        "Adjust timing, movement, text and sound so every scene is easy to follow.",
                        "Preview the animation and export the finished video."
                    ]
                }
            ]
        },

        writing: {
            label: "AI Writing",
            title: "AI Writing",
            question: "What do you want to write?",
            icon: "✍️",
            aliases: [
                "write", "writing", "article", "blog", "caption", "script",
                "email", "likhna", "article likhna", "blog likhna", "story",
                "write article", "write blog", "writing content", "content writing"
            ],
            options: [
                {
                    id: "article",
                    icon: "📝",
                    name: "Article",
                    aliases: ["article", "article writing", "article likhna", "write article"],
                    tools: ["ChatGPT", "Gemini"],
                    prompt: "Write a well-structured beginner-friendly article about [TOPIC]. Start with a clear introduction, organize the main points with useful headings, explain each point with practical examples, avoid unnecessary repetition, and finish with a concise actionable conclusion.",
                    workflow: [
                        "Choose the exact topic and target reader.",
                        "Ask ChatGPT or Gemini for an outline before writing the full article.",
                        "Generate and review each section using the ready prompt.",
                        "Fact-check important claims and rewrite anything unclear or repetitive.",
                        "Format the final article with headings, short paragraphs and useful examples."
                    ]
                },
                {
                    id: "blog",
                    icon: "📰",
                    name: "Blog",
                    aliases: ["blog", "blog post", "blog writing", "blog likhna", "write blog"],
                    tools: ["ChatGPT", "Gemini"],
                    prompt: "Write a useful and engaging blog post about [TOPIC] for [AUDIENCE]. Use a strong title, clear introduction, scannable headings, practical examples, concise paragraphs, natural language and a helpful conclusion. Avoid filler and make every section useful to the reader.",
                    workflow: [
                        "Define the topic, audience and main purpose of the blog.",
                        "Create a simple outline with ChatGPT or Gemini.",
                        "Write the sections and add real examples or useful details.",
                        "Edit the draft for clarity, originality, grammar and flow.",
                        "Publish it with a clear title, headings and suitable visuals."
                    ]
                },
              {
                id: "caption",
                    icon: "📱",
                    name: "Caption",
                    aliases: ["caption", "captions", "instagram caption", "social caption", "caption likhna"],
                    tools: ["ChatGPT", "Gemini"],
                    prompt: "Write 5 engaging social media captions for [TOPIC/POST]. Keep them natural and concise, vary the tone from friendly to professional, include a clear hook, and add a relevant call-to-action where appropriate. Avoid excessive hashtags and generic filler.",
                    workflow: [
                        "Describe the post, audience and desired tone.",
                        "Generate several caption variations with ChatGPT or Gemini.",
                        "Choose the version that best matches your audience.",
                        "Edit the wording so it sounds natural and matches your brand voice.",
                        "Add only relevant hashtags and publish the final caption."
                    ]
                },
                {
                    id: "script",
                    icon: "🎬",
                    name: "Script",
                    aliases: ["script", "video script", "youtube script", "reel script", "script writing"],
                    tools: ["ChatGPT", "Gemini"],
                    prompt: "Write a clear video script about [TOPIC] for [PLATFORM]. Begin with a strong hook, keep the language conversational, organize the information into short sections, include visual or B-roll suggestions, and end with a natural call-to-action.",
                    workflow: [
                        "Choose the platform, video length and target audience.",
                        "Ask ChatGPT or Gemini to create the structure and hook.",
                        "Generate the complete script and visual suggestions.",
                        "Read it aloud and shorten any awkward or overly long sentences.",
                        "Record the final script and edit the video around its structure."
                    ]
                },
                {
                    id: "email",
                    icon: "✉️",
                    name: "Email",
                    aliases: ["email", "mail", "email writing", "mail likhna", "write email"],
                    tools: ["ChatGPT", "Gemini"],
                    prompt: "Write a professional and friendly email about [PURPOSE]. Include a clear subject line, concise opening, the key information in an easy-to-read structure, a specific next step or request, and a polite closing. Keep the tone natural and avoid unnecessary words.",
                    workflow: [
                        "Write down the purpose, recipient and desired action.",
                        "Use ChatGPT or Gemini to draft the email.",
                        "Check the facts, names, dates and requested action.",
                        "Adjust the tone so it sounds like you rather than generic AI writing.",
                        "Review the subject line and send the final email."
                    ]
                },
                {
                    id: "story",
                    icon: "📖",
                    name: "Story",
                    aliases: ["story", "short story", "fiction", "kahani", "kahani likhna"],
                    tools: ["ChatGPT", "Gemini"],
                    prompt: "Write an engaging short story based on [IDEA]. Give the main character a clear goal, introduce a meaningful challenge, build tension through specific scenes, include natural dialogue and end with a satisfying conclusion. Keep the language vivid but easy to follow.",
                    workflow: [
                        "Define the main character, setting and central idea.",
                        "Create a simple beginning, middle and ending.",
                        "Generate the first draft with ChatGPT or Gemini.",
                        "Edit dialogue, pacing and descriptions so the story feels natural.",
                        "Proofread the final version and format it for your chosen platform."
                    ]
                }
            ]
        },

        voice: {
            label: "AI Voice",
            title: "AI Voice",
            question: "What do you want to create?",
            icon: "🎙️",
            aliases: [
                "voice", "audio", "awaaz", "voiceover", "voice over",
                "narration", "podcast", "sound", "voice generate",
                "ai voice", "voice banana", "audio banana"
            ],
            options: [
                {
                    id: "voiceover",
                    icon: "🎙️",
                    name: "Voiceover",
                    aliases: ["voiceover", "voice over", "voice over banana", "voice narration"],
                    tools: ["ElevenLabs", "ChatGPT", "CapCut"],
                    prompt: "Create a natural, confident voiceover script for a [30-SECOND] video about [TOPIC]. Use short spoken sentences, a friendly professional tone, clear emphasis points and a strong opening. Make it sound natural when read aloud.",
                    workflow: [
                        "Write or prepare the final voiceover script.",
                        "Open ElevenLabs or another suitable voice tool and choose a voice.",
                        "Generate the audio and adjust speed, tone or pauses if available.",
                        "Place the voiceover into CapCut or your video editor.",
                        "Sync the narration with visuals, review the timing and export the video."
                    ]
                },
                {
                    id: "narration",
                    icon: "📖",
                    name: "Narration",
                    aliases: ["narration", "narrator", "story narration", "book narration"],
                    tools: ["ElevenLabs", "ChatGPT"],
                    prompt: "Create a warm, expressive narration of the following text: [TEXT]. Keep the pacing natural, pronounce important words clearly, use subtle emotional variation, and maintain a consistent storytelling tone without sounding robotic.",
                    workflow: [
                        "Prepare the final narration text and divide it into sensible sections.",
                        "Choose a suitable narrator voice in ElevenLabs.",
                        "Generate the narration and listen for pronunciation or pacing issues.",
                        "Regenerate or edit problem sections where necessary.",
                        "Combine the narration with your visuals or audio project and export it."
                    ]
                },
                {
                    id: "podcast",
                    icon: "🎧",
                    name: "Podcast",
                    aliases: ["podcast", "podcast audio", "podcast script"],
                    tools: ["ChatGPT", "ElevenLabs", "CapCut"],
                    prompt: "Create a beginner-friendly podcast episode outline about [TOPIC] for [AUDIENCE]. Include a short introduction, 3–5 useful discussion points, natural transitions, questions for the host or guest, practical examples and a concise closing.",
                    workflow: [
                        "Use ChatGPT to create the episode outline and talking points.",
                        "Prepare the host or guest script and any supporting research.",
                        "Record the voices or generate suitable voice tracks with an AI voice tool.",
                        "Edit pauses, mistakes, music and volume levels in CapCut.",
                        "Listen to the complete episode and export the final audio."
                    ]
                },
              {
                id: "character-voice",
                    icon: "🗣️",
                    name: "Character Voice",
                    aliases: ["character voice", "character", "cartoon voice", "fictional voice"],
                    tools: ["ElevenLabs", "CapCut", "ChatGPT"],
                    prompt: "Create dialogue for a fictional character named [CHARACTER]. The character is [PERSONALITY]. Write short expressive lines with clear emotion, natural conversational rhythm and wording that fits the character's age, role and situation.",
                    workflow: [
                        "Define the character's personality, age, role and situation.",
                        "Use ChatGPT to write dialogue that matches the character.",
                        "Choose a suitable voice in ElevenLabs.",
                        "Generate and review the lines for emotion, pronunciation and consistency.",
                        "Add the voice to your animation or video and synchronize it with the character."
                    ]
                },
                {
                    id: "audio",
                    icon: "🔊",
                    name: "Audio",
                    aliases: ["audio", "sound", "audio creation", "audio banana"],
                    tools: ["ElevenLabs", "CapCut", "ChatGPT"],
                    prompt: "Plan a clean audio track for a [TYPE OF CONTENT] about [TOPIC]. Specify the narration or spoken content, suitable background atmosphere, timing of important moments and a balanced mix where the main voice remains clear.",
                    workflow: [
                        "Decide what the audio is for and what the listener should hear.",
                        "Prepare narration or spoken content with ChatGPT if needed.",
                        "Generate or record the voice and collect appropriate audio elements.",
                        "Mix the tracks in CapCut so speech remains clear and balanced.",
                        "Listen with headphones and phone speakers before exporting the final audio."
                    ]
                }
            ]
        },

        social: {
            label: "Social Media",
            title: "Social Media",
            question: "What do you want to create?",
            icon: "📱",
            aliases: [
                "instagram", "facebook", "social media", "social", "post",
                "hashtag", "hashtags", "reels", "reel", "thumbnail",
                "content ideas", "content idea", "social media content"
            ],
            options: [
                {
                    id: "social-post",
                    icon: "📱",
                    name: "Social Post",
                    aliases: ["social post", "instagram post", "facebook post", "social media post", "post"],
                    tools: ["Canva", "ChatGPT"],
                    prompt: "Create a modern social media post concept about [TOPIC] for [AUDIENCE]. Provide a strong headline, short supporting message, visual direction, suggested call-to-action and a clean layout that is easy to understand while scrolling on a phone.",
                    workflow: [
                        "Define the post topic, audience and desired action.",
                        "Use ChatGPT for the copy and Canva for the visual design.",
                        "Choose a clean mobile-friendly layout and add the final text.",
                        "Check spacing, readability and brand consistency.",
                        "Export the post and publish it on the chosen platform."
                    ]
                },
                {
                    id: "reel",
                    icon: "🎬",
                    name: "Reel",
                    aliases: ["reel", "instagram reel", "social reel", "reels"],
                    tools: ["CapCut", "Canva", "ChatGPT"],
                    prompt: "Create a 30-second Instagram Reel concept about [TOPIC]. Give me a powerful opening hook, a scene-by-scene structure, concise spoken lines, on-screen text, visual suggestions and a final call-to-action designed for quick mobile viewing.",
                    workflow: [
                        "Generate the hook and short script with ChatGPT.",
                        "Collect clips, images or screen recordings for each scene.",
                        "Edit everything in CapCut using a 9:16 vertical canvas.",
                        "Add captions, music and quick but clean transitions.",
                        "Watch the final reel on mobile and export it for publishing."
                    ]
                },
                {
                    id: "social-caption",
                    icon: "✍️",
                    name: "Caption",
                    aliases: ["caption", "social caption", "instagram caption", "facebook caption"],
                    tools: ["ChatGPT", "Gemini"],
                    prompt: "Write 5 natural social media captions for a post about [TOPIC]. Make each caption concise, engaging and different in tone. Include a strong opening, a useful or interesting message, and a relevant call-to-action when appropriate.",
                    workflow: [
                        "Describe the post and the audience.",
                        "Generate multiple caption options with ChatGPT or Gemini.",
                        "Pick the option that matches your content and voice.",
                        "Edit it to sound personal and remove generic filler.",
                        "Add only relevant hashtags and publish."
                    ]
                },
                {
                    id: "thumbnail",
                    icon: "🖼️",
                    name: "Thumbnail",
                    aliases: ["thumbnail", "youtube thumbnail", "video thumbnail", "thumb"],
                    tools: ["Canva", "Adobe Firefly", "ChatGPT"],
                    prompt: "Create a high-contrast YouTube thumbnail concept for a video about [TOPIC]. Use one clear focal subject, an expressive visual, minimal but bold headline text, strong separation between foreground and background, clean composition and a professional creator style.",
                    workflow: [
                        "Identify the single idea the thumbnail must communicate.",
                        "Use ChatGPT for headline ideas and Canva or Firefly for the visual.",
                        "Keep the design simple with one strong focal point.",
                        "Check the thumbnail at small mobile size for readability.",
                        "Export it in the required platform size and upload it."
                    ]
                },
                {
                    id: "content-ideas",
                    icon: "💡",
                    name: "Content Ideas",
                    aliases: ["content ideas", "content idea", "post ideas", "reel ideas", "social ideas"],
                    tools: ["ChatGPT", "Gemini", "Canva"],
                    prompt: "Give me 20 practical social media content ideas for [NICHE] aimed at [AUDIENCE]. Divide them into educational, entertaining, problem-solving, personal/storytelling and promotional ideas. Make each idea specific enough to turn into a post or short video.",
                    workflow: [
                        "Enter your niche, audience and main content goal.",
                        "Generate a batch of ideas with ChatGPT or Gemini.",
                        "Select ideas that match your audience's real questions or interests.",
                        "Turn the best ideas into scripts, posts or visuals using Canva and other tools.",
                        "Track which topics perform well and create more content around them."
                    ]
                },
                {
                    id: "hashtags",
                    icon: "#️⃣",
                    name: "Hashtags",
                    aliases: ["hashtags", "hashtag", "hash tags", "social hashtags"],
                    tools: ["ChatGPT", "Gemini"],
                    prompt: "Suggest a focused set of relevant hashtags for a social media post about [TOPIC] in the [NICHE] niche. Group them by broad, medium and specific relevance. Avoid irrelevant or misleading tags and prioritize terms that genuinely match the content.",
                    workflow: [
                        "Describe the exact topic and niche of the post.",
                        "Generate relevant hashtag groups with ChatGPT or Gemini.",
                        "Remove tags that do not accurately describe your content.",
                        "Choose a small relevant mix rather than stuffing the post with tags.",
                        "Review the platform's current hashtag behavior before publishing."
                    ]
                }
            ]
        },

        coding: {
            label: "AI Coding",
            title: "AI Coding",
            question: "What do you want to build?",
            icon: "💻",
            aliases: [
                "website", "web site", "coding", "code", "html", "css",
                "javascript", "python", "app banana", "website banana",
                "program", "debug", "fix code", "app", "software",
                "web development", "coding help"
            ],
            options: [
                {
                    id: "website",
                    icon: "🌐",
                    name: "Website",
                    aliases: ["website", "web site", "website banana", "web page", "webpage"],
                    tools: ["ChatGPT", "Gemini"],
                    prompt: "Create a clean, modern and responsive website for [PROJECT]. Use semantic HTML, organized CSS and maintainable JavaScript. The design should be professional, mobile-friendly, accessible, fast and easy for a beginner to understand. Keep the code complete with no missing sections or placeholder ellipses.",
                    workflow: [
                        "Describe the website purpose, pages, sections and visual style to ChatGPT or Gemini.",
                        "Ask for the project as separate HTML, CSS and JavaScript files when appropriate.",
                        "Copy the generated files into your code editor and test the page locally.",
                        "Check the layout on both mobile and desktop and fix any errors.",
                        "Publish the finished website using a suitable hosting service."
                    ]
                },
                {
                    id: "app",
                    icon: "📱",
                    name: "App",
                    aliases: ["app", "application", "mobile app", "app banana", "app development"],
                    tools: ["ChatGPT", "Gemini"],
                    prompt: "Help me plan and build a beginner-friendly app for [APP IDEA]. First define the core screens and user flow, then provide clean maintainable code for the chosen technology. Keep the interface responsive, accessible and simple, and explain where each file belongs.",
                    workflow: [
                        "Define the app's purpose, target users and essential screens.",
                        "Ask ChatGPT or Gemini to create the project structure and implementation plan.",
                        "Build one core feature at a time and test it after each change.",
                        "Check buttons, forms, navigation and error states on mobile.",
                        "Prepare the final build and follow the platform's publishing requirements."
                    ]
                },
              {
                id: "html-css",
                    icon: "🧩",
                    name: "HTML / CSS",
                    aliases: ["html", "css", "html css", "html/css", "web design"],
                    tools: ["ChatGPT", "Gemini"],
                    prompt: "Create semantic HTML and clean responsive CSS for [PAGE DESCRIPTION]. Use a modern professional layout, accessible labels, consistent spacing, responsive breakpoints and reusable classes. Do not use incomplete code or placeholder ellipses.",
                    workflow: [
                        "Describe the page sections and exact content.",
                        "Generate the HTML structure and CSS separately.",
                        "Open the page in a browser and inspect the layout.",
                        "Test common mobile and desktop widths and correct spacing issues.",
                        "Keep the final HTML semantic and the CSS organized."
                    ]
                },
                {
                    id: "javascript",
                    icon: "⚡",
                    name: "JavaScript",
                    aliases: ["javascript", "java script", "js", "javascript code", "js code"],
                    tools: ["ChatGPT", "Gemini"],
                    prompt: "Write clean vanilla JavaScript for [FEATURE]. Wait for DOMContentLoaded, safely check required elements, avoid duplicate event listeners, handle empty and invalid input, and keep the code organized into small readable functions. Return complete working code with no unfinished sections.",
                    workflow: [
                        "Describe exactly what the JavaScript feature should do.",
                        "Ask for the code with the existing HTML element IDs and classes.",
                        "Add the script to the correct JavaScript file.",
                        "Open the browser console and test normal, empty and invalid inputs.",
                        "Fix any console errors before using the feature in production."
                    ]
                },
                {
                    id: "python",
                    icon: "🐍",
                    name: "Python",
                    aliases: ["python", "python code", "python programming"],
                    tools: ["ChatGPT", "Gemini"],
                    prompt: "Write clean beginner-friendly Python code for [TASK]. Explain the approach briefly, validate important inputs, handle common errors safely, use clear variable and function names, and provide complete runnable code without unfinished sections or placeholder ellipses.",
                    workflow: [
                        "Describe the input, expected output and any special requirements.",
                        "Ask ChatGPT or Gemini for a complete Python solution.",
                        "Run the code with normal and edge-case inputs.",
                        "Read any error messages and ask the AI to fix the specific issue.",
                        "Clean up the final code and save the working version."
                    ]
                },
                {
                    id: "fix-code",
                    icon: "🔧",
                    name: "Fix Code",
                    aliases: ["debug", "fix code", "bug", "error", "code error", "debug code", "fix coding"],
                    tools: ["ChatGPT", "Gemini"],
                    prompt: "Debug the following code. Identify the exact cause of the problem, explain why it happens, then provide the corrected complete code. Preserve the existing intended behavior, avoid unnecessary rewrites, and check for syntax errors, missing brackets, incorrect selectors and event-handling problems.",
                    workflow: [
                        "Copy the relevant code and the exact error message.",
                        "Tell ChatGPT or Gemini what you expected the code to do.",
                        "Ask it to identify the root cause before changing unrelated code.",
                        "Replace only the necessary section and test again.",
                        "Repeat the test with normal and edge-case inputs until the console is clean."
                    ]
                }
            ]
        }
    };

    const CATEGORY_ORDER = ["image", "video", "writing", "voice", "social", "coding"];

    function normalize(value) {
        return String(value || "")
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\p{L}\p{N}\s/+-]/gu, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function escapeHTML(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function scoreMatch(query, phrase) {
        const q = normalize(query);
        const p = normalize(phrase);

        if (!q || !p) {
            return 0;
        }

        if (q === p) {
            return 100;
        }

        if (p.includes(q)) {
            return 82;
        }

        const queryWords = q.split(" ").filter(Boolean);
        const phraseWords = p.split(" ").filter(Boolean);

        let score = 0;

        queryWords.forEach(function (word) {
            if (phraseWords.includes(word)) {
                score += 22;
            } else if (phraseWords.some(function (phraseWord) {
                return phraseWord.startsWith(word) || word.startsWith(phraseWord);
            })) {
                score += 15;
            }
        });

        if (q.length >= 3 && p.startsWith(q)) {
            score += 18;
        }

        return score;
    }

    function levenshteinDistance(a, b) {
        const first = normalize(a);
        const second = normalize(b);

        if (!first) return second.length;
        if (!second) return first.length;

        const previous = Array.from({ length: second.length + 1 }, function (_, index) {
            return index;
        });

        for (let i = 1; i <= first.length; i += 1) {
            let current = [i];

            for (let j = 1; j <= second.length; j += 1) {
                const cost = first[i - 1] === second[j - 1] ? 0 : 1;

                current[j] = Math.min(
                    current[j - 1] + 1,
                    previous[j] + 1,
                    previous[j - 1] + cost
                );
            }
          for (let j = 0; j < current.length; j += 1) {
                previous[j] = current[j];
            }
        }

        return previous[second.length];
    }

    function fuzzyScore(query, phrase) {
        const q = normalize(query);
        const p = normalize(phrase);

        if (!q || !p || q.length < 3) {
            return 0;
        }

        const queryWords = q.split(" ").filter(Boolean);
        const phraseWords = p.split(" ").filter(Boolean);
        let best = 0;

        queryWords.forEach(function (word) {
            phraseWords.forEach(function (phraseWord) {
                const maxLength = Math.max(word.length, phraseWord.length);

                if (maxLength < 3) {
                    return;
                }

                const distance = levenshteinDistance(word, phraseWord);
                const allowed = maxLength <= 4 ? 1 : maxLength <= 7 ? 2 : 3;

                if (distance <= allowed) {
                    const similarity = Math.max(0, 28 - distance * 7);
                    best = Math.max(best, similarity);
                }
            });
        });

        return best;
    }

    function getCategoryScore(categoryKey, query) {
        const category = CATEGORY_DATA[categoryKey];

        if (!category) {
            return 0;
        }

        let best = 0;

        category.aliases.forEach(function (alias) {
            best = Math.max(best, scoreMatch(query, alias), fuzzyScore(query, alias));
        });

        category.options.forEach(function (option) {
            option.aliases.forEach(function (alias) {
                best = Math.max(best, scoreMatch(query, alias) * 0.92, fuzzyScore(query, alias) * 0.92);
            });
        });

        return best;
    }

    function detectCategory(query) {
        const normalizedQuery = normalize(query);

        if (!normalizedQuery) {
            return null;
        }

        let bestCategory = null;
        let bestScore = 0;

        CATEGORY_ORDER.forEach(function (categoryKey) {
            const score = getCategoryScore(categoryKey, normalizedQuery);

            if (score > bestScore) {
                bestScore = score;
                bestCategory = categoryKey;
            }
        });

        return bestScore >= 18 ? bestCategory : null;
    }

    function getOptionScore(option, query) {
        let best = 0;

        option.aliases.forEach(function (alias) {
            best = Math.max(best, scoreMatch(query, alias), fuzzyScore(query, alias));
        });

        return best;
    }

    function detectOption(categoryKey, query) {
        const category = CATEGORY_DATA[categoryKey];

        if (!category) {
            return null;
        }

        let bestOption = null;
        let bestScore = 0;

        category.options.forEach(function (option) {
            const score = getOptionScore(option, query);

            if (score > bestScore) {
                bestScore = score;
                bestOption = option;
            }
        });

        return bestScore >= 35 ? bestOption : null;
    }

    function createSuggestionData(query) {
        const normalizedQuery = normalize(query);

        if (!normalizedQuery) {
            return [];
        }

        const matches = [];

        CATEGORY_ORDER.forEach(function (categoryKey) {
            const category = CATEGORY_DATA[categoryKey];

            category.options.forEach(function (option) {
                let score = getOptionScore(option, normalizedQuery);

                category.aliases.forEach(function (alias) {
                    score = Math.max(score, scoreMatch(normalizedQuery, alias) * 0.55);
                });
              if (score >= 15) {
                    matches.push({
                        categoryKey: categoryKey,
                        category: category,
                        option: option,
                        score: score
                    });
                }
            });
        });

        matches.sort(function (a, b) {
            return b.score - a.score;
        });

        const unique = [];
        const seen = new Set();

        matches.forEach(function (match) {
            const key = match.categoryKey + ":" + match.option.id;

            if (!seen.has(key)) {
                seen.add(key);
                unique.push(match);
            }
        });

        return unique.slice(0, 7);
    }

    function renderSuggestions(query) {
        if (!normalize(query)) {
            hideSuggestions();
            return;
        }

        const suggestions = createSuggestionData(query);

        if (!suggestions.length) {
            hideSuggestions();
            return;
        }

        liveSuggestions.innerHTML = suggestions.map(function (item, index) {
            return `
                <button
                    class="suggestion-item"
                    type="button"
                    role="option"
                    data-suggestion-category="${escapeHTML(item.categoryKey)}"
                    data-suggestion-option="${escapeHTML(item.option.id)}"
                    data-suggestion-index="${index}"
                >
                    <span class="suggestion-icon" aria-hidden="true">${item.option.icon}</span>
                    <span class="suggestion-content">
                        <span class="suggestion-title">${escapeHTML(item.option.name)}</span>
                        <span class="suggestion-category">${escapeHTML(item.category.label)}</span>
                    </span>
                </button>
            `;
        }).join("");

        liveSuggestions.classList.add("is-visible");
    }

    function hideSuggestions() {
        liveSuggestions.classList.remove("is-visible");
        liveSuggestions.innerHTML = "";
    }

    function scrollToResults() {
        window.requestAnimationFrame(function () {
            resultsSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    }

    function renderCategory(categoryKey, shouldScroll) {
        const category = CATEGORY_DATA[categoryKey];

        if (!category) {
            return;
        }

        hideSuggestions();

        resultContainer.innerHTML = `
            <div class="result-label">
                <span aria-hidden="true">${category.icon}</span>
                ${escapeHTML(category.label)}
            </div>

            <h2 class="result-title">${escapeHTML(category.title)}</h2>

            <p class="result-question">${escapeHTML(category.question)}</p>

            <div class="option-grid">
                ${category.options.map(function (option) {
                    return `
                        <button
                            class="option-card"
                            type="button"
                            data-option-category="${escapeHTML(categoryKey)}"
                            data-option-id="${escapeHTML(option.id)}"
                        >
                            <span class="option-icon" aria-hidden="true">${option.icon}</span>
                            <span class="option-name">${escapeHTML(option.name)}</span>
                        </button>
                    `;
                }).join("")}
            </div>
        `;

        resultsSection.classList.add("is-visible");

        if (shouldScroll) {
            scrollToResults();
        }
    }

    function renderFinalResult(categoryKey, optionId, shouldScroll) {
        const category = CATEGORY_DATA[categoryKey];

        if (!category) {
            return;
        }

        const option = category.options.find(function (item) {
            return item.id === optionId;
        });

        if (!option) {
            renderCategory(categoryKey, shouldScroll);
            return;
        }

        hideSuggestions();

        resultContainer.innerHTML = `
            <div class="result-label">
                <span aria-hidden="true">${category.icon}</span>
                ${escapeHTML(category.label)}
            </div>

            <h2 class="result-title">${option.icon} ${escapeHTML(option.name)}</h2>

            <p class="result-question">
                Here is a practical tool, prompt and workflow for your goal.
            </p>

            <div class="final-result">
                <div class="result-block">
                    <h3 class="result-block-title">Recommended Tools</h3>

                    <div class="tool-list">
                        ${option.tools.map(function (tool) {
                            return `
                                <div class="tool-item">
                                    <div class="tool-name">${escapeHTML(tool)}</div>
                                </div>
                            `;
                        }).join("")}
                             </div>
                </div>

                <div class="result-block">
                    <h3 class="result-block-title">Ready-to-Use Prompt</h3>

                    <div class="prompt-box">
                        <p class="prompt-text">${escapeHTML(option.prompt)}</p>
                        <button
                            class="copy-prompt"
                            type="button"
                            data-copy-prompt="${escapeHTML(option.prompt)}"
                        >
                            Copy
                        </button>
                    </div>
                </div>

                <div class="result-block">
                    <h3 class="result-block-title">Step-by-Step Workflow</h3>

                    <ol class="workflow-list">
                        ${option.workflow.map(function (step) {
                            return `<li>${escapeHTML(step)}</li>`;
                        }).join("")}
                    </ol>
                </div>

                <button
                    class="choose-another"
                    type="button"
                    data-back-category="${escapeHTML(categoryKey)}"
                >
                    ← Choose another ${escapeHTML(category.title)} option
                </button>
            </div>
        `;

        resultsSection.classList.add("is-visible");

        if (shouldScroll) {
            scrollToResults();
        }
    }

    function renderUnknownResult() {
        hideSuggestions();

        resultContainer.innerHTML = `
            <div class="unknown-result">
                <div class="unknown-icon" aria-hidden="true">🔎</div>

                <h3>We couldn't find an exact match.</h3>

                <p>
                    Try one of these searches and WolHub will guide you from category
                    to the exact creator option.
                </p>

                <div class="search-examples" aria-label="Suggested searches">
                    <span class="search-example">image</span>
                    <span class="search-example">video</span>
                    <span class="search-example">writing</span>
                    <span class="search-example">voice</span>
                    <span class="search-example">social media</span>
                    <span class="search-example">website</span>
                    <span class="search-example">coding</span>
                </div>
            </div>
        `;

        resultsSection.classList.add("is-visible");
        scrollToResults();
    }

    function handleSearch(query) {
        const normalizedQuery = normalize(query);

        if (!normalizedQuery) {
            hideSuggestions();
            resultsSection.classList.remove("is-visible");
            resultContainer.innerHTML = "";
            return;
        }

        const categoryKey = detectCategory(normalizedQuery);

        if (!categoryKey) {
            renderUnknownResult();
            return;
        }

        const option = detectOption(categoryKey, normalizedQuery);

        if (option) {
            renderFinalResult(categoryKey, option.id, true);
        } else {
            renderCategory(categoryKey, true);
        }
    }

    function setSearchValue(value) {
        searchInput.value = value;
        searchInput.focus();
    }

    function copyText(text, button) {
        if (!text) {
            return;
        }

        const originalText = button ? button.textContent : "Copy";

        function showCopied() {
            if (!button) {
                return;
            }

            button.textContent = "Copied!";
            window.setTimeout(function () {
                button.textContent = originalText;
            }, 1400);
        }

        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            navigator.clipboard.writeText(text)
                .then(showCopied)
                .catch(function () {
                    fallbackCopy(text, button, showCopied);
                });
            return;
        }

        fallbackCopy(text, button, showCopied);
    }

    function fallbackCopy(text, button, onSuccess) {
        const textarea = document.createElement("textarea");

        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        textarea.style.pointerEvents = "none";

        document.body.appendChild(textarea);
        textarea.select();

        let copied = false;

        try {
            copied = document.execCommand("copy");
        } catch (error) {
            copied = false;
        }

        document.body.removeChild(textarea);

        if (copied && typeof onSuccess === "function") {
            onSuccess();
        } else if (button) {
            button.textContent = "Select & Copy";
            window.setTimeout(function () {
                button.textContent = "Copy";
            }, 1600);
        }
    }

    searchInput.addEventListener("input", function () {
        renderSuggestions(searchInput.value);
    });

    searchInput.addEventListener("focus", function () {
        if (normalize(searchInput.value)) {
            renderSuggestions(searchInput.value);
        }
    });

    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        handleSearch(searchInput.value);
    });

    liveSuggestions.addEventListener("click", function (event) {
        const suggestion = event.target.closest("[data-suggestion-category]");

        if (!suggestion) {
            return;
        }

        const categoryKey = suggestion.getAttribute("data-suggestion-category");
        const optionId = suggestion.getAttribute("data-suggestion-option");

        const category = CATEGORY_DATA[categoryKey];

        if (!category) {
            return;
        }

        const option = category.options.find(function (item) {
            return item.id === optionId;
        });

        if (!option) {
            return;
        }

        setSearchValue(option.name);
        renderFinalResult(categoryKey, option.id, true);
    });

    document.addEventListener("click", function (event) {
        if (!event.target.closest(".search-area")) {
            hideSuggestions();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            hideSuggestions();
        }
    });
  categoryCards.forEach(function (card) {
        card.addEventListener("click", function () {
            const categoryKey = card.getAttribute("data-category");

            if (!CATEGORY_DATA[categoryKey]) {
                return;
            }

            setSearchValue("");
            renderCategory(categoryKey, true);
        });
    });

    resultsSection.addEventListener("click", function (event) {
        const optionCard = event.target.closest("[data-option-category][data-option-id]");

        if (optionCard) {
            const categoryKey = optionCard.getAttribute("data-option-category");
            const optionId = optionCard.getAttribute("data-option-id");

            setSearchValue(CATEGORY_DATA[categoryKey].options.find(function (item) {
                return item.id === optionId;
            })?.name || "");

            renderFinalResult(categoryKey, optionId, false);
            return;
        }

        const backButton = event.target.closest("[data-back-category]");

        if (backButton) {
            const categoryKey = backButton.getAttribute("data-back-category");
            renderCategory(categoryKey, false);
            return;
        }

        const copyButton = event.target.closest("[data-copy-prompt]");

        if (copyButton) {
            copyText(copyButton.getAttribute("data-copy-prompt"), copyButton);
        }
    });
});

                  
