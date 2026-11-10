
"use strict";
/* ============================== helpers ============================== */
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
function fmtBytes(n){if(n==null||isNaN(n))return"—";if(n<1024)return n+" B";if(n<1024*1024)return (n/1024).toFixed(1).replace(/\.0$/,"")+" KB";if(n<1024*1024*1024)return (n/(1024*1024)).toFixed(2).replace(/\.00$/,"")+" MB";return (n/(1024*1024*1024)).toFixed(2)+" GB"}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function baseName(f){return f.replace(/\.[^.]+$/,"")}
function extOf(f){const m=f.toLowerCase().match(/\.([a-z0-9]+)$/);return m?m[1]:""}
function fmtTime(sec){if(!isFinite(sec))return"";sec=Math.round(sec);return Math.floor(sec/60)+":"+String(sec%60).padStart(2,"0")}

/* ============================== icons ============================== */
const P={
image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m4 18 5.5-5.5 3 3L17 11l3 3.5"/>',
compress:'<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
resize:'<path d="M21 3h-6M21 3v6M21 3l-7.5 7.5M3 21h6M3 21v-6M3 21l7.5-7.5"/>',
pdf:'<path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v4h4"/>',
video:'<rect x="2" y="5" width="15" height="14" rx="2"/><path d="M17 10.5 22 7v10l-5-3.5"/>',
audio:'<path d="M9 18V6l10-2v11"/><circle cx="6.5" cy="18" r="2.8"/><circle cx="16.5" cy="15" r="2.8"/>',
swap:'<path d="M4 7h11l-3-3M20 17H9l3 3"/>',
id:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="10" r="2.6"/><path d="M6.6 19c.8-2.3 2.8-3.5 5.4-3.5s4.6 1.2 5.4 3.5"/>',
phone:'<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18.5h2"/>',
ruler:'<rect x="2" y="9" width="20" height="7" rx="1.5"/><path d="M6.5 9v3.5M11 9v3.5M15.5 9v3.5"/>',
crop:'<path d="M6 2v16a2 2 0 0 0 2 2h14M2 6h16a2 2 0 0 1 2 2v14"/>',
rotate:'<path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6"/>',
merge:'<path d="M8 3v4a2 2 0 0 1-2 2H3M16 3v4a2 2 0 0 0 2 2h3M12 21V11M8 15l4 4 4-4"/>',
sheet:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
text:'<path d="M5 4h14M12 4v16M9 20h6"/>'
};
function icon(name){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(P[name]||P.swap)+"</svg>"}

