"use client";

import { useEffect, useRef, useState } from "react";

type Props = { motion: boolean; onReveal: () => void; onComplete: () => void };
type V3 = [number, number, number];

// Circuit-only introduction followed by a softly composited photographic relief.
const vertex = `
precision highp float;
attribute vec3 a_position, a_origin, a_normal;
attribute vec2 a_uv;
attribute float a_kind, a_seed;
uniform float u_time,u_reveal,u_scroll,u_aspect,u_mobile,u_zoom,u_dpr,u_energy,u_points;
uniform vec2 u_pointer;
varying vec2 v_uv;
varying vec3 v_normal,v_position;
varying float v_kind,v_seed,v_fade;
mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
void main(){
  vec3 p=a_position; float fade=1.;
  float disassemble=smoothstep(.08,.85,u_scroll);
  float turn=u_pointer.x*.17+sin(u_time*.24)*.035;
  mat3 rotation=ry(turn)*rx(u_pointer.y*.08);
  if(a_kind<.5){
    float growth=u_reveal;
    // Keep landmarks registered throughout the reveal; never stretch the face.
    p=a_position;
    vec2 tile=floor(a_uv*vec2(7.,9.))-vec2(3.,4.);
    p+=vec3(tile*.20,sin(tile.x*2.+tile.y)*.8)*disassemble;
    p=ry(disassemble*sin(a_seed*12.)*.8)*p;
    p.z+=sin(u_time*.7)*.009*growth;
    fade=(1.-smoothstep(.3,1.,u_scroll));
  }else if(a_kind<2.5 || a_kind>4.5){
    float unfold=sin(clamp((u_scroll-.9)*1.1,0.,3.14));
    float slice=sin(u_scroll*2.3)*1.15*a_origin.y;
    p=ry(slice)*(p-a_origin)+a_origin*(1.+unfold*.9);
    p=ry(u_time*.12+u_scroll*1.8)*rx(.38+u_scroll*.46)*p;
    p.y+=sin(u_time*.6)*.10;
    fade=smoothstep(.27,.85,u_scroll);
    p*=1.12;
  }else if(a_kind<3.5){
    p=ry(sin(u_time*.15)*.06+u_pointer.x*.035)*p;
    p.z+=sin(u_time*.45+a_seed*14.)*.14;
    fade=.7;
  }else{
    p.y+=sin(u_time*.22+a_seed*30.)*.20;
    p.x+=cos(u_time*.15+a_seed*40.)*.15;
    fade=.5;
  }
  p=rotation*p;
  float geometryScale=mix(1.,.64,u_mobile)*(1.+u_zoom*.32);
  if(a_kind<2.5 || a_kind>4.5) p*=geometryScale;
  if(a_kind>1.5 && (a_kind<2.5 || a_kind>4.5)) p*=mix(1.,.8,u_mobile);
  float cx=mix(u_aspect*1.13,0.,u_mobile);
  float cy=mix(.03,mix(1.25,-1.05,smoothstep(.25,.85,u_scroll)),u_mobile);
  p+=vec3(cx,cy,0.);
  float z=6.5-p.z;
  gl_Position=vec4(p.x*2.05/u_aspect,p.y*2.05,(z-1.)*.8,z);
  gl_PointSize=clamp((a_kind>3.5?2.2:1.6)*u_dpr*(6.5/z),1.,6.);
  v_uv=a_uv;v_normal=rotation*a_normal;v_position=p;v_kind=a_kind;v_seed=a_seed;v_fade=fade;
}`;
const fragment = `
precision highp float;
uniform sampler2D u_portrait;
uniform float u_time,u_reveal,u_points,u_energy,u_depth;
varying vec2 v_uv;
varying vec3 v_normal,v_position;
varying float v_kind,v_seed,v_fade;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
void main(){
  float alpha=v_fade; vec3 color=vec3(.65);
  if(v_kind<.5){
    float v=v_uv.y;
    vec2 portraitUV=vec2(.5+v_uv.x*.5,v);
    vec4 portrait=texture2D(u_portrait,portraitUV);
    // Preserve the face while dissolving cap edges, shoulders and clothing into the world.
    float side=1.-smoothstep(.18,.46,abs(v_uv.x-.5));
    float lower=1.-smoothstep(.56,.88,v);
    float crown=smoothstep(.035,.17,v);
    float atmosphere=side*lower*crown;
    float light=.83+.02*sin(u_time*.32)+u_energy*.035;
    color=portrait.rgb*light;
    float emergence=smoothstep(0.,1.,u_reveal);
    alpha*=portrait.a*atmosphere*emergence;
    if(alpha<.003)discard;
  }else if(v_kind<2.5){
    vec3 n=normalize(v_normal);
    float light=max(0.,dot(n,normalize(vec3(-.8,1.2,1.8))));
    float edge=pow(1.-abs(n.z),3.);
    float grid=step(.95,fract(v_uv.x*9.))+step(.95,fract(v_uv.y*9.));
    color=vec3(.045+light*.22+edge*.14+grid*.035);
    color+=vec3(pow(max(0.,dot(reflect(normalize(vec3(.4,-1.,-2.)),n),vec3(0.,0.,1.))),20.)*.65);
  }else if(v_kind<3.5){
    float spark=pow(max(0.,sin(v_uv.x*15.-u_time*2.1+v_seed*30.)),28.);
    color=vec3(.17+spark*.85+u_energy*.6);alpha*=(.65+spark*.3)/(1.+u_depth*.045);
  }else if(v_kind<4.5){
    float d=length(gl_PointCoord-.5);if(d>.5)discard;
    color=vec3(.9);alpha*=smoothstep(.5,.1,d)*(.4+.3*sin(u_time+v_seed*60.));
  }else{color=vec3(.55+u_energy*.35);alpha*=.8;}
  if(u_points>.5 && v_kind<.5){if(length(gl_PointCoord-.5)>.48)discard;}
  gl_FragColor=vec4(color,alpha);
}`;

