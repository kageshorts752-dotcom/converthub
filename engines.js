
"use strict";
/* ============================== image engine ============================== */
async function loadBitmap(file){
  if(window.createImageBitmap){
    try{return await createImageBitmap(file,{imageOrientation:"from-image"})}catch(e){}
    try{return await createImageBitmap(file)}catch(e){}
  }
  return new Promise((res,rej)=>{const url=URL.createObjectURL(file);const img=new Image();img.onload=()=>res(img);img.onerror=()=>rej(new Error("decode: this browser could not open the image"));img.src=url});
}
function canvasOf(w,h){const c=document.createElement("canvas");c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c}
function drawCoverAt(ctx,bmp,x,y,W,H){const s=Math.max(W/bmp.width,H/bmp.height);const w=bmp.width*s,h=bmp.height*s;ctx.drawImage(bmp,x+(W-w)/2,y+(H-h)/2,w,h)}
function drawFitAt(ctx,bmp,x,y,W,H){const s=Math.min(W/bmp.width,H/bmp.height);const w=bmp.width*s,h=bmp.height*s;ctx.drawImage(bmp,x+(W-w)/2,y+(H-h)/2,w,h)}
function canvasBlob(c,mime,q){return new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error("This browser could not encode that format")),mime,q))}

function imageRender(bmp,t,opts,sf,bgWhite){
  const p=t.preset||{},mode=p.mode||"same";let W,H,paint;
  if(mode==="resize"){
    const w=opts.w||0,h=opts.h||0;
    if(opts.fit==="exact"&&(w||h)){W=w||bmp.width;H=h||bmp.height}
    else if(w&&h){const s=Math.min(w/bmp.width,h/bmp.height);W=Math.round(bmp.width*s);H=Math.round(bmp.height*s)}
    else if(w){W=w;H=Math.round(bmp.height*w/bmp.width)}
    else if(h){H=h;W=Math.round(bmp.width*h/bmp.height)}
    else{W=bmp.width;H=bmp.height}
    paint=(ctx,cw,ch)=>ctx.drawImage(bmp,0,0,cw,ch);
  }else if(mode==="cover"){
    W=opts.w||p.w;H=opts.h||p.h;paint=(ctx,cw,ch)=>drawCoverAt(ctx,bmp,0,0,cw,ch);
  }else if(mode==="physical"){
    const dpi=opts.dpi||300,f=opts.unit==="mm"?dpi/25.4:opts.unit==="in"?dpi:dpi/2.54;
    W=Math.round((opts.pw||p.pw)*f);H=Math.round((opts.ph||p.ph)*f);
    paint=(ctx,cw,ch)=>drawFitAt(ctx,bmp,0,0,cw,ch);
  }else if(mode==="rotate"){
    const a=opts.rotate||90;
    if(a===90||a===270){W=bmp.height;H=bmp.width}else{W=bmp.width;H=bmp.height}
    paint=(ctx,cw,ch)=>{ctx.save();ctx.translate(cw/2,ch/2);ctx.rotate(a*Math.PI/180);if(a===90||a===270)ctx.drawImage(bmp,-H/2,-W/2,H,W);else ctx.drawImage(bmp,-W/2,-H/2,W,H);ctx.restore()};
  }else if(mode==="sheet"){
    W=1200;H=1800;
    paint=(ctx,cw,ch)=>{const tw=413*(cw/1200),th=531*(ch/1800),mx=(cw-tw*2)/3,my=(ch-th*3)/4;
      for(let r=0;r<3;r++)for(let c=0;c<2;c++){const x=mx+c*(tw+mx),y=my+r*(th+my);ctx.save();ctx.beginPath();ctx.rect(x,y,tw,th);ctx.clip();drawCoverAt(ctx,bmp,x,y,tw,th);ctx.restore()}};
  }else{W=bmp.width;H=bmp.height;paint=(ctx,cw,ch)=>ctx.drawImage(bmp,0,0,cw,ch)}
  W=Math.max(1,Math.round(W*sf));H=Math.max(1,Math.round(H*sf));
  const c=canvasOf(W,H),ctx=c.getContext("2d");
  if(bgWhite||mode==="physical"||mode==="sheet"){ctx.fillStyle="#ffffff";ctx.fillRect(0,0,W,H)}
  paint(ctx,W,H);return c;
}
async function encodeTarget(bmp,t,opts,mime,target){
  let scale=1,best=null;
  for(let iter=0;iter<6;iter++){
    const c=imageRender(bmp,t,opts,scale,mime==="image/jpeg");
    let lo=0.05,hi=0.95,found=null;
    for(let i=0;i<7;i++){const q=(lo+hi)/2;const b=await canvasBlob(c,mime,q);
      if(b.size<=target){found={blob:b,w:c.width,h:c.height};lo=q}else{hi=q;if(!best||b.size<best.blob.size)best={blob:b,w:c.width,h:c.height}}}
    if(found)return found;scale*=0.8;
  }
  return best;
}
function setJpegDpi(buf,dpi){
  const b=new Uint8Array(buf);
  if(b.length<4||b[0]!==0xFF||b[1]!==0xD8)return new Blob([buf],{type:"image/jpeg"});
  if(b[2]===0xFF&&b[3]===0xE0&&b[6]===0x4A&&b[7]===0x46&&b[8]===0x49&&b[9]===0x46){
    b[13]=1;b[14]=(dpi>>8)&255;b[15]=dpi&255;b[16]=(dpi>>8)&255;b[17]=dpi&255;
    return new Blob([b],{type:"image/jpeg"});
  }
  const app0=new Uint8Array([0xFF,0xE0,0x00,0x10,0x4A,0x46,0x49,0x46,0x00,0x01,0x01,0x01,(dpi>>8)&255,dpi&255,(dpi>>8)&255,dpi&255,0x00,0x00]);
  const out=new Uint8Array(b.length+app0.length);out.set(b.subarray(0,2),0);out.set(app0,2);out.set(b.subarray(2),2+app0.length);
  return new Blob([out],{type:"image/jpeg"});
}
async function imageProcess(file,t,opts,onP){
  onP(25,"Loading image…");
  const bmp=await loadBitmap(file);const p=t.preset||{};
  const mime=opts.format||p.format||"image/jpeg";
  const ext=mime==="image/png"?"png":mime==="image/webp"?"webp":"jpg";
  const target=opts.targetKB?opts.targetKB*1024:(p.targetEditable?0:(p.targetKB&&p.mode!=="same"?p.targetKB*1024:0));
  let blob;
  if(target){onP(55,"Re-encoding to fit "+fmtBytes(target)+"…");const r=await encodeTarget(bmp,t,opts,mime,target);blob=r.blob}
  else{onP(60,"Encoding…");blob=await canvasBlob(imageRender(bmp,t,opts,1,mime==="image/jpeg"),mime,(opts.quality||88)/100)}
  if(p.mode==="dpi"&&mime==="image/jpeg"){blob=setJpegDpi(await blob.arrayBuffer(),opts.dpi||p.dpi||300)}
  if(bmp.close)bmp.close();
  const suffix=t.tags.includes("compress")?"-compressed":t.tags.includes("resize")?"-resized":"-converted";
  onP(100,"Done");
  return[{name:baseName(file.name)+suffix+"."+ext,blob,inSize:file.size}];
}