/* ============================== catalogue ============================== */
const SECTIONS=[
{id:"most",title:"Most Used Tools",sub:"The converters people reach for every day — forms, photos, Shorts audio and PDF fixes."},
{id:"basic",title:"Basic Editing",sub:"Resize, crop, rotate and tidy up images in seconds."},
{id:"convert",title:"Format Conversions",sub:"Change any file to the format your app, form or platform actually accepts."},
{id:"pdf",title:"Image to PDF & PDF Tools",sub:"Build PDFs from photos, pull images and text back out, compress, merge and rotate."},
{id:"video",title:"Video Tools",sub:"Compress clips, convert to WebM, or pull the audio out as MP3/WAV. Video converts in real time while it plays."},
{id:"audio",title:"Audio Tools",sub:"Convert and compress MP3, WAV, M4A, OGG and FLAC — always from your original file, never lossy-to-lossy chained."},
{id:"compress",title:"General Compression",sub:"Shrink images, PDFs, video and audio while keeping them usable."},
{id:"target",title:"Exact Target Sizes",sub:"Hit the exact KB limit a form demands — 20 KB to 1 MB, images and PDFs."},
{id:"dpi",title:"DPI & Print Sizes",sub:"Resize in cm, mm or inches and set print DPI for sharp paper output."},
{id:"social",title:"Resize for Social Media",sub:"Exact pixel sizes for Instagram, WhatsApp, YouTube and X — centre-cropped to fill the frame."},
{id:"passport",title:"Passport & ID Photo Sizes",sub:"Official-style photo sizes at 300 DPI, ready to print or upload."}
];
const IMG_ACC="image/*,.heic,.heif,.bmp,.avif";
const T=[
/* basic */
{id:"resize-pixel",sec:"basic",name:"Resize Image Pixel",desc:"Set exact width and height in pixels — keep the aspect ratio or force exact dimensions.",from:"JPG · PNG · WebP",to:"Any size",icon:"resize",color:"teal",engine:"image",accept:IMG_ACC,popular:true,types:["image"],tags:["resize"],preset:{mode:"resize"},note:""},
{id:"crop-square",sec:"basic",name:"Crop Image to Square",desc:"Centre-crop any photo to a perfect 1:1 square at the size you choose.",from:"Any image",to:"1080 × 1080",icon:"crop",color:"cyan",engine:"image",accept:IMG_ACC,types:["image"],tags:["resize"],preset:{mode:"cover",w:1080,h:1080,editableDims:true}},
{id:"crop-custom",sec:"basic",name:"Crop to Any Size",desc:"Crop and resize to custom pixel dimensions — the frame is filled, nothing is stretched.",from:"Any image",to:"Custom px",icon:"crop",color:"cyan",engine:"image",accept:IMG_ACC,types:["image"],tags:["resize"],preset:{mode:"cover",w:800,h:600,editableDims:true}},
{id:"rotate-image",sec:"basic",name:"Rotate Image",desc:"Rotate a sideways photo by 90°, 180° or 270° and save it the right way up.",from:"Any image",to:"JPG · PNG",icon:"rotate",color:"slate",engine:"image",accept:IMG_ACC,types:["image"],tags:[],preset:{mode:"rotate"}},
{id:"image-converter-basic",sec:"basic",name:"Resize in KB (Quick)",desc:"Make an image smaller in KB without changing its dimensions — just lower the encoding weight.",from:"Any image",to:"Smaller KB",icon:"compress",color:"green",engine:"image",accept:IMG_ACC,types:["image"],tags:["compress"],preset:{mode:"same",quality:55}},
/* convert */
{id:"image-converter",sec:"convert",name:"Image Converter",desc:"Convert JPG, PNG, WebP, AVIF, BMP, GIF and HEIC between JPG, PNG and WebP.",from:"JPG · PNG · WebP · HEIC",to:"JPG · PNG · WebP",icon:"swap",color:"teal",engine:"image",accept:IMG_ACC,popular:true,types:["image"],tags:["convert"],preset:{mode:"same"}},
{id:"jpg-to-png",sec:"convert",name:"JPG to PNG",desc:"Turn JPG photos into lossless PNG files with transparency support.",from:"JPG",to:"PNG",icon:"swap",color:"cyan",engine:"image",accept:"image/jpeg,.jpg,.jpeg",types:["image"],tags:["convert"],preset:{mode:"same",format:"image/png"}},
{id:"png-to-jpg",sec:"convert",name:"PNG to JPG",desc:"Convert PNG screenshots and graphics to smaller JPG files (white background).",from:"PNG",to:"JPG",icon:"swap",color:"cyan",engine:"image",accept:"image/png,.png",types:["image"],tags:["convert"],preset:{mode:"same",format:"image/jpeg"}},
{id:"webp-to-jpg",sec:"convert",name:"WebP to JPG",desc:"Make WebP images usable everywhere by converting them to universal JPG.",from:"WebP",to:"JPG",icon:"swap",color:"cyan",engine:"image",accept:"image/webp,.webp",types:["image"],tags:["convert"],preset:{mode:"same",format:"image/jpeg"}},
{id:"heic-to-jpg",sec:"convert",name:"HEIC to JPG",desc:"Convert iPhone HEIC photos to JPG. Works where your browser can decode HEIC (Safari always; Chrome on many devices).",from:"HEIC",to:"JPG",icon:"swap",color:"cyan",engine:"image",accept:".heic,.heif,image/heic",types:["image"],tags:["convert"],preset:{mode:"same",format:"image/jpeg"},note:"If a HEIC file won't open here, your browser can't decode HEIC — open it in your phone's gallery and share/export it as JPG first."},
{id:"avif-to-jpg",sec:"convert",name:"AVIF to JPG",desc:"Convert next-gen AVIF images back to JPG that every app can open.",from:"AVIF",to:"JPG",icon:"swap",color:"cyan",engine:"image",accept:"image/avif,.avif",types:["image"],tags:["convert"],preset:{mode:"same",format:"image/jpeg"}},
/* pdf */
{id:"image-to-pdf",sec:"pdf",name:"Image to PDF",desc:"Combine one or many photos into a single clean PDF — one image per page.",from:"JPG · PNG · WebP",to:"PDF",icon:"pdf",color:"rose",engine:"imgpdf",accept:IMG_ACC,popular:true,types:["image","pdf"],tags:["convert"],preset:{}},
{id:"jpg-to-pdf",sec:"pdf",name:"JPG to PDF",desc:"Turn JPG photos and scans into a PDF document, in the order you add them.",from:"JPG",to:"PDF",icon:"pdf",color:"rose",engine:"imgpdf",accept:"image/jpeg,.jpg,.jpeg",types:["image","pdf"],tags:["convert"],preset:{}},
{id:"pdf-to-jpg",sec:"pdf",name:"PDF to JPG",desc:"Render every page of a PDF as a crisp JPG image — download pages singly or all as a ZIP.",from:"PDF",to:"JPG",icon:"pdf",color:"rose",engine:"pdfjpg",accept:"application/pdf,.pdf",popular:true,types:["pdf"],tags:["convert"],preset:{format:"image/jpeg"}},
{id:"pdf-to-png",sec:"pdf",name:"PDF to PNG",desc:"Render PDF pages as lossless PNG images at up to 3× resolution.",from:"PDF",to:"PNG",icon:"pdf",color:"rose",engine:"pdfjpg",accept:"application/pdf,.pdf",types:["pdf"],tags:["convert"],preset:{format:"image/png"}},
{id:"pdf-to-word",sec:"pdf",name:"PDF to Word",desc:"Extract a PDF's text into an editable Word (.doc) file, page by page.",from:"PDF",to:"DOC",icon:"pdf",color:"rose",engine:"pdfword",accept:"application/pdf,.pdf",types:["pdf"],tags:["convert"],preset:{},note:"Text is extracted in reading order; scanned-image PDFs with no text layer will come out empty — those need OCR."},
{id:"pdf-to-text",sec:"pdf",name:"PDF to Text",desc:"Pull all the text out of a PDF into a plain .txt file.",from:"PDF",to:"TXT",icon:"text",color:"slate",engine:"pdftext",accept:"application/pdf,.pdf",types:["pdf"],tags:["convert"],preset:{}},
{id:"pdf-compressor",sec:"pdf",name:"PDF Compressor",desc:"Shrink a PDF by re-rendering pages at a lighter quality — great for email and form uploads.",from:"PDF",to:"Smaller PDF",icon:"compress",color:"rose",engine:"pdfcompress",accept:"application/pdf,.pdf",popular:true,types:["pdf"],tags:["compress"],preset:{},alsoIn:["compress"],note:"Pages are re-rendered as images, so text won't stay selectable in the compressed copy. Keep your original as the master."},
{id:"merge-pdf",sec:"pdf",name:"Merge PDF",desc:"Combine several PDFs into one file, in the order you add them.",from:"PDF × many",to:"PDF",icon:"merge",color:"rose",engine:"pdfmerge",accept:"application/pdf,.pdf",types:["pdf"],tags:[],preset:{}},
{id:"rotate-pdf",sec:"pdf",name:"Rotate PDF",desc:"Rotate every page of a PDF by 90°, 180° or 270° and save a corrected copy.",from:"PDF",to:"PDF",icon:"rotate",color:"slate",engine:"pdfrotate",accept:"application/pdf,.pdf",types:["pdf"],tags:[],preset:{}},
/* video */
{id:"video-compressor",sec:"video",name:"Video Compressor",desc:"Shrink a video by re-encoding it smaller — pick a height and bitrate, keep the audio.",from:"MP4 · MOV · WebM",to:"WebM",icon:"compress",color:"amber",engine:"video",accept:"video/*",popular:true,types:["video"],tags:["compress"],preset:{height:720,mbps:2.5},alsoIn:["compress"],note:"Video conversion re-records in real time while the clip plays (muted here) — a 2-minute video takes about 2 minutes."},
{id:"mp4-to-mp3",sec:"video",name:"MP4 to MP3",desc:"Extract just the audio from any video and save it as an MP3 song, lecture or voiceover.",from:"MP4 · MOV · WebM",to:"MP3",icon:"audio",color:"amber",engine:"mp4mp3",accept:"video/*",popular:true,types:["video","audio"],tags:["convert"],preset:{format:"mp3"},alsoIn:["convert","audio"]},
{id:"mp4-to-wav",sec:"video",name:"Video to WAV",desc:"Pull a lossless WAV audio track out of a video — the right master for editing voiceovers.",from:"MP4 · MOV · WebM",to:"WAV",icon:"audio",color:"amber",engine:"mp4mp3",accept:"video/*",types:["video","audio"],tags:["convert"],preset:{format:"wav"}},
{id:"video-converter",sec:"video",name:"Video Converter (to WebM)",desc:"Convert MP4/MOV videos to compact WebM — 30–50% smaller, ideal for websites.",from:"MP4 · MOV",to:"WebM",icon:"video",color:"amber",engine:"video",accept:"video/*",types:["video"],tags:["convert"],preset:{height:0,mbps:4},alsoIn:["convert"],note:"Re-encodes in real time while the clip plays. For a downloadable MP4 that plays everywhere, MP4 (H.264 + AAC) stays the universal delivery format — see the format guide below."},
{id:"video-resizer",sec:"video",name:"Video Resizer",desc:"Downscale video to 1080p, 720p, 480p or 360p — smaller files that still look clean.",from:"Any video",to:"WebM",icon:"resize",color:"amber",engine:"video",accept:"video/*",types:["video"],tags:["resize"],preset:{height:480,mbps:1.8, heightSelect:true},note:"Re-encodes in real time while the clip plays."},
/* audio */
{id:"audio-converter",sec:"audio",name:"Audio Converter",desc:"Convert MP3, WAV, M4A, OGG, FLAC and Opus between MP3 and WAV at your chosen bitrate.",from:"MP3 · WAV · M4A · FLAC",to:"MP3 · WAV",icon:"swap",color:"green",engine:"audio",accept:"audio/*,.flac,.opus",popular:true,types:["audio"],tags:["convert"],preset:{format:"mp3"},alsoIn:["convert"]},
{id:"mp3-to-wav",sec:"audio",name:"MP3 to WAV",desc:"Decode an MP3 into an uncompressed WAV for editing — no further quality loss.",from:"MP3",to:"WAV",icon:"audio",color:"green",engine:"audio",accept:"audio/mpeg,.mp3",types:["audio"],tags:["convert"],preset:{format:"wav"},alsoIn:["convert"]},
{id:"wav-to-mp3",sec:"audio",name:"WAV to MP3",desc:"Turn big WAV masters into shareable MP3s at 128–320 kbps.",from:"WAV",to:"MP3",icon:"audio",color:"green",engine:"audio",accept:"audio/wav,audio/x-wav,.wav",types:["audio"],tags:["convert"],preset:{format:"mp3"},alsoIn:["convert"]},
{id:"m4a-to-mp3",sec:"audio",name:"M4A to MP3",desc:"Convert iPhone voice memos and M4A files to MP3 that plays anywhere.",from:"M4A",to:"MP3",icon:"audio",color:"green",engine:"audio",accept:"audio/mp4,.m4a",types:["audio"],tags:["convert"],preset:{format:"mp3"}},
{id:"ogg-to-mp3",sec:"audio",name:"OGG to MP3",desc:"Convert OGG Vorbis voice notes and game audio to universal MP3.",from:"OGG",to:"MP3",icon:"audio",color:"green",engine:"audio",accept:"audio/ogg,.ogg,.opus",types:["audio"],tags:["convert"],preset:{format:"mp3"}},
{id:"flac-to-mp3",sec:"audio",name:"FLAC to MP3",desc:"Make an MP3 delivery copy from a lossless FLAC master — the right direction to convert.",from:"FLAC",to:"MP3",icon:"audio",color:"green",engine:"audio",accept:"audio/flac,.flac",types:["audio"],tags:["convert"],preset:{format:"mp3"}},
{id:"audio-compressor",sec:"audio",name:"Audio Compressor",desc:"Shrink audio with a lower MP3 bitrate — 64 kbps is plenty for voice, 128 kbps for music.",from:"Any audio",to:"MP3",icon:"compress",color:"green",engine:"audio",accept:"audio/*,.flac,.opus",types:["audio"],tags:["compress"],preset:{format:"mp3",bitrate:64},alsoIn:["compress"]},
/* compress */
{id:"image-compressor",sec:"compress",name:"Image Compressor",desc:"Compress JPG, PNG and WebP with a quality slider — watch the size drop before you download.",from:"JPG · PNG · WebP",to:"Up to 90% smaller",icon:"compress",color:"teal",engine:"image",accept:IMG_ACC,popular:true,types:["image"],tags:["compress"],preset:{mode:"same",quality:60}},
{id:"jpg-compressor",sec:"compress",name:"JPG Compressor",desc:"Squeeze JPG photos down hard for email, forms and slow connections.",from:"JPG",to:"Smaller JPG",icon:"compress",color:"teal",engine:"image",accept:"image/jpeg,.jpg,.jpeg",types:["image"],tags:["compress"],preset:{mode:"same",format:"image/jpeg",quality:45}},
{id:"reduce-image-kb",sec:"compress",name:"Reduce Image Size in KB",desc:"Type the KB you need and the tool keeps re-encoding until the image fits under it.",from:"Any image",to:"Your KB target",icon:"compress",color:"teal",engine:"image",accept:IMG_ACC,popular:true,types:["image"],tags:["compress"],preset:{mode:"same",targetKB:100,targetEditable:true}},
/* target sizes */
{id:"compress-20kb",sec:"target",name:"Compress Image to 20 KB",desc:"Hit a strict 20 KB limit — common for signature and thumbnail uploads on forms.",from:"Any image",to:"≤ 20 KB",icon:"compress",color:"amber",engine:"image",accept:IMG_ACC,types:["image"],tags:["compress"],preset:{mode:"same",targetKB:20}},
{id:"compress-50kb",sec:"target",name:"Compress Image to 50 KB",desc:"The classic exam and job-form photo limit — done in one click.",from:"Any image",to:"≤ 50 KB",icon:"compress",color:"amber",engine:"image",accept:IMG_ACC,popular:true,types:["image"],tags:["compress"],preset:{mode:"same",targetKB:50}},
{id:"compress-100kb",sec:"target",name:"Compress Image to 100 KB",desc:"Fit images under a 100 KB upload cap without wrecking them.",from:"Any image",to:"≤ 100 KB",icon:"compress",color:"amber",engine:"image",accept:IMG_ACC,types:["image"],tags:["compress"],preset:{mode:"same",targetKB:100}},
{id:"compress-200kb",sec:"target",name:"Compress Image to 200 KB",desc:"Under 200 KB with as much quality kept as the limit allows.",from:"Any image",to:"≤ 200 KB",icon:"compress",color:"amber",engine:"image",accept:IMG_ACC,types:["image"],tags:["compress"],preset:{mode:"same",targetKB:200}},
{id:"compress-500kb",sec:"target",name:"Compress Image to 500 KB",desc:"Bring big phone photos down under half a megabyte.",from:"Any image",to:"≤ 500 KB",icon:"compress",color:"amber",engine:"image",accept:IMG_ACC,types:["image"],tags:["compress"],preset:{mode:"same",targetKB:500}},
{id:"jpgpdf-50kb",sec:"target",name:"JPG to PDF under 50 KB",desc:"Build a PDF from photos that lands under a 50 KB total limit.",from:"JPG · PNG",to:"PDF ≤ 50 KB",icon:"pdf",color:"rose",engine:"imgpdf",accept:IMG_ACC,types:["image","pdf"],tags:["compress"],preset:{targetKB:50}},
{id:"jpgpdf-100kb",sec:"target",name:"JPG to PDF under 100 KB",desc:"Scanned documents as one PDF, guaranteed-sized for 100 KB form caps.",from:"JPG · PNG",to:"PDF ≤ 100 KB",icon:"pdf",color:"rose",engine:"imgpdf",accept:IMG_ACC,types:["image","pdf"],tags:["compress"],preset:{targetKB:100}},
{id:"jpgpdf-200kb",sec:"target",name:"JPG to PDF under 200 KB",desc:"Multi-page PDF from images, compressed to fit a 200 KB limit.",from:"JPG · PNG",to:"PDF ≤ 200 KB",icon:"pdf",color:"rose",engine:"imgpdf",accept:IMG_ACC,types:["image","pdf"],tags:["compress"],preset:{targetKB:200}},
{id:"jpgpdf-500kb",sec:"target",name:"JPG to PDF under 500 KB",desc:"Higher-quality image PDF that still fits a 500 KB upload limit.",from:"JPG · PNG",to:"PDF ≤ 500 KB",icon:"pdf",color:"rose",engine:"imgpdf",accept:IMG_ACC,types:["image","pdf"],tags:["compress"],preset:{targetKB:500}},
{id:"jpgpdf-1mb",sec:"target",name:"JPG to PDF under 1 MB",desc:"Crisp image PDF sized for the common 1 MB document-upload cap.",from:"JPG · PNG",to:"PDF ≤ 1 MB",icon:"pdf",color:"rose",engine:"imgpdf",accept:IMG_ACC,types:["image","pdf"],tags:["compress"],preset:{targetKB:1024}},
/* dpi */
{id:"resize-cm",sec:"dpi",name:"Resize Image in cm",desc:"Set a print size in centimetres and a DPI — pixels are calculated for you (cm × DPI ÷ 2.54).",from:"Any image",to:"cm @ DPI",icon:"ruler",color:"slate",engine:"image",accept:IMG_ACC,types:["image"],tags:["resize"],preset:{mode:"physical",pw:10,ph:15,unit:"cm",dpi:300}},
{id:"resize-mm",sec:"dpi",name:"Resize Image in mm",desc:"Resize by millimetres at print DPI — made for ID and document photo sizes.",from:"Any image",to:"mm @ DPI",icon:"ruler",color:"slate",engine:"image",accept:IMG_ACC,types:["image"],tags:["resize"],preset:{mode:"physical",pw:35,ph:45,unit:"mm",dpi:300}},
{id:"resize-inches",sec:"dpi",name:"Resize Image in Inches",desc:"Resize by inches at print DPI — 4×6, 5×7, 8×10 photo prints and more.",from:"Any image",to:"in @ DPI",icon:"ruler",color:"slate",engine:"image",accept:IMG_ACC,types:["image"],tags:["resize"],preset:{mode:"physical",pw:4,ph:6,unit:"in",dpi:300}},
{id:"change-dpi",sec:"dpi",name:"Change Image DPI",desc:"Set the DPI metadata (72 / 150 / 200 / 300 / 600) written into the JPG — print size = pixels ÷ DPI.",from:"Any image",to:"JPG @ DPI",icon:"ruler",color:"slate",engine:"image",accept:IMG_ACC,types:["image"],tags:["resize"],preset:{mode:"dpi",dpi:300},note:"This changes the DPI tag and keeps your pixels. A 3000×2000 image at 300 DPI prints at 10×6.7 inches."},
/* social */
{id:"ig-post",sec:"social",name:"Instagram Post (1080×1080)",desc:"Square 1:1 crop at full Instagram resolution.",from:"Any image",to:"1080 × 1080",icon:"phone",color:"cyan",engine:"image",accept:IMG_ACC,types:["image"],tags:["resize"],preset:{mode:"cover",w:1080,h:1080}},
{id:"ig-reel",sec:"social",name:"Reel / Story / Shorts Cover (1080×1920)",desc:"Vertical 9:16 at 1080×1920 — the Shorts and Reels frame, capped at 1080p by YouTube.",from:"Any image",to:"1080 × 1920",icon:"phone",color:"cyan",engine:"image",accept:IMG_ACC,types:["image"],tags:["resize"],preset:{mode:"cover",w:1080,h:1920}},
{id:"whatsapp-dp",sec:"social",name:"WhatsApp DP (640×640)",desc:"A clean square profile picture sized for WhatsApp.",from:"Any image",to:"640 × 640",icon:"phone",color:"cyan",engine:"image",accept:IMG_ACC,types:["image"],tags:["resize"],preset:{mode:"cover",w:640,h:640}},
{id:"yt-thumbnail",sec:"social",name:"YouTube Thumbnail (1280×720)",desc:"16:9 thumbnail at YouTube's recommended 1280×720.",from:"Any image",to:"1280 × 720",icon:"video",color:"cyan",engine:"image",accept:IMG_ACC,types:["image"],tags:["resize"],preset:{mode:"cover",w:1280,h:720}},
{id:"yt-banner",sec:"social",name:"YouTube Banner (2560×1440)",desc:"Channel banner at 2560×1440 — keep key text in the centre safe area (1235×338).",from:"Any image",to:"2560 × 1440",icon:"video",color:"cyan",engine:"image",accept:IMG_ACC,types:["image"],tags:["resize"],preset:{mode:"cover",w:2560,h:1440}},
{id:"x-post",sec:"social",name:"X / Twitter Post (1600×900)",desc:"16:9 image sized for X posts so nothing gets cropped in the feed.",from:"Any image",to:"1600 × 900",icon:"phone",color:"cyan",engine:"image",accept:IMG_ACC,types:["image"],tags:["resize"],preset:{mode:"cover",w:1600,h:900}},
{id:"linkedin-banner",sec:"social",name:"LinkedIn Banner (1584×396)",desc:"Wide 4:1 profile banner at LinkedIn's recommended size.",from:"Any image",to:"1584 × 396",icon:"phone",color:"cyan",engine:"image",accept:IMG_ACC,types:["image"],tags:["resize"],preset:{mode:"cover",w:1584,h:396}},
/* passport */
{id:"passport-india",sec:"passport",name:"Passport Photo Maker (35×45 mm)",desc:"Indian passport / visa photo: 35×45 mm at 300 DPI = 413×531 px, centre-cropped on white.",from:"Any photo",to:"413 × 531 JPG",icon:"id",color:"green",engine:"image",accept:IMG_ACC,popular:true,types:["image"],tags:["resize"],preset:{mode:"cover",w:413,h:531}},
{id:"passport-us",sec:"passport",name:"US Passport / Visa Photo (2×2 in)",desc:"Square 2×2 inch photo at 300 DPI = 600×600 px, as US visa and passport uploads expect.",from:"Any photo",to:"600 × 600 JPG",icon:"id",color:"green",engine:"image",accept:IMG_ACC,types:["image"],tags:["resize"],preset:{mode:"cover",w:600,h:600}},
{id:"exam-photo",sec:"passport",name:"Exam Photo (35×45 mm, ≤50 KB)",desc:"35×45 mm photo compressed to fit the 50 KB cap common on SSC, banking and board exam forms.",from:"Any photo",to:"413 × 531 · ≤50 KB",icon:"id",color:"green",engine:"image",accept:IMG_ACC,types:["image"],tags:["resize","compress"],preset:{mode:"cover",w:413,h:531,targetKB:50}},
{id:"passport-sheet",sec:"passport",name:"Passport Photo Sheet (4×6 in)",desc:"Six passport-size copies tiled on one 4×6 inch print sheet at 300 DPI — print once, cut six.",from:"Any photo",to:"1200 × 1800 sheet",icon:"sheet",color:"green",engine:"image",accept:IMG_ACC,types:["image"],tags:["resize"],preset:{mode:"sheet"}}
];
const toolById=id=>T.find(t=>t.id===id);

