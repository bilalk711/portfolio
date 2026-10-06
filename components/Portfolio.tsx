"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowRightIcon, ArrowTopRightIcon, ChevronDownIcon, Cross1Icon, CopyIcon, CheckIcon } from "@radix-ui/react-icons";
import LivingScene from "./LivingScene";
import CircuitCursor from "./CircuitCursor";
import { profile } from "@/content/profile";

type Panel = "about" | "work" | "expertise" | null;
function magnetic(event: PointerEvent<HTMLElement>) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const box = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--tx", `${((event.clientX-box.left)/box.width-.5)*9}px`);
  event.currentTarget.style.setProperty("--ty", `${((event.clientY-box.top)/box.height-.5)*7}px`);
}
function resetMagnet(event: PointerEvent<HTMLElement>) { event.currentTarget.style.setProperty("--tx","0px"); event.currentTarget.style.setProperty("--ty","0px"); }
function tilt(event: PointerEvent<HTMLElement>) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const box=event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--rx", `${-((event.clientY-box.top)/box.height-.5)*6}deg`);
  event.currentTarget.style.setProperty("--ry", `${((event.clientX-box.left)/box.width-.5)*6}deg`);
}

export default function Portfolio() {
  const [introActive,setIntroActive]=useState(true), [revealed,setRevealed]=useState(false);
  const [panel,setPanel]=useState<Panel>(null);
  const [copied,setCopied]=useState(false);
  const [selected,setSelected]=useState(0), [filter,setFilter]=useState("All");
  const dialog=useRef<HTMLDialogElement>(null), opener=useRef<HTMLElement|null>(null), copyTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>{
    if(panel){dialog.current?.showModal();dialog.current?.querySelector<HTMLButtonElement>(".close-panel")?.focus();document.body.style.overflow="hidden";}
    else{dialog.current?.close();document.body.style.overflow="";opener.current?.focus();}
    return()=>{document.body.style.overflow="";};
  },[panel]);
  useEffect(()=>()=>{if(copyTimer.current)clearTimeout(copyTimer.current);},[]);
  useEffect(()=>{
    if(!introActive)return;
    const previous=document.body.style.overflow;document.body.style.overflow="hidden";
    return()=>{document.body.style.overflow=previous;};
  },[introActive]);
  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("in-view");observer.unobserve(entry.target);}}),{threshold:.12});
    document.querySelectorAll(".reveal-on-scroll").forEach(element=>observer.observe(element));return()=>observer.disconnect();
  },[]);
  function open(next:Exclude<Panel,null>){opener.current=document.activeElement as HTMLElement;setPanel(next);}
  async function copyEmail(){try{await navigator.clipboard.writeText(profile.email);setCopied(true);if(copyTimer.current)clearTimeout(copyTimer.current);copyTimer.current=setTimeout(()=>setCopied(false),2500);}catch{window.location.href=`mailto:${profile.email}`;}}
  const projects=profile.projects.filter(project=>filter==="All"||project.tags.includes(filter));

  return <main className="portfolio" data-intro={introActive} data-revealed={revealed}>
    <noscript><style>{`.portfolio .site-header,.portfolio .hero-copy,.portfolio .hero-footer,.reveal-on-scroll{opacity:1!important}.electrical-field,.intro-interface{display:none!important}`}</style></noscript>
    <LivingScene motion={!panel} onReveal={()=>setRevealed(true)} onComplete={()=>setIntroActive(false)} />
    <CircuitCursor host={panel?dialog.current:null} />
    <section className="stage" aria-label="Bilal Kazmi portfolio" data-testid="portfolio-stage" inert={introActive}>
      <header className="site-header"><a className="brand" href="/" aria-label="Bilal Kazmi portfolio home">BK<span className="brand-name">BILAL KAZMI<br /><small>INDEPENDENT ENGINEER</small></span></a><nav aria-label="Main navigation"><button onClick={()=>open("about")}>About</button><a href="#selected-work">Work</a><button className="expertise-nav" onClick={()=>open("expertise")}>Expertise</button><a className="nav-contact" href={`mailto:${profile.email}`}>Let’s talk <ArrowTopRightIcon /></a></nav></header>
      <div className="hero-copy">
        <p className="eyebrow"><span className="live-dot" /> SENIOR FULL STACK ENGINEER <span>/</span> APPLIED AI</p>
        <h1>{profile.headline[0]}<br />{profile.headline[1]}</h1>
        <p className="hero-summary">{profile.summary}</p>
        <div className="hero-actions"><a className="primary-action magnetic" href="#selected-work" onPointerMove={magnetic} onPointerLeave={resetMagnet}>Explore my work <ArrowRightIcon /></a><a className="contact-action magnetic" href={`mailto:${profile.email}`} onPointerMove={magnetic} onPointerLeave={resetMagnet}>Get in touch <ArrowTopRightIcon /></a></div>
        <div className="focus-row">{profile.focus.map((focus,index)=><button key={focus} onClick={()=>{setSelected(index);open("expertise");}}>{focus}</button>)}</div>
      </div>
      <div className="portrait-caption" aria-hidden="true"><span>01 / HUMAN AT THE CORE</span><span>ALWAYS IN THE MAKING.</span></div>
      <footer className="hero-footer"><span>ISLAMABAD, PK <span className="footer-divider">/</span> WORKING WORLDWIDE</span><a className="selected-work" href="#assembly"><ChevronDownIcon /></a><span className="scene-hint">MOVE TO EXPLORE · CLICK TO ENERGIZE</span></footer>
    </section>
    <section className="assembly-journey" id="assembly" aria-labelledby="assembly-title" inert={introActive}>
      <div className="assembly-sticky"><div className="assembly-copy"><p className="eyebrow">02 / CONNECTING THE PIECES</p><h2 id="assembly-title">Complexity,<br /><em>composed.</em></h2><p>A great product is more than its parts. I connect thoughtful interfaces, dependable systems and useful AI into one coherent experience.</p><div className="assembly-steps"><span><i>01</i> Shape the idea</span><span><i>02</i> Build the system</span><span><i>03</i> Ship with confidence</span></div><a href="#selected-work" className="assembly-link">See what the pieces become <ArrowRightIcon /></a></div><div className="cube-caption" aria-hidden="true"><span>SCROLL TO ASSEMBLE</span><span>27 PARTS. ONE SYSTEM.</span></div></div>
    </section>
    <section className="selected-projects" id="selected-work" aria-labelledby="work-heading" inert={introActive}>
      <div className="proof-strip reveal-on-scroll"><div><strong>5+</strong><span>YEARS BUILDING</span></div><div><strong>+50</strong><span>APPLICATIONS/SYSTEMS</span></div><div><strong>100%</strong><span>CLIENT SATISFACTION</span></div></div>
      <div className="work-heading reveal-on-scroll"><p className="eyebrow">SELECTED WORK / 01—04</p><h2 id="work-heading">Built to solve.<br />Made to ship.</h2><p>From customer-facing platforms to AI workflows, here’s how I turn technical challenges into working software.</p></div>
      <div className="case-grid">{profile.projects.map((project,index)=><article className="case-card reveal-on-scroll" key={project.name} onPointerMove={tilt} onPointerLeave={event=>{event.currentTarget.style.setProperty("--rx","0deg");event.currentTarget.style.setProperty("--ry","0deg");}}>
        <div className="case-top"><span>0{index+1}</span><span>{project.category}</span><ArrowTopRightIcon /></div>
        <h3>{project.name}</h3><p className="case-role">{project.role}</p><p className="case-description">{project.description}</p><div className="case-outcome">{project.outcome}</div><p className="case-detail">{project.detail}</p><div className="case-stack">{project.stack.map(tech=><span key={tech}>{tech}</span>)}</div>
        {project.url?<a className="case-link" href={project.url} target="_blank" rel="noopener noreferrer">Explore live project <ArrowTopRightIcon /></a>:<span className="internal-project">Internal project · JALTech</span>}
      </article>)}</div>
      <div className="client-contact reveal-on-scroll"><div><p className="eyebrow">LET’S BUILD SOMETHING USEFUL</p><h2>Your next idea<br />starts here.</h2><p>Tell me what you’re building, the challenge you’re facing and where you’d like to take it.</p></div><a className="primary-action magnetic" href={`mailto:${profile.email}?subject=${encodeURIComponent("Let’s discuss my project")}`} onPointerMove={magnetic} onPointerLeave={resetMagnet}>Get in touch <ArrowTopRightIcon /></a></div>
      <footer className="page-footer"><span>© {new Date().getFullYear()} Bilal Kazmi</span><a href={`mailto:${profile.email}`}>{profile.email}</a><a href="#" aria-label="Back to top">Back to top ↑</a></footer>
    </section>
    <dialog ref={dialog} className="portfolio-dialog" aria-labelledby="panel-title" onCancel={()=>setPanel(null)} onClose={()=>setPanel(null)} onClick={event=>{if(event.target===event.currentTarget)setPanel(null);}}>
      <div className="panel-content"><button className="close-panel" aria-label="Close panel" autoFocus onClick={()=>setPanel(null)}><Cross1Icon /></button>
        {panel==="about"&&<><p className="eyebrow">{profile.role.toUpperCase()}</p><h2 id="panel-title">Hi, I’m Bilal.<br />I build software.</h2><p className="panel-intro">{profile.about}</p><p className="panel-body">{profile.aboutDetail}</p><div className="stack-tags">{profile.stack.map(tech=><span key={tech}>{tech}</span>)}</div><a className="panel-cta" href={`mailto:${profile.email}`}>Let’s discuss your project <ArrowRightIcon /></a><button className="text-button" onClick={()=>setPanel("expertise")}>Explore my expertise <ArrowRightIcon /></button></>}
        {panel==="expertise"&&<><p className="eyebrow">HOW I CAN HELP</p><h2 id="panel-title">Your idea.<br />A working product.</h2><div className="interest-tabs" role="tablist" aria-label="Areas of expertise">{profile.services.map((service,index)=><button key={service.tag} id={`service-${index}`} role="tab" aria-selected={selected===index} aria-controls="service-content" tabIndex={selected===index?0:-1} onClick={()=>setSelected(index)} onKeyDown={event=>{if(event.key==="ArrowRight"||event.key==="ArrowLeft"){event.preventDefault();const next=(selected+(event.key==="ArrowRight"?1:2))%3;setSelected(next);document.getElementById(`service-${next}`)?.focus();}}}>{service.tag}</button>)}</div><div id="service-content" role="tabpanel" aria-labelledby={`service-${selected}`} className="interest-content"><h3>{profile.services[selected].name}</h3><p>{profile.services[selected].detail}</p></div><a className="panel-cta" href={`mailto:${profile.email}?subject=${encodeURIComponent("Project enquiry: "+profile.services[selected].tag)}`}>Tell me about your idea <ArrowRightIcon /></a></>}
        {panel==="work"&&<><p className="eyebrow">SELECTED WORK</p><h2 id="panel-title">Ideas turned<br />into products.</h2><p className="panel-intro">Four projects across web applications and AI.</p><div className="project-filters" aria-label="Filter projects">{["All","AI","Web apps"].map(value=><button key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{value}</button>)}</div><div className="project-list">{projects.map(project=><article className="project-card" key={project.name} onPointerMove={tilt} onPointerLeave={event=>{event.currentTarget.style.setProperty("--rx","0deg");event.currentTarget.style.setProperty("--ry","0deg");}}><span className="project-category">{project.category}</span><h3>{project.name}</h3><p>{project.description}</p>{project.url?<a className="project-link" href={project.url} target="_blank" rel="noopener noreferrer">Explore live project <ArrowTopRightIcon /></a>:<span className="project-link">Internal project · JALTech</span>}</article>)}</div><div className="email-row"><a href={`mailto:${profile.email}`}>{profile.email}</a><button aria-label={copied?"Email copied":"Copy email address"} onClick={copyEmail}>{copied?<CheckIcon />:<CopyIcon />}</button><span className="semantic-copy" role="status">{copied?"Email address copied":""}</span></div></>}
      </div>
    </dialog>
  </main>;
}
