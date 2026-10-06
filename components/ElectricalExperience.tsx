"use client";

import { useEffect, useRef, useState } from "react";
import { LightningBoltIcon, ReloadIcon } from "@radix-ui/react-icons";

type Point = { x: number; y: number; z: number };
const ease = (x: number) => { const t=Math.max(0,Math.min(1,x)); return t*t*(3-2*t); };

// Real projected coordinates give the traces depth; no raster portrait is redrawn here.
export default function ElectricalExperience({ motion, run, onReveal, onComplete }: {
  motion: boolean; run: number; onReveal: () => void; onComplete: () => void;
}) {
  const canvas=useRef<HTMLCanvasElement>(null);
  const settings=useRef({motion,onReveal,onComplete});
  const finish=useRef<() => void>(()=>{});
  const wake=useRef<() => void>(()=>{});
  const [phase,setPhase]=useState(0), [playing,setPlaying]=useState(true);
  useEffect(()=>{settings.current={motion,onReveal,onComplete};wake.current();},[motion,onReveal,onComplete]);

  useEffect(()=>{
    const surface=canvas.current, ctx=surface?.getContext("2d");
    if(!surface||!ctx){settings.current.onReveal();settings.current.onComplete();return;}
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed=false, raf=0, width=0, height=0, start=0, last=0, elapsed=0, lastDraw=0, phaseIndex=-1;
    let playingIntro=true, revealed=false, pointer={x:0,y:0}, smooth={x:0,y:0}, pulse=-100;
    setPlaying(true);setPhase(0);surface.dataset.phase="circuits";surface.dataset.completedAt="";
    const complete=()=>{
      if(!playingIntro)return;
      playingIntro=false;setPlaying(false);surface.dataset.phase="ambient";
      surface.dataset.completedAt=(elapsed/1000).toFixed(2);
      if(!revealed){revealed=true;settings.current.onReveal();}
      settings.current.onComplete();
    };
    finish.current=complete;
    const traces:Point[][]=Array.from({length:28},(_,i)=>{
      const side=i%2?1:-1, lane=Math.floor(i/2);
      return [
        {x:side*(2.6+lane*.13),y:(lane%7-3)*.35,z:2.5+lane*.17},
        {x:side*(1.65+lane*.08),y:(lane%7-3)*.35,z:.9+lane*.11},
        {x:side*(1.65+lane*.08),y:(lane%7-3)*.23,z:.2+lane*.08},
        {x:side*(.8+lane*.045),y:(lane%7-3)*.23,z:-.6+lane*.04},
        {x:side*.42,y:(lane%7-3)*.13,z:-.85},
      ];
    });
    const cubes=Array.from({length:9},(_,i)=>({x:Math.sin(i*2.4)*2.1,y:Math.cos(i*1.7)*1.3,z:(i%4)*.75-.5,size:.10+(i%3)*.05}));
    const resize=()=>{
      width=window.innerWidth;height=window.innerHeight;
      const dpr=Math.min(window.devicePixelRatio||1,1.5);
      surface.width=Math.round(width*dpr);surface.height=Math.round(height*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    const move=(e:PointerEvent)=>{pointer={x:e.clientX/width-.5,y:e.clientY/height-.5};};
    const down=(e:PointerEvent)=>{if(!(e.target as Element).closest("button,a,input"))pulse=performance.now();};
    const frame=(now:number)=>{
      if(disposed)return;
      raf=0;
      if(document.hidden){last=now;return;}
      if(!start)start=now;
      if(last)elapsed+=Math.min(now-last,80);
      last=now;
      if(reduced.matches){complete();ctx.clearRect(0,0,width,height);surface.dataset.phase="reduced";return;}
      const seconds=elapsed/1000, intro=playingIntro;
      if(intro&&seconds>=5)complete();
      if(intro&&seconds>=3.6&&!revealed){revealed=true;settings.current.onReveal();}
      const next=Math.min(3,Math.floor(seconds/1.3));
      if(intro&&phaseIndex!==next){phaseIndex=next;setPhase(next);}
      surface.dataset.elapsed=seconds.toFixed(2);
      const enabled=settings.current.motion;
      if(!intro&&(!enabled||window.scrollY>=height)){ctx.clearRect(0,0,width,height);return;}
      // Limit ambient work to 30 fps; the intro is allowed a full display refresh.
      if(!intro&&now-lastDraw<32){raf=requestAnimationFrame(frame);return;}
      lastDraw=now;
      smooth.x+=(pointer.x-smooth.x)*.065;smooth.y+=(pointer.y-smooth.y)*.065;
      ctx.clearRect(0,0,width,height);
      if(intro){
        const fade=ease((seconds-3.35)/1.65);
        ctx.fillStyle=`rgba(7,7,7,${1-fade})`;ctx.fillRect(0,0,width,height);
        // An expanding light field reveals the existing sketch from its face outward.
        if(seconds>1.65){
          const reveal=ease((seconds-1.65)/2.7);
          const cx=width<701?width*.5:width*.70,cy=height*.43;
          ctx.save();ctx.globalCompositeOperation="destination-out";
          const radius=Math.max(width,height)*(.03+reveal*.85);
          const light=ctx.createRadialGradient(cx,cy,0,cx,cy,radius);
          light.addColorStop(0,`rgba(0,0,0,${reveal})`);light.addColorStop(.6,`rgba(0,0,0,${reveal*.84})`);light.addColorStop(1,"rgba(0,0,0,0)");
          ctx.fillStyle=light;ctx.fillRect(0,0,width,height);ctx.restore();
        }
      }
      const time=now/1000, rotation=(intro?Math.sin(seconds*.7)*.13:Math.sin(time*.17)*.025)+smooth.x*.16;
      const tilt=smooth.y*.10;
      const projection=(p:Point)=>{
        const x=p.x*Math.cos(rotation)-p.z*Math.sin(rotation),z=p.x*Math.sin(rotation)+p.z*Math.cos(rotation);
        const y=p.y*Math.cos(tilt)-z*Math.sin(tilt),depth=z*Math.cos(tilt)+p.y*Math.sin(tilt)+4.1;
        const scale=Math.min(width,height)*.79/depth;
        const orbit=intro?(1-ease(seconds/5))*.15:0;
        return {x:width*(width<701?.5:.70)+x*scale,y:height*.47+y*scale,scale:scale*(1+orbit)};
      };
      const opacity=intro?1-ease((seconds-3.8)/1.2):.18;
      ctx.save();ctx.globalAlpha=opacity;
      if(!intro){
        // Keep persistent light trails around the sketch rather than across its face.
        ctx.beginPath();ctx.rect(0,0,width,height);
        ctx.ellipse(width*(width<701?.5:.70),height*.44,width*(width<701?.30:.15),height*.34,0,0,Math.PI*2);
        ctx.clip("evenodd");
      }
      ctx.lineCap="round";ctx.lineJoin="round";
      traces.forEach((trace,index)=>{
        const points=trace.map(projection);
        ctx.lineWidth=intro?1:.65;ctx.strokeStyle=intro?"#4b4b4b":"#666";
        ctx.beginPath();points.forEach((p,j)=>j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
        const travel=(time*(intro?.7:.13)+index*.137)%1;
        const span=travel*(points.length-1), segment=Math.min(points.length-2,Math.floor(span)), local=span-segment;
        const a=points[segment],b=points[segment+1], x=a.x+(b.x-a.x)*local,y=a.y+(b.y-a.y)*local;
        ctx.shadowColor="#fff";ctx.shadowBlur=intro?14:6;ctx.strokeStyle="#fff";ctx.lineWidth=intro?2:1;
        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(a.x-b.x)*.12,y+(a.y-b.y)*.12);ctx.stroke();
        ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x,y,intro?1.7:1,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
        const end=points[points.length-1];ctx.strokeStyle="#888";ctx.beginPath();ctx.arc(end.x,end.y,2,0,Math.PI*2);ctx.stroke();
      });
      cubes.forEach((cube,i)=>{
        const float=Math.sin(time*.7+i)*.07;
        const vertices=Array.from({length:8},(_,j)=>projection({x:cube.x+((j&1)?1:-1)*cube.size,y:cube.y+((j&2)?1:-1)*cube.size+float,z:cube.z+((j&4)?1:-1)*cube.size}));
        ctx.strokeStyle="#bcbcbc";ctx.lineWidth=intro?1:.6;
        for(let j=0;j<8;j++)for(const bit of [1,2,4])if(!(j&bit)){const a=vertices[j],b=vertices[j|bit];ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
      });
      const age=(now-pulse)/1000;
      if(age<1.4){ctx.strokeStyle="#fff";ctx.lineWidth=1;ctx.globalAlpha=opacity*(1-age/1.4);ctx.beginPath();ctx.ellipse(width*(pointer.x+.5),height*(pointer.y+.5),age*width*.35,age*height*.35,0,0,Math.PI*2);ctx.stroke();}
      ctx.restore();
      if(playingIntro)surface.dataset.phase="energizing";
      if(playingIntro||enabled)raf=requestAnimationFrame(frame);
    };
    const resume=()=>{last=0;if(!document.hidden&&!raf)raf=requestAnimationFrame(frame);};
    wake.current=resume;
    const preference=()=>{if(reduced.matches){complete();ctx.clearRect(0,0,width,height);}else resume();};
    resize();raf=requestAnimationFrame(frame);
    window.addEventListener("resize",resize);window.addEventListener("pointermove",move);window.addEventListener("pointerdown",down);window.addEventListener("scroll",resume,{passive:true});
    document.addEventListener("visibilitychange",resume);reduced.addEventListener("change",preference);
    return()=>{disposed=true;cancelAnimationFrame(raf);wake.current=()=>{};window.removeEventListener("resize",resize);window.removeEventListener("pointermove",move);window.removeEventListener("pointerdown",down);window.removeEventListener("scroll",resume);document.removeEventListener("visibilitychange",resume);reduced.removeEventListener("change",preference);};
  },[run]);

  return <>
    <canvas className="electrical-field" ref={canvas} aria-hidden="true" data-intro={playing} data-phase="circuits" />
    {playing&&<div className="intro-interface" aria-label="Animated introduction">
      <span className="intro-signature">BILAL KAZMI <LightningBoltIcon /></span>
      <button className="skip-intro" onClick={()=>finish.current()}>Skip intro <ReloadIcon /></button>
      <div className="intro-caption"><span className="intro-counter">0{phase+1} / 04</span><p>{["Connecting ideas.","Bringing them to life.","Building with purpose.","Ready for your next project."][phase]}</p><span>FULL STACK ENGINEERING · AI APPLICATIONS</span><div className="intro-progress" /></div>
      <span className="intro-instruction">MOVE TO EXPLORE · CLICK TO ENERGIZE</span>
    </div>}
  </>;
}