/* ============================== state ============================== */
const state={tool:null,files:[],outputs:[],favs:new Set(),recents:[],filter:"all",query:"",fileDims:null};

/* ============================== theme ============================== */
(function(){const dark=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.setAttribute("data-theme",dark?"dark":"light")})();
$("#themeBtn").addEventListener("click",()=>{const h=document.documentElement;h.setAttribute("data-theme",h.getAttribute("data-theme")==="dark"?"light":"dark")});

/* ============================== render cards ============================== */
function cardHTML(t){
  const fav=state.favs.has(t.id);
  return '<div class="card" role="button" tabindex="0" data-tool="'+t.id+'" aria-label="'+esc(t.name)+'">'
  +(t.popular?'<span class="pop">Most used</span>':"")
  +'<button class="star'+(fav?" faved":"")+'" data-star="'+t.id+'" aria-label="Star '+esc(t.name)+' as favourite" aria-pressed="'+fav+'"><svg viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/></svg></button>'
  +'<span class="card-top"><span class="card-ic ic-'+t.color+'">'+icon(t.icon)+'</span><h3>'+esc(t.name)+"</h3></span>"
  +"<p>"+esc(t.desc)+"</p>"
  +'<span class="badges"><span class="fmt">'+esc(t.from)+'</span><span class="fmt-arrow">→</span><span class="fmt">'+esc(t.to)+"</span></span>"
  +'<span class="go">Open tool <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 12h16m-6-6 6 6-6 6"/></svg></span>'
  +"</div>";
}
function renderSections(){
  const host=$("#sectionsHost");let html="";
  for(const sec of SECTIONS){
    let tools = sec.id==="most" ? T.filter(t=>t.popular) : T.filter(t=>t.sec===sec.id||(t.alsoIn||[]).includes(sec.id));
    html+='<section class="tools-sec" data-sec="'+sec.id+'"><div class="sec-head"><h2>'+esc(sec.title)+'</h2><span class="count">'+tools.length+' tools</span></div><p class="sec-sub">'+esc(sec.sub)+'</p><div class="grid'+(sec.id==="most"?" big":"")+'">'+tools.map(cardHTML).join("")+"</div></section>";
  }
  host.innerHTML=html;
  host.querySelectorAll("[data-tool]").forEach(card=>{
    card.addEventListener("click",e=>{if(e.target.closest("[data-star]"))return;openTool(card.getAttribute("data-tool"))});
    card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){if(e.target.closest("[data-star]"))return;e.preventDefault();openTool(card.getAttribute("data-tool"))}});
  });
  host.querySelectorAll("[data-star]").forEach(btn=>{
    btn.addEventListener("click",e=>{e.stopPropagation();toggleFav(btn.getAttribute("data-star"))});
  });
  applyFilter();
}
function toggleFav(id){
  if(state.favs.has(id))state.favs.delete(id);else state.favs.add(id);
  $$('[data-star="'+id+'"]').forEach(b=>{const f=state.favs.has(id);b.classList.toggle("faved",f);b.setAttribute("aria-pressed",f)});
  applyFilter();
}

