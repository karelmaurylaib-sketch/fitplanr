// node keyframes.cjs name -> copies frames at marks (+offsets) into chk/<name>/
const fs=require('fs'); const n=process.argv[2]; const m=require(`./${n}-meta.json`);
const at=Object.fromEntries(m.marks); const d=`chk/${n}`; fs.rmSync(d,{recursive:true,force:true}); fs.mkdirSync(d,{recursive:true});
const pick=ms=>{let i=m.frames.findIndex(t=>t>=ms);return i<0?m.frames.length-1:i};
const list=[at.landing+2500,at.questions+1000,(at.protect||at.gear)+700,at.building-600,at.building+4000,at.plan+700,at.plan+2500,at.closed+600,at.end-300];
list.forEach((ms,k)=>fs.copyFileSync(`${n}-frames/${String(pick(ms)).padStart(5,'0')}.jpg`,`${d}/${k}.jpg`));