/* ============================== PDF builder (images -> PDF) ============================== */
function buildPdf(pages){
  const chunks=[];let pos=0;const offsets={};
  const pushStr=s=>{const u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i)&0xFF;chunks.push(u);pos+=u.length};
  const pushBin=u=>{chunks.push(u);pos+=u.length};
  const kids=pages.map((pg,i)=>(3+3*i)+" 0 R").join(" ");
  pushStr("%PDF-1.4\n");
  offsets[1]=pos;pushStr("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  offsets[2]=pos;pushStr("2 0 obj\n<< /Type /Pages /Kids ["+kids+"] /Count "+pages.length+" >>\nendobj\n");
  pages.forEach((pg,i)=>{
    const pageObj=3+3*i,contObj=4+3*i,imgObj=5+3*i;
    const W=(pg.w*72/200).toFixed(1),H=(pg.h*72/200).toFixed(1);
    offsets[pageObj]=pos;pushStr(pageObj+" 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+W+" "+H+"] /Resources << /XObject << /Im0 "+imgObj+" 0 R >> >> /Contents "+contObj+" 0 R >>\nendobj\n");
    const stream="q\n"+W+" 0 0 "+H+" 0 0 cm\n/Im0 Do\nQ\n";
    offsets[contObj]=pos;pushStr(contObj+" 0 obj\n<< /Length "+stream.length+" >>\nstream\n"+stream+"endstream\nendobj\n");
    offsets[imgObj]=pos;pushStr(imgObj+" 0 obj\n<< /Type /XObject /Subtype /Image /Width "+pg.w+" /Height "+pg.h+" /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length "+pg.data.length+" >>\nstream\n");
    pushBin(pg.data);pushStr("\nendstream\nendobj\n");
  });
  const maxObj=2+3*pages.length;const xrefPos=pos;
  let xref="xref\n0 "+(maxObj+1)+"\n0000000000 65535 f \n";
  for(let n=1;n<=maxObj;n++)xref+=String(offsets[n]).padStart(10,"0")+" 00000 n \n";
  pushStr(xref+"trailer\n<< /Size "+(maxObj+1)+" /Root 1 0 R >>\nstartxref\n"+xrefPos+"\n%%EOF");
  return new Blob(chunks,{type:"application/pdf"});
}
async function imgpdfProcess(files,t,opts,onP){
  const targetTotal=(opts.targetKB||(t.preset||{}).targetKB||0)*1024;
  const makePages=async budget=>{
    const pages=[];
    for(let i=0;i<files.length;i++){
      onP(Math.round((i/files.length)*80),"Adding page "+(i+1)+" of "+files.length+"…");
      const bmp=await loadBitmap(files[i]);
      let blob,w,h;
      if(budget){const r=await encodeTarget(bmp,{preset:{mode:"same"}},{},"image/jpeg",budget);blob=r.blob;w=r.w;h=r.h}
      else{const s=Math.min(1,2200/Math.max(bmp.width,bmp.height));const c=imageRender(bmp,{preset:{mode:"same"}},{},s,false);blob=await canvasBlob(c,"image/jpeg",(opts.quality||82)/100);w=c.width;h=c.height}
      if(bmp.close)bmp.close();
      pages.push({data:new Uint8Array(await blob.arrayBuffer()),w,h});
    }
    return pages;
  };
  let pages=await makePages(targetTotal?targetTotal*0.92/files.length:0);
  let pdf=buildPdf(pages);
  if(targetTotal&&pdf.size>targetTotal){onP(88,"Still over target — compressing harder…");pages=await makePages(targetTotal*0.7/files.length);pdf=buildPdf(pages)}
  onP(100,"Done");
  const totalIn=files.reduce((a,f)=>a+f.size,0);
  const name=files.length===1?baseName(files[0].name)+".pdf":"combined-"+files.length+"-images.pdf";
  return[{name,blob:pdf,inSize:totalIn,note:targetTotal&&pdf.size>targetTotal?"Couldn't quite reach "+fmtBytes(targetTotal)+" — this is the smallest legible result.":undefined}];
}