/* ============================== filter / search ============================== */
const PILLS=[["all","All tools"],["pdf","PDF"],["video","Video"],["audio","Audio"],["image","Image"],["compress","Compress"],["resize","Resize"],["fav","★ Favourites"]];
function renderPills(){
  $("#pills").innerHTML=PILLS.map(p=>'<button class="pill'+(state.filter===p[0]?" on":"")+'" data-pill="'+p[0]+'" role="tab" aria-selected="'+(state.filter===p[0])+'">'+p[1]+"</button>").join("");
  $$("#pills [data-pill]").forEach(b=>b.addEventListener("click",()=>{state.filter=b.getAttribute("data-pill");renderPills();applyFilter()}));
}
function toolMatches(t){
  if(state.filter==="fav"&&!state.favs.has(t.id))return false;
  if(state.filter==="pdf"&&!t.types.includes("pdf"))return false;
  if(state.filter==="video"&&!t.types.includes("video"))return false;
  if(state.filter==="audio"&&!t.types.includes("audio"))return false;
  if(state.filter==="image"&&!t.types.includes("image"))return false;
  if(state.filter==="compress"&&!t.tags.includes("compress"))return false;
  if(state.filter==="resize"&&!t.tags.includes("resize"))return false;
  if(state.query){
    const q=state.query.toLowerCase();
    const hay=(t.name+" "+t.desc+" "+t.from+" "+t.to+" "+t.id.replace(/-/g," ")).toLowerCase();
    if(!hay.includes(q))return false;
  }
  return true;
}
function applyFilter(){
  let anyVisible=false;
  $$("#sectionsHost [data-sec]").forEach(secEl=>{
    let visible=0;
    secEl.querySelectorAll("[data-tool]").forEach(card=>{
      const t=toolById(card.getAttribute("data-tool"));
      const show=toolMatches(t);
      card.style.display=show?"":"none";if(show)visible++;
    });
    secEl.style.display=visible?"":"none";if(visible)anyVisible=true;
  });
  $("#noResults").classList.toggle("show",!anyVisible);
}
$("#searchInput").addEventListener("input",e=>{state.query=e.target.value.trim();applyFilter()});