function geometry(mobile: boolean) {
  const mesh: number[] = [], cubes: number[] = [], edges: number[] = [], circuits: number[] = [], dust: number[] = [];
  const add = (out: number[], p: V3, o: V3, uv: [number, number], n: V3, kind: number, seed = 0) => out.push(...p,...o,...uv,...n,kind,seed);
  const line = (out: number[], a: V3, b: V3, kind = 1, seed = 0, u = 0) => { add(out,a,[0,0,0],[u,0],[0,0,1],kind,seed);add(out,b,[0,0,0],[u+1,0],[0,0,1],kind,seed); };
  const nx=mobile?56:100, ny=mobile?72:128;
  const sample = (u: number,v: number): [V3,V3,[number,number],V3] => {
    const x=(u-.5)*3.4,y=(.5-v)*4.53;
    const face=Math.exp(-Math.pow(x/.85,4)-Math.pow((y-.35)/1.35,4));
    const nose=Math.exp(-Math.pow(x/.20,2)-Math.pow((y-.22)/.33,2))*.34;
    const z=face*.16+nose*.25;
    return [[x,y,z],[x,y,z],[u,v],[-x*.4,(y-.4)*.15,1]];
  };
  for(let y=0;y<ny;y++)for(let x=0;x<nx;x++)for(const [dx,dy] of [[0,0],[1,0],[0,1],[0,1],[1,0],[1,1]]){
    const u=(x+dx)/nx,v=(y+dy)/ny;const [p,o,uv,n]=sample(u,v);add(mesh,p,o,uv,n,0,(Math.floor(u*7)+Math.floor(v*9)*7)/63);
  }
  const faces = [ [[1,0,0],[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]], [[-1,0,0],[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,-1,-1]], [[0,1,0],[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1]], [[0,-1,0],[-1,-1,1],[-1,-1,-1],[1,-1,-1],[1,-1,1]], [[0,0,1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]], [[0,0,-1],[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]] ];
  for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){
    const center:V3=[x*.55,y*.55,z*.55];
    for(const face of faces){
      for(const j of [1,2,3,1,3,4]){const p=face[j].map((v,i)=>center[i]+v*.25) as V3; add(cubes,p,center,[j===1||j===4?0:1,j<3?0:1],face[0] as V3,2);}
      for(let j=1;j<=4;j++){for(const k of [j,j%4+1])add(edges,face[k].map((v,i)=>center[i]+v*.252) as V3,center,[0,0],face[0] as V3,5);}
    }
  }
  for(let i=0;i<38;i++){
    const side=i%2?1:-1,lane=Math.floor(i/2),y=(lane%10-4.5)*.36,z=-1.2+(lane%5)*.35;
    const path:V3[]=[[side*5,y,z],[side*(2.4+lane*.045),y,z],[side*1.9,y*.7,z+.4],[side*1.9,y*.7-.25,z+.4],[side*1.15,y*.5-.25,z+.7]];
    path.slice(1).forEach((p,j)=>line(circuits,path[j],p,3,i/38,j*.3));
  }
  for(let i=0;i<16;i++){
    const angle=i/16*Math.PI*2,seed=i*.71;
    let previous:V3=[Math.cos(angle)*2.4,Math.sin(angle)*2.5,-.3];
    for(let j=1;j<=14;j++){
      const r=2.4-j*.08,shake=Math.sin(j*2.7+seed)*.075;
      const next:V3=[Math.cos(angle)*r+shake,Math.sin(angle)*(r+.1)+shake,.12];
      line(circuits,previous,next,3,i/16,j*.035);previous=next;
    }
  }
  for(let i=0;i<(mobile?90:220);i++){const rand=(k:number)=>((Math.sin(i*127.1+k*311.7)*43758.5453)%1+1)%1;add(dust,[(rand(1)-.5)*13,(rand(2)-.5)*7,rand(3)*4-3],[0,0,0],[0,0],[0,0,1],4,i/220);}
  return {mesh,cubes,edges,circuits,dust};
}