/* ============================== PDF tools (pdf.js / pdf-lib) ============================== */
function ensurePdfJs(){if(!window.pdfjsLib)throw new Error("PDF engine could not load — the pdf.js library was blocked. Check your connection and reload the page.");window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"}
async function pdfDoc(file){ensurePdfJs();const data=await file.arrayBuffer();return await window.pdfjsLib.getDocument({data}).promise}
async function pdfjpgProcess(file,t,opts,onP){
  const doc=await pdfDoc(file);const mime=(t.preset||{}).format||"image/jpeg";const ext=mime==="image/png"?"png":"jpg";
  const outs=[];
  for(let p=1;p<=doc.numPages;p++){
    onP(Math.round((p/doc.numPages)*100),"Rendering page "+p+" of "+doc.numPages+"…");
    const page=await doc.getPage(p);const vp=page.getViewport({scale:opts.scale||2});
    const c=canvasOf(vp.width,vp.height);const ctx=c.getContext("2d");ctx.fillStyle="#ffffff";ctx.fillRect(0,0,c.width,c.height);
    await page.render({canvasContext:ctx,viewport:vp}).promise;
    const blob=await canvasBlob(c,mime,0.92);
    outs.push({name:baseName(file.name)+"-page-"+p+"."+ext,blob,inSize:p===1?file.size:undefined});
  }
  return outs;
}
async function extractPdfText(file){
  const doc=await pdfDoc(file);const pages=[];
  for(let p=1;p<=doc.numPages;p++){const page=await doc.getPage(p);const tc=await page.getTextContent();
    let lastY=null,txt="";
    for(const it of tc.items){const y=it.transform?it.transform[5]:0;if(lastY!==null&&Math.abs(y-lastY)>2)txt+="\n";txt+=it.str+" ";lastY=y}
    pages.push(txt.trim());
  }
  return pages;
}
async function pdftextProcess(file,t,opts,onP){
  onP(50,"Extracting text…");const pages=await extractPdfText(file);
  const text=pages.map((x,i)=>"===== Page "+(i+1)+" =====\n\n"+x).join("\n\n");
  onP(100,"Done");
  return[{name:baseName(file.name)+".txt",blob:new Blob([text],{type:"text/plain"}),inSize:file.size}];
}
async function pdfwordProcess(file,t,opts,onP){
  onP(50,"Extracting text…");const pages=await extractPdfText(file);
  const body=pages.map((x,i)=>"<h2>Page "+(i+1)+"</h2><p>"+esc(x).replace(/\n/g,"<br />")+"</p>").join("\n");
  const html='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8" /><title>'+esc(baseName(file.name))+"</title></head><body>"+body+"</body></html>";
  onP(100,"Done");
  return[{name:baseName(file.name)+".doc",blob:new Blob([html],{type:"application/msword"}),inSize:file.size}];
}
async function pdfcompressProcess(file,t,opts,onP){
  const doc=await pdfDoc(file);const s=opts.quality||55;
  const scale=1.6-(s/100)*1.1,jq=0.85-(s/100)*0.55;const pages=[];
  for(let p=1;p<=doc.numPages;p++){
    onP(Math.round((p/doc.numPages)*90),"Compressing page "+p+" of "+doc.numPages+"…");
    const page=await doc.getPage(p);const vp=page.getViewport({scale});
    const c=canvasOf(vp.width,vp.height);const ctx=c.getContext("2d");ctx.fillStyle="#ffffff";ctx.fillRect(0,0,c.width,c.height);
    await page.render({canvasContext:ctx,viewport:vp}).promise;
    const blob=await canvasBlob(c,"image/jpeg",jq);
    pages.push({data:new Uint8Array(await blob.arrayBuffer()),w:c.width,h:c.height});
  }
  onP(100,"Done");
  return[{name:baseName(file.name)+"-compressed.pdf",blob:buildPdf(pages),inSize:file.size}];
}
function ensurePdfLib(){if(!window.PDFLib)throw new Error("PDF engine could not load — the pdf-lib library was blocked. Check your connection and reload the page.")}
async function pdfmergeProcess(files,opts,onP){
  ensurePdfLib();const merged=await window.PDFLib.PDFDocument.create();
  for(let i=0;i<files.length;i++){
    onP(Math.round((i/files.length)*90),"Merging file "+(i+1)+" of "+files.length+"…");
    const src=await window.PDFLib.PDFDocument.load(await files[i].arrayBuffer(),{ignoreEncryption:true});
    const copied=await merged.copyPages(src,src.getPageIndices());
    copied.forEach(pg=>merged.addPage(pg));
  }
  const bytes=await merged.save();onP(100,"Done");
  const totalIn=files.reduce((a,f)=>a+f.size,0);
  return[{name:"merged.pdf",blob:new Blob([bytes],{type:"application/pdf"}),inSize:totalIn}];
}
async function pdfrotateProcess(file,t,opts,onP){
  ensurePdfLib();onP(50,"Rotating pages…");
  const doc=await window.PDFLib.PDFDocument.load(await file.arrayBuffer(),{ignoreEncryption:true});
  for(const pg of doc.getPages()){pg.setRotation(window.PDFLib.degrees(pg.getRotation().angle+(opts.rotate||90)))}
  const bytes=await doc.save();onP(100,"Done");
  return[{name:baseName(file.name)+"-rotated.pdf",blob:new Blob([bytes],{type:"application/pdf"}),inSize:file.size}];
}

/* ============================== audio engine ============================== */
let _ac=null;
function actx(){if(!_ac)_ac=new (window.AudioContext||window.webkitAudioContext)();if(_ac.state==="suspended")_ac.resume();return _ac}
async function decodeAudioBuf(buf){const ctx=actx();return await ctx.decodeAudioData(buf.slice(0))}
async function decodeAudioFile(file){return decodeAudioBuf(await file.arrayBuffer())}
function floatTo16(f){const o=new Int16Array(f.length);for(let i=0;i<f.length;i++){const s=Math.max(-1,Math.min(1,f[i]));o[i]=s<0?s*0x8000:s*0x7FFF}return o}
function wavBlob(buffer){
  const ch=Math.min(2,buffer.numberOfChannels),sr=buffer.sampleRate,len=buffer.length;
  const bytes=44+len*ch*2;const ab=new ArrayBuffer(bytes);const v=new DataView(ab);
  const wstr=(off,s)=>{for(let i=0;i<s.length;i++)v.setUint8(off+i,s.charCodeAt(i))};
  wstr(0,"RIFF");v.setUint32(4,bytes-8,true);wstr(8,"WAVE");wstr(12,"fmt ");v.setUint32(16,16,true);
  v.setUint16(20,1,true);v.setUint16(22,ch,true);v.setUint32(24,sr,true);v.setUint32(28,sr*ch*2,true);
  v.setUint16(32,ch*2,true);v.setUint16(34,16,true);wstr(36,"data");v.setUint32(40,len*ch*2,true);
  const chans=[];for(let c=0;c<ch;c++)chans.push(buffer.getChannelData(c));
  let off=44;for(let i=0;i<len;i++)for(let c=0;c<ch;c++){const s=Math.max(-1,Math.min(1,chans[c][i]));v.setInt16(off,s<0?s*0x8000:s*0x7FFF,true);off+=2}
  return new Blob([ab],{type:"audio/wav"});
}
function mp3Blob(buffer,kbps){
  const Ctor=(window.lamejs&&window.lamejs.Mp3Encoder)||window.Mp3Encoder;
  if(!Ctor)return null;
  const ch=buffer.numberOfChannels>=2?2:1;
  const enc=new Ctor(ch,buffer.sampleRate,kbps);
  const left=floatTo16(buffer.getChannelData(0));
  const right=ch===2?floatTo16(buffer.getChannelData(1)):null;
  const parts=[];
  for(let i=0;i<left.length;i+=1152){
    const d=ch===2?enc.encodeBuffer(left.subarray(i,i+1152),right.subarray(i,i+1152)):enc.encodeBuffer(left.subarray(i,i+1152));
    if(d.length)parts.push(new Uint8Array(d));
  }
  const end=enc.flush();if(end.length)parts.push(new Uint8Array(end));
  return new Blob(parts,{type:"audio/mpeg"});
}
async function encodeAudioBuffer(buf,file,t,opts,onP,baseLabel){
  const fmt=opts.format||(t.preset||{}).format||"mp3";
  if(fmt==="wav"){onP(85,"Encoding WAV…");return{blob:wavBlob(buf),ext:"wav",note:undefined}}
  onP(70,"Encoding MP3 at "+(opts.bitrate||192)+" kbps…");
  const mp3=mp3Blob(buf,opts.bitrate||192);
  if(mp3)return{blob:mp3,ext:"mp3",note:undefined};
  return{blob:wavBlob(buf),ext:"wav",note:"The MP3 encoder didn't load in this browser session, so this was saved as lossless WAV instead."};
}
async function audioProcess(file,t,opts,onP){
  onP(25,"Decoding audio…");
  const buf=await decodeAudioFile(file);
  const r=await encodeAudioBuffer(buf,file,t,opts,onP);
  onP(100,"Done");
  return[{name:baseName(file.name)+"-converted."+r.ext,blob:r.blob,inSize:file.size,note:r.note}];
}
function realtimeExtractAudio(file,onProg){
  return new Promise(async(resolve,reject)=>{
    try{
      if(!window.MediaRecorder)throw new Error("MediaRecorder is not available in this browser");
      const url=URL.createObjectURL(file);const video=document.createElement("video");
      video.src=url;video.playsInline=true;
      await new Promise((res,rej)=>{video.onloadedmetadata=res;video.onerror=()=>rej(new Error("decode: could not read this video"))});
      const ctx=actx();const srcNode=ctx.createMediaElementSource(video);const dest=ctx.createMediaStreamDestination();srcNode.connect(dest);
      const mime=MediaRecorder.isTypeSupported("audio/webm;codecs=opus")?"audio/webm;codecs=opus":MediaRecorder.isTypeSupported("audio/webm")?"audio/webm":null;
      if(!mime)throw new Error("MediaRecorder audio capture is not supported in this browser");
      const rec=new MediaRecorder(dest.stream,{mimeType:mime});const chunks=[];
      rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
      const stopped=new Promise(r=>rec.onstop=r);
      video.ontimeupdate=()=>{if(video.duration)onProg(video.currentTime/video.duration*100)};
      const ended=new Promise(r=>video.addEventListener("ended",r,{once:true}));
      rec.start(250);await video.play();await ended;
      if(rec.state!=="inactive")rec.stop();await stopped;
      URL.revokeObjectURL(url);
      const blob=new Blob(chunks,{type:mime});
      resolve(await decodeAudioBuf(await blob.arrayBuffer()));
    }catch(e){reject(e)}
  });
}
async function mp4mp3Process(file,t,opts,onP){
  let buf=null;
  try{onP(15,"Reading the audio track…");buf=await decodeAudioFile(file)}catch(e){buf=null}
  if(!buf){onP(20,"Extracting audio in real time while the video plays…");buf=await realtimeExtractAudio(file,p=>onP(20+p*0.5,"Extracting audio… "+Math.round(p)+"%"))}
  const r=await encodeAudioBuffer(buf,file,t,opts,onP);
  onP(100,"Done");
  return[{name:baseName(file.name)+"."+r.ext,blob:r.blob,inSize:file.size,note:r.note}];
}

/* ============================== video engine (real-time re-encode) ============================== */
async function videoProcess(file,t,opts,onP){
  if(!window.MediaRecorder)throw new Error("MediaRecorder is not available in this browser");
  const url=URL.createObjectURL(file);const video=document.createElement("video");
  video.src=url;video.playsInline=true;
  await new Promise((res,rej)=>{video.onloadedmetadata=res;video.onerror=()=>rej(new Error("decode: could not read this video"))});
  if(!isFinite(video.duration)||!video.duration)throw new Error("Could not read this video's duration");
  const targetH=opts.height||0;
  const scale=targetH&&video.videoHeight>targetH?targetH/video.videoHeight:1;
  const W=Math.max(2,Math.round(video.videoWidth*scale/2)*2),H=Math.max(2,Math.round(video.videoHeight*scale/2)*2);
  const canvas=canvasOf(W,H);const cx=canvas.getContext("2d");
  let audioTracks=[];
  try{const ac=actx();const srcNode=ac.createMediaElementSource(video);const dest=ac.createMediaStreamDestination();srcNode.connect(dest);audioTracks=dest.stream.getAudioTracks()}catch(e){}
  const vstream=canvas.captureStream(30);
  const stream=new MediaStream([...vstream.getVideoTracks(),...audioTracks]);
  const mime=["video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"].find(m=>MediaRecorder.isTypeSupported(m));
  if(!mime)throw new Error("MediaRecorder WebM recording is not supported in this browser");
  const rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:Math.round((opts.mbps||3)*1000000),audioBitsPerSecond:128000});
  const chunks=[];rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  const stopped=new Promise(r=>rec.onstop=r);
  const ended=new Promise(r=>video.addEventListener("ended",r,{once:true}));
  const timer=setInterval(()=>{if(video.duration)onP(Math.round(video.currentTime/video.duration*100),"Converting in real time… "+fmtTime(video.currentTime)+" / "+fmtTime(video.duration))},300);
  let rafId;
  const draw=()=>{if(!video.ended){cx.drawImage(video,0,0,W,H);rafId=requestAnimationFrame(draw)}};
  rec.start(200);await video.play();draw();
  await ended;cancelAnimationFrame(rafId);
  if(rec.state!=="inactive")rec.stop();await stopped;clearInterval(timer);
  URL.revokeObjectURL(url);
  onP(100,"Done");
  return[{name:baseName(file.name)+"-converted.webm",blob:new Blob(chunks,{type:"video/webm"}),inSize:file.size}];
}