/* ============================== workspace ============================== */
const ws=$("#workspace");
function buildSwitcher(){
  const sel=$("#wsToolSelect");let html="";
  for(const sec of SECTIONS){if(sec.id==="most")continue;
    const tools=T.filter(t=>t.sec===sec.id);
    if(!tools.length)continue;
    html+='<optgroup label="'+esc(sec.title)+'">'+tools.map(t=>'<option value="'+t.id+'">'+esc(t.name)+"</option>").join("")+"</optgroup>";
  }
  sel.innerHTML=html;
  if(state.tool)sel.value=state.tool.id;
}
function openTool(id,keepFiles){
  const t=toolById(id);if(!t)return;
  state.tool=t;state.outputs=[];
  if(!keepFiles){state.files=[];state.fileDims=null}
  $("#wsTitle").textContent=t.name;
  $("#wsDesc").textContent=t.desc;
  $("#wsBadges").innerHTML='<span class="fmt">'+esc(t.from)+'</span><span class="fmt-arrow">→</span><span class="fmt">'+esc(t.to)+"</span>";
  $("#wsAccept").textContent="Accepts: "+t.from+" — batch supported, add as many files as you like";
  $("#wsInput").setAttribute("accept",t.accept);
  $("#wsInput").multiple=true;
  $("#wsNote").textContent=t.note||"";
  $("#results").innerHTML="";$("#wsError").className="err-box";$("#wsError").textContent="";
  $("#progressWrap").className="progress-wrap";
  buildSwitcher();buildControls();renderFiles();
  ws.classList.add("open");
  ws.scrollIntoView({behavior:"smooth",block:"start"});
  updateConvertBtn();
}
$("#wsClose").addEventListener("click",()=>{ws.classList.remove("open")});
$("#wsToolSelect").addEventListener("change",e=>openTool(e.target.value,true));