export default function LivingScene(props: Props) {
  const canvas=useRef<HTMLCanvasElement>(null), settings=useRef(props), skip=useRef(()=>{}), wake=useRef(()=>{});
  const [playing,setPlaying]=useState(true),[phase,setPhase]=useState(0),[available,setAvailable]=useState(false);
  useEffect(()=>{settings.current=props;wake.current();},[props]);
  useEffect(()=>{
    const surface=canvas.current;if(!surface)return;
    let gl:WebGLRenderingContext|null=null;
    try{gl=surface.getContext("webgl",{alpha:true,antialias:true,powerPreference:"high-performance"});}catch{/* Use the visible image fallback. */}
    const complete=()=>{settings.current.onReveal();settings.current.onComplete();setPlaying(false);};
    if(!gl){complete();return;}
    const context=gl;
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
    const compiled:WebGLShader[]=[];const buffers:WebGLBuffer[]=[];
    const program=context.createProgram()!;
    for(const [type,source] of [[context.VERTEX_SHADER,vertex],[context.FRAGMENT_SHADER,fragment]] as const){
      const shader=context.createShader(type)!;context.shaderSource(shader,source);context.compileShader(shader);compiled.push(shader);
      if(!context.getShaderParameter(shader,context.COMPILE_STATUS)){console.error("Scene shader:",context.getShaderInfoLog(shader));compiled.forEach(s=>context.deleteShader(s));context.deleteProgram(program);complete();return;}
      context.attachShader(program,shader);
    }
    context.linkProgram(program);
    if(!context.getProgramParameter(program,context.LINK_STATUS)){compiled.forEach(s=>context.deleteShader(s));context.deleteProgram(program);complete();return;}
    context.useProgram(program);
    const attrs=[['a_position',3],['a_origin',3],['a_uv',2],['a_normal',3],['a_kind',1],['a_seed',1]] as const;
    const locations=attrs.map(([name])=>context.getAttribLocation(program,name));
    const uniform=Object.fromEntries(['time','reveal','scroll','aspect','mobile','zoom','dpr','pointer','points','energy','depth','portrait'].map(n=>[n,context.getUniformLocation(program,'u_'+n)]));
    const data=geometry(window.innerWidth<701);
    const batches=Object.fromEntries(Object.entries(data).map(([key,array])=>{const buffer=context.createBuffer()!;buffers.push(buffer);context.bindBuffer(context.ARRAY_BUFFER,buffer);context.bufferData(context.ARRAY_BUFFER,new Float32Array(array),context.STATIC_DRAW);return [key,{buffer,count:array.length/13}];}));
    const texture=context.createTexture();context.bindTexture(context.TEXTURE_2D,texture);
    context.texParameteri(context.TEXTURE_2D,context.TEXTURE_WRAP_S,context.CLAMP_TO_EDGE);context.texParameteri(context.TEXTURE_2D,context.TEXTURE_WRAP_T,context.CLAMP_TO_EDGE);context.texParameteri(context.TEXTURE_2D,context.TEXTURE_MIN_FILTER,context.LINEAR);context.texParameteri(context.TEXTURE_2D,context.TEXTURE_MAG_FILTER,context.LINEAR);
    context.texImage2D(context.TEXTURE_2D,0,context.RGBA,1,1,0,context.RGBA,context.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));
    context.uniform1i(uniform.portrait,0);
    let disposed=false,ready=false,raf=0,last=0,elapsed=0,ambient=0,appearance=0,done=false,lastPhase=-1,scroll=0,scrollTarget=0,energy=0;
    let pointer={x:0,y:0},aim={x:0,y:0},width=0,height=0,dpr=1,frameCount=0;
    const finish=()=>{if(done)return;done=true;elapsed=4.8;complete();};skip.current=finish;
    setPlaying(true);setAvailable(false);setPhase(0);
    const draw=(key:string,mode:number)=>{const batch=batches[key];context.bindBuffer(context.ARRAY_BUFFER,batch.buffer);let offset=0;attrs.forEach(([,size],i)=>{const location=locations[i];if(location>=0){context.enableVertexAttribArray(location);context.vertexAttribPointer(location,size,context.FLOAT,false,52,offset*4);}offset+=size;});context.drawArrays(mode,0,batch.count);};
    const frame=(now:number)=>{
      raf=0;if(disposed||document.hidden)return;
      const dt=last?Math.min((now-last)/1000,.06):0;last=now;
      const animate=settings.current.motion&&!reduced.matches;
      if(!done){if(ready)elapsed+=dt;if(elapsed>=4.8||reduced.matches||!settings.current.motion)finish();}
      if(done)appearance=animate?Math.min(1,appearance+dt/1.8):1;
      if(animate)ambient+=dt;
      if(animate){pointer.x+=(aim.x-pointer.x)*.045;pointer.y+=(aim.y-pointer.y)*.045;scroll+=(scrollTarget-scroll)*.06;energy*=.955;}else{pointer={x:0,y:0};scroll=scrollTarget;energy=0;}
      const reveal=done?appearance:0;
      if(!done){const next=Math.min(3,Math.floor(elapsed/1.2));if(next!==lastPhase){lastPhase=next;setPhase(next);}}
      context.clearColor(0,0,0,0);context.clear(context.COLOR_BUFFER_BIT|context.DEPTH_BUFFER_BIT);
      context.enable(context.BLEND);context.blendFuncSeparate(context.SRC_ALPHA,context.ONE_MINUS_SRC_ALPHA,context.ONE,context.ONE_MINUS_SRC_ALPHA);context.disable(context.DEPTH_TEST);
      context.uniform1f(uniform.time,ambient);context.uniform1f(uniform.reveal,reveal);context.uniform1f(uniform.scroll,reduced.matches?0:scroll);
      context.uniform1f(uniform.aspect,width/height);context.uniform1f(uniform.mobile,width<701?1:0);context.uniform1f(uniform.zoom,0);context.uniform1f(uniform.dpr,dpr);context.uniform1f(uniform.depth,1.5);
      context.uniform2f(uniform.pointer,pointer.x,pointer.y);context.uniform1f(uniform.energy,energy);context.uniform1f(uniform.points,0);
      draw('circuits',context.LINES);draw('dust',context.POINTS);
      if(scroll<1)draw('mesh',context.TRIANGLES);
      if(scroll>.2){context.enable(context.DEPTH_TEST);context.depthFunc(context.LEQUAL);draw('cubes',context.TRIANGLES);draw('edges',context.LINES);context.disable(context.DEPTH_TEST);}
      surface.dataset.phase=done?(appearance<1?'portrait-reveal':'live'):['signal','energy','connection','ready'][Math.min(3,Math.floor(elapsed/1.2))];
      surface.dataset.portraitOpacity=reveal.toFixed(2);
      surface.dataset.scroll=scroll.toFixed(2);surface.dataset.frames=String(++frameCount);surface.dataset.elapsed=elapsed.toFixed(2);
      if((animate||!done)&&window.scrollY<height*4.4)raf=requestAnimationFrame(frame);
    };
    const start=()=>{if(!disposed&&!raf&&!document.hidden){last=0;raf=requestAnimationFrame(frame);}};wake.current=start;
    const onScroll=()=>{scrollTarget=Math.min(3.7,window.scrollY/Math.max(1,height));start();};
    const resize=()=>{width=window.innerWidth;height=window.innerHeight;dpr=Math.min(window.devicePixelRatio||1,width<701?1.75:2,3840/width,2160/height);surface.width=Math.round(width*dpr);surface.height=Math.round(height*dpr);context.viewport(0,0,surface.width,surface.height);onScroll();};
    const move=(e:PointerEvent)=>{aim={x:e.clientX/width-.5,y:.5-e.clientY/height};start();};
    const pulse=(e:PointerEvent)=>{if(!(e.target as Element).closest('button,a,input,dialog')){energy=1;start();}};
    const visibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else start();};
    const preference=()=>{if(reduced.matches)finish();start();};
    const lost=(event:Event)=>{event.preventDefault();cancelAnimationFrame(raf);raf=0;setAvailable(false);finish();surface.dataset.ready='unavailable';};
    const image=new Image();image.onload=()=>{if(disposed)return;context.bindTexture(context.TEXTURE_2D,texture);context.texImage2D(context.TEXTURE_2D,0,context.RGBA,context.RGBA,context.UNSIGNED_BYTE,image);ready=true;setAvailable(true);surface.dataset.ready='true';start();};image.onerror=()=>{if(!disposed){setAvailable(false);finish();}};image.src='/assets/portrait-anatomy-v3.webp';
    // Never trap the introduction behind a failed or slow asset request.
    const timeout=window.setTimeout(()=>{if(!ready)finish();},8000);
    resize();start();window.addEventListener('resize',resize);window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('pointermove',move,{passive:true});window.addEventListener('pointerdown',pulse);document.addEventListener('visibilitychange',visibility);reduced.addEventListener('change',preference);surface.addEventListener('webglcontextlost',lost);
    return()=>{disposed=true;cancelAnimationFrame(raf);clearTimeout(timeout);wake.current=()=>{};window.removeEventListener('resize',resize);window.removeEventListener('scroll',onScroll);window.removeEventListener('pointermove',move);window.removeEventListener('pointerdown',pulse);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',preference);surface.removeEventListener('webglcontextlost',lost);buffers.forEach(b=>context.deleteBuffer(b));compiled.forEach(s=>context.deleteShader(s));context.deleteTexture(texture);context.deleteProgram(program);};
  },[]);
  return <>
    <div className="living-world" aria-hidden="true" data-available={available}>
      <div className="world-halo" /><div className="world-grid" />
      <div className="world-fallback" />
      <canvas ref={canvas} className="living-canvas" />
      <div className="world-grain" />
    </div>
    {playing&&<div className="formation-interface" aria-label="Animated portrait introduction">
      <div className="formation-brand">BK<span>FORM / FUNCTION</span></div>
      <button className="skip-formation" onClick={()=>skip.current()}>Skip introduction <span>↗</span></button>
      <div className="formation-copy"><span className="eyebrow">0{phase+1} / 04 — {['SIGNAL','ENERGY','CONNECTION','READY'][phase]}</span><p>{['An idea.\nA spark.','Connecting\nthe possibilities.','Built with purpose.\nMade to move.','Let’s build\nwhat comes next.'][phase]}</p><span className="formation-sub">BILAL KAZMI · FULL STACK & APPLIED AI</span><div className="formation-track"><i /></div></div>
      <span className="formation-foot">MOVE TO EXPLORE / TOUCH TO ENERGIZE</span>
    </div>}
  </>;
}