/* ============================== ZIP (store, no compression) ============================== */
const CRC_TABLE=(()=>{const tb=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;tb[n]=c>>>0}return tb})();
function crc32(u8){let c=0xFFFFFFFF;for(let i=0;i<u8.length;i++)c=CRC_TABLE[(c^u8[i])&0xFF]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function zipStore(items){
  const enc=new TextEncoder();const chunks=[];const central=[];let offset=0;
  const u16=n=>new Uint8Array([n&255,(n>>8)&255]);const u32=n=>new Uint8Array([n&255,(n>>8)&255,(n>>16)&255,(n>>24)&255]);
  const push=u=>{chunks.push(u);offset+=u.length};
  for(const it of items){
    const name=enc.encode(it.name);const crc=crc32(it.data);const localStart=offset;
    push(u32(0x04034b50));push(u16(20));push(u16(0x0800));push(u16(0));push(u16(0));push(u16(0x21));
    push(u32(crc));push(u32(it.data.length));push(u32(it.data.length));push(u16(name.length));push(u16(0));push(name);push(it.data);
    const cen=[];const cp=u=>cen.push(u);
    cp(u32(0x02014b50));cp(u16(20));cp(u16(20));cp(u16(0x0800));cp(u16(0));cp(u16(0));cp(u16(0x21));
    cp(u32(crc));cp(u32(it.data.length));cp(u32(it.data.length));cp(u16(name.length));cp(u16(0));cp(u16(0));cp(u16(0));cp(u16(0));cp(u32(0));cp(u32(localStart));cp(name);
    central.push(cen);
  }
  const cenStart=offset;let cenSize=0;
  for(const cen of central)for(const u of cen){chunks.push(u);cenSize+=u.length}
  push(u32(0x06054b50));push(u16(0));push(u16(0));push(u16(items.length));push(u16(items.length));push(u32(cenSize));push(u32(cenStart));push(u16(0));
  return new Blob(chunks,{type:"application/zip"});
}

/* ============================== dispatch ============================== */
async function processOne(t,file,opts,onP){
  switch(t.engine){
    case "image":return imageProcess(file,t,opts,onP);
    case "pdfjpg":return pdfjpgProcess(file,t,opts,onP);
    case "pdfword":return pdfwordProcess(file,t,opts,onP);
    case "pdftext":return pdftextProcess(file,t,opts,onP);
    case "pdfcompress":return pdfcompressProcess(file,t,opts,onP);
    case "pdfrotate":return pdfrotateProcess(file,t,opts,onP);
    case "audio":return audioProcess(file,t,opts,onP);
    case "mp4mp3":return mp4mp3Process(file,t,opts,onP);
    case "video":return videoProcess(file,t,opts,onP);
    default:throw new Error("Unknown tool engine");
  }
}
async function processMulti(t,files,opts,onP){
  if(t.engine==="imgpdf")return imgpdfProcess(files,t,opts,onP);
  if(t.engine==="pdfmerge")return pdfmergeProcess(files,opts,onP);
  throw new Error("Unknown tool engine");
}