function fmtOptions(selected,opts){return opts.map(o=>'<option value="'+o[0]+'"'+(o[0]===selected?" selected":"")+">"+o[1]+"</option>").join("")}
function buildControls(){
  const t=state.tool,p=t.preset||{},host=$("#ctrlHost");let h="";
  const fmtSel=(opts,sel)=>'<div class="ctrl"><label>Output format</label><select id="cFormat">'+fmtOptions(sel,opts)+"</select></div>";
  const quality=(val)=>'<div class="ctrl"><label>Quality <output id="cQualityOut">'+val+'%</output></label><input type="range" id="cQuality" min="5" max="100" value="'+val+'" /><div class="hint">Lower quality = smaller file. 75–85% is the sweet spot for photos.</div></div>';
  const target=(val)=>'<div class="ctrl"><label>Target size (KB)</label><input type="number" id="cTarget" min="5" max="10240" value="'+val+'" /><div class="hint">We re-encode until the result fits under this size.</div></div>';
  if(t.engine==="image"){
    if(p.mode==="physical"){
      h+='<div class="ctrl"><label>Print width × height</label><div class="dim-row"><input type="number" id="cPW" value="'+p.pw+'" step="any" min="0.1" /><span>×</span><input type="number" id="cPH" value="'+p.ph+'" step="any" min="0.1" /></div></div>';
      h+='<div class="ctrl"><label>Unit</label><select id="cUnit">'+fmtOptions(p.unit,[["cm","Centimetres (cm)"],["mm","Millimetres (mm)"],["in","Inches (in)"]])+"</select></div>";
      h+='<div class="ctrl"><label>DPI (print resolution)</label><input type="number" id="cDPI" value="'+(p.dpi||300)+'" min="72" max="1200" /><div class="hint">300 DPI is standard for print. Output pixels = size × DPI ÷ unit size.</div></div>';
      h+=fmtSel([["image/jpeg","JPG"],["image/png","PNG"],["image/webp","WebP"]],"image/jpeg");
      h+=quality(88);
    }else if(p.mode==="dpi"){
      h+='<div class="ctrl"><label>New DPI</label><select id="cDPI">'+fmtOptions(String(p.dpi||300),[["72","72 DPI — screen"],["150","150 DPI — draft print"],["200","200 DPI — good print"],["300","300 DPI — standard print"],["600","600 DPI — high-end print"]])+"</select></div>";
    }else if(p.mode==="rotate"){
      h+='<div class="ctrl"><label>Rotate by</label><select id="cRotate">'+fmtOptions("90",[["90","90° clockwise"],["180","180°"],["270","270° clockwise"]])+"</select></div>";
      h+=fmtSel([["image/jpeg","JPG"],["image/png","PNG"],["image/webp","WebP"]],"image/jpeg");
    }else if(p.mode==="resize"){
      h+='<div class="ctrl"><label>Width × Height (px)</label><div class="dim-row"><input type="number" id="cW" placeholder="Width" min="1" /><span>×</span><input type="number" id="cH" placeholder="Height" min="1" /></div><div class="hint">Prefilled from your first file — change either side.</div></div>';
      h+='<div class="ctrl"><label>Fit</label><div class="seg" id="cFitSeg"><button type="button" data-fit="keep" class="on">Keep aspect</button><button type="button" data-fit="exact">Exact size</button></div></div>';
      h+=fmtSel([["image/jpeg","JPG"],["image/png","PNG"],["image/webp","WebP"]],"image/jpeg");
      h+=quality(88);
    }else if(p.mode==="cover"&&p.editableDims){
      h+='<div class="ctrl"><label>Width × Height (px)</label><div class="dim-row"><input type="number" id="cW" value="'+p.w+'" min="1" /><span>×</span><input type="number" id="cH" value="'+p.h+'" min="1" /></div></div>';
      h+=fmtSel([["image/jpeg","JPG"],["image/png","PNG"],["image/webp","WebP"]],"image/jpeg");
      h+=quality(90);
    }else if(p.mode==="cover"||p.mode==="sheet"){
      h+=fmtSel([["image/jpeg","JPG"],["image/png","PNG"]],"image/jpeg");
      h+=quality(92);
    }else{ /* same size: convert / compress */
      if(p.format){h+=fmtSel([[p.format,p.format==="image/png"?"PNG":p.format==="image/webp"?"WebP":"JPG"]],p.format)}
      else{h+=fmtSel([["image/jpeg","JPG"],["image/png","PNG"],["image/webp","WebP"]],"image/jpeg")}
      if(p.targetKB||p.targetEditable){h+=target(p.targetKB||100)}
      else{h+=quality(p.quality||85)}
    }
    if((p.targetKB||p.targetEditable)&&(p.mode==="cover")){h+=target(p.targetKB)}
  }
  if(t.engine==="imgpdf"){
    if(p.targetKB){h+=target(p.targetKB)}
    else{h+='<div class="ctrl"><label>Page image quality <output id="cQualityOut">82%</output></label><input type="range" id="cQuality" min="30" max="100" value="82" /><div class="hint">Higher quality = sharper pages, bigger PDF.</div></div>'}
    h+='<p class="hint" style="font-size:.82rem;color:var(--muted)">Pages appear in the order files are listed. Drag in more images to add pages.</p>';
  }
  if(t.engine==="pdfjpg"){
    h+=fmtSel([[p.format||"image/jpeg",(p.format==="image/png")?"PNG":"JPG"]],p.format||"image/jpeg");
    h+='<div class="ctrl"><label>Render resolution</label><select id="cScale">'+fmtOptions("2",[["1","1× — screen"],["1.5","1.5× — sharp"],["2","2× — print"],["3","3× — maximum"]])+'</select><div class="hint">Each page becomes one image; download them all as a ZIP.</div></div>';
  }
  if(t.engine==="pdfcompress"){
    h+='<div class="ctrl"><label>Compression strength <output id="cQualityOut">55%</output></label><input type="range" id="cQuality" min="10" max="90" value="55" /><div class="hint">Higher = smaller file, softer pages. 50–60% suits most form uploads.</div></div>';
  }
  if(t.engine==="pdfrotate"){
    h+='<div class="ctrl"><label>Rotate all pages by</label><select id="cRotate">'+fmtOptions("90",[["90","90°"],["180","180°"],["270","270°"]])+"</select></div>";
  }
  if(t.engine==="audio"||t.engine==="mp4mp3"){
    const def=p.format||"mp3";
    h+=fmtSel([["mp3","MP3"],["wav","WAV (lossless)"]],def);
    h+='<div class="ctrl" id="bitrateCtrl"><label>MP3 bitrate <output id="cBitrateOut">'+(p.bitrate||192)+' kbps</output></label><input type="range" id="cBitrate" min="32" max="320" step="16" value="'+(p.bitrate||192)+'" /><div class="hint">128 kbps ≈ voice & podcasts · 192 kbps balanced · 320 kbps maximum MP3 quality.</div></div>';
  }
  if(t.engine==="video"){
    h+='<div class="ctrl"><label>Output height</label><select id="cHeight">'+fmtOptions(String(p.height||0),[["0","Original"],["1080","1080p"],["720","720p"],["480","480p"],["360","360p"]])+"</select></div>";
    h+='<div class="ctrl"><label>Video bitrate <output id="cBitrateOut">'+(p.mbps||3)+' Mbps</output></label><input type="range" id="cBitrate" min="0.5" max="12" step="0.5" value="'+(p.mbps||3)+'" /><div class="hint">Lower bitrate = smaller WebM. Output is WebM (VP8/VP9) — the web-native format.</div></div>';
  }
  if(t.engine==="pdfmerge"||t.engine==="pdfword"||t.engine==="pdftext"){
    h+='<p style="font-size:.88rem;color:var(--muted);margin:0">No settings needed — just add your files and convert.</p>';
  }
  host.innerHTML=h;
  const q=$("#cQuality");if(q)q.addEventListener("input",()=>{const o=$("#cQualityOut");if(o)o.textContent=q.value+"%"});
  const b=$("#cBitrate");if(b)b.addEventListener("input",()=>{const o=$("#cBitrateOut");if(o)o.textContent=(state.tool.engine==="video"?b.value+" Mbps":b.value+" kbps")});
  const fsel=$("#cFormat");if(fsel&&$("#bitrateCtrl")){const sync=()=>{$("#bitrateCtrl").style.display=fsel.value==="mp3"?"":"none"};fsel.addEventListener("change",sync);sync()}
  const seg=$("#cFitSeg");if(seg)seg.querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>{seg.querySelectorAll("button").forEach(x=>x.classList.remove("on"));btn.classList.add("on")}));
  if(state.fileDims&&(p.mode==="resize")){const w=$("#cW"),hh=$("#cH");if(w&&!w.value)w.value=state.fileDims.w;if(hh&&!hh.value)hh.value=state.fileDims.h}
}
function getOpts(){
  const o={};const v=id=>{const e=$(id);return e?e.value:null};
  o.format=v("#cFormat");o.quality=parseInt(v("#cQuality")||"85",10);
  o.targetKB=parseFloat(v("#cTarget")||"0")||0;o.w=parseInt(v("#cW")||"0",10)||0;o.h=parseInt(v("#cH")||"0",10)||0;
  o.pw=parseFloat(v("#cPW")||"0")||0;o.ph=parseFloat(v("#cPH")||"0")||0;o.unit=v("#cUnit");o.dpi=parseInt(v("#cDPI")||"300",10)||300;
  o.rotate=parseInt(v("#cRotate")||"90",10);o.scale=parseFloat(v("#cScale")||"2");o.height=parseInt(v("#cHeight")||"0",10);
  o.bitrate=parseInt(v("#cBitrate")||"192",10);o.mbps=parseFloat(v("#cBitrate")||"3");
  const seg=$("#cFitSeg .on");o.fit=seg?seg.getAttribute("data-fit"):"keep";
  return o;
}

/* ============================== files ============================== */
const wsInput=$("#wsInput");
$("#wsDrop").addEventListener("click",()=>wsInput.click());
$("#wsDrop").addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();wsInput.click()}});
wsInput.addEventListener("change",()=>{addFiles(wsInput.files);wsInput.value=""});
["dragover","dragenter"].forEach(ev=>$("#wsDrop").addEventListener(ev,e=>{e.preventDefault();$("#wsDrop").classList.add("drag")}));
["dragleave","drop"].forEach(ev=>$("#wsDrop").addEventListener(ev,e=>{e.preventDefault();$("#wsDrop").classList.remove("drag")}));
$("#wsDrop").addEventListener("drop",e=>addFiles(e.dataTransfer.files));

function fileKind(f){
  if(f.type.startsWith("image/")||/^(heic|heif|avif|bmp)$/.test(extOf(f.name)))return"image";
  if(f.type==="application/pdf"||extOf(f.name)==="pdf")return"pdf";
  if(f.type.startsWith("video/"))return"video";
  if(f.type.startsWith("audio/")||/^(flac|opus|m4a)$/.test(extOf(f.name)))return"audio";
  return"file";
}
function addFiles(list){
  for(const f of list){state.files.push({file:f,info:"",url:URL.createObjectURL(f)})}
  renderFiles();probeFiles();updateConvertBtn();
}
function removeFile(i){URL.revokeObjectURL(state.files[i].url);state.files.splice(i,1);renderFiles();updateConvertBtn()}
function renderFiles(){
  const host=$("#fileList");
  host.innerHTML=state.files.map((it,i)=>{
    const f=it.file,k=fileKind(f);
    const thumb=k==="image"?'<img src="'+it.url+'" alt="" />':'<span class="fthumb">'+icon(k==="pdf"?"pdf":k==="video"?"video":k==="audio"?"audio":"text")+"</span>";
    return '<div class="file-item">'+thumb+'<span class="fmeta"><span class="fname">'+esc(f.name)+'</span><br /><span class="finfo">'+fmtBytes(f.size)+(f.type?" · "+esc(f.type):"")+(it.info?" · "+esc(it.info):"")+'</span></span><button class="fx" data-rm="'+i+'" aria-label="Remove '+esc(f.name)+'">✕</button></div>';
  }).join("");
  host.querySelectorAll("[data-rm]").forEach(b=>b.addEventListener("click",()=>removeFile(parseInt(b.getAttribute("data-rm"),10))));
  renderPreview();
}
function renderPreview(){
  const box=$("#previewBox");if(!state.files.length){box.innerHTML="";return}
  const it=state.files[0],k=fileKind(it.file);
  if(k==="image")box.innerHTML='<img src="'+it.url+'" alt="Preview of '+esc(it.file.name)+'" style="border-radius:14px;border:1px solid var(--line);max-height:300px;width:auto;max-width:100%" />';
  else if(k==="video")box.innerHTML='<video src="'+it.url+'" controls playsinline style="border-radius:14px;border:1px solid var(--line)"></video>';
  else if(k==="audio")box.innerHTML='<audio src="'+it.url+'" controls></audio>';
  else box.innerHTML="";
}
async function probeFiles(){
  for(const it of state.files){
    if(it.probed)continue;it.probed=true;const f=it.file,k=fileKind(f);
    try{
      if(k==="image"){const bmp=await loadBitmap(f);it.info=bmp.width+" × "+bmp.height+" px";if(!state.fileDims){state.fileDims={w:bmp.width,h:bmp.height};const t=state.tool;if(t&&(t.preset||{}).mode==="resize"){const w=$("#cW"),h=$("#cH");if(w&&!w.value)w.value=bmp.width;if(h&&!h.value)h.value=bmp.height}}if(bmp.close)bmp.close()}
      else if(k==="video"||k==="audio"){const info=await mediaInfo(it.url,k);it.info=info}
      else if(k==="pdf"&&window.pdfjsLib){const doc=await pdfDoc(f);it.info=doc.numPages+" page"+(doc.numPages>1?"s":"")}
    }catch(e){/* info is best-effort */}
    renderFiles();
  }
}
function mediaInfo(url,kind){return new Promise(res=>{const el=document.createElement(kind);el.preload="metadata";el.src=url;el.onloadedmetadata=()=>{const d=fmtTime(el.duration);const dims=kind==="video"&&el.videoWidth?el.videoWidth+" × "+el.videoHeight+" px · ":"";res(dims+d)};el.onerror=()=>res("")})}
function updateConvertBtn(){
  const btn=$("#convertBtn");const t=state.tool;
  btn.disabled=!state.files.length;
  btn.textContent=!t?"Convert":state.files.length>1&&t.engine!=="imgpdf"&&t.engine!=="pdfmerge"?"Convert "+state.files.length+" files":"Convert";
}
$("#convertBtn").addEventListener("click",runConvert);

/* ============================== hero dropzone ============================== */
const heroInput=$("#heroInput");
$("#heroDrop").addEventListener("click",()=>heroInput.click());
$("#heroDrop").addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();heroInput.click()}});
heroInput.addEventListener("change",()=>{heroFiles(heroInput.files);heroInput.value=""});
["dragover","dragenter"].forEach(ev=>$("#heroDrop").addEventListener(ev,e=>{e.preventDefault();$("#heroDrop").classList.add("drag")}));
["dragleave","drop"].forEach(ev=>$("#heroDrop").addEventListener(ev,e=>{e.preventDefault();$("#heroDrop").classList.remove("drag")}));
$("#heroDrop").addEventListener("drop",e=>heroFiles(e.dataTransfer.files));
function heroFiles(list){
  if(!list||!list.length)return;
  const k=fileKind(list[0]);
  const def={image:"image-converter",pdf:"pdf-to-jpg",video:"video-converter",audio:"audio-converter"}[k]||"image-converter";
  openTool(def);addFiles(list);
}

/* ============================== progress / results ============================== */
function setProgress(pct,label){
  $("#progressWrap").className="progress-wrap show";
  $("#progressFill").style.width=Math.max(0,Math.min(100,pct))+"%";
  if(label)$("#progressLabel").textContent=label;
}
function showError(msg){const e=$("#wsError");e.textContent=msg;e.className="err-box show"}
function renderResults(){
  const host=$("#results");
  host.innerHTML=state.outputs.map((o,i)=>{
    const pct=o.inSize?Math.round((1-o.blob.size/o.inSize)*100):0;
    const sizeLine=o.inSize?fmtBytes(o.inSize)+" → <strong>"+fmtBytes(o.blob.size)+"</strong> · "+(pct>0?'<span class="saved">'+pct+"% smaller</span>":pct<0?'<span class="grew">'+Math.abs(pct)+"% larger</span>":"same size"):"<strong>"+fmtBytes(o.blob.size)+"</strong>";
    return '<div class="result-item"><span class="rmeta"><span class="rname">'+esc(o.name)+'</span><br /><span class="rsizes">'+sizeLine+(o.note?'<br /><span style="color:var(--amber);font-weight:600">'+esc(o.note)+"</span>":"")+'</span></span><a class="dl-btn" href="'+o.url+'" download="'+esc(o.name)+'">Download</a></div>';
  }).join("")+(state.outputs.length>1?'<button class="zip-btn" id="zipBtn">Download all '+state.outputs.length+' files as ZIP</button>':"");
  const zb=$("#zipBtn");if(zb)zb.addEventListener("click",downloadZip);
}
async function downloadZip(){
  const btn=$("#zipBtn");btn.textContent="Building ZIP…";btn.disabled=true;
  try{
    const items=[];for(const o of state.outputs){items.push({name:o.name,data:new Uint8Array(await o.blob.arrayBuffer())})}
    const zip=zipStore(items);const url=URL.createObjectURL(zip);
    const a=document.createElement("a");a.href=url;a.download="converted-files.zip";a.click();setTimeout(()=>URL.revokeObjectURL(url),4000);
  }catch(e){showError("ZIP failed: "+e.message)}
  btn.textContent="Download all as ZIP";btn.disabled=false;
}
function addRecents(){
  for(const o of state.outputs){state.recents.unshift({name:o.name,tool:state.tool.name,inSize:o.inSize,outSize:o.blob.size,url:o.url,time:new Date()})}
  state.recents=state.recents.slice(0,12);
  const sec=$("#recents");sec.classList.add("show");
  $("#recentList").innerHTML=state.recents.map(r=>'<div class="recent-item"><span class="rmeta" style="flex:1;min-width:170px"><strong style="font-size:.92rem">'+esc(r.name)+'</strong><br /><span style="font-size:.8rem;color:var(--muted)">'+esc(r.tool)+" · "+(r.inSize?fmtBytes(r.inSize)+" → ":"")+fmtBytes(r.outSize)+" · "+r.time.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})+'</span></span><a class="dl-btn" href="'+r.url+'" download="'+esc(r.name)+'">Download</a></div>').join("");
}

/* ============================== convert orchestration ============================== */
async function runConvert(){
  const t=state.tool;if(!t||!state.files.length)return;
  const opts=getOpts();const btn=$("#convertBtn");
  btn.disabled=true;state.outputs=[];$("#results").innerHTML="";$("#wsError").className="err-box";
  setProgress(2,"Starting…");
  try{
    if(t.engine==="imgpdf"||t.engine==="pdfmerge"){
      const outs=await processMulti(t,state.files.map(x=>x.file),opts,(p,l)=>setProgress(p,l));
      for(const o of outs)state.outputs.push(o);
    }else{
      let done=0;
      for(const it of state.files){
        const outs=await processOne(t,it.file,opts,(p,l)=>setProgress(Math.round(((done+p/100)/state.files.length)*100),l));
        for(const o of outs)state.outputs.push(o);
        done++;setProgress(Math.round((done/state.files.length)*100),"Converted "+done+" of "+state.files.length);
      }
    }
    for(const o of state.outputs)o.url=URL.createObjectURL(o.blob);
    setProgress(100,"Done — your files are ready below.");
    renderResults();addRecents();
  }catch(e){
    console.error(e);showError(friendlyError(e));$("#progressWrap").className="progress-wrap";
  }
  btn.disabled=false;updateConvertBtn();
}
function friendlyError(e){
  const m=(e&&e.message)||String(e);
  if(/pdfjs|PDF engine/i.test(m))return m;
  if(/decode|decodeAudioData/i.test(m))return "Your browser couldn't decode that file. It may use a codec browsers don't support (common with MKV/AVI/WMV) — try an MP4, MP3 or WAV version of the file.";
  if(/MediaRecorder/i.test(m))return "This browser doesn't support in-browser video recording/conversion. Try Chrome, Edge or Firefox on desktop.";
  return "Conversion failed: "+m;
}

/* ============================== init ============================== */
renderSections();renderPills();
