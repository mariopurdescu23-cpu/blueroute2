"use client";

import {useEffect} from "react";

export function useSiteMotion() {
 useEffect(() => {
  const root = document.getElementById("continut");
  if (!root || !window.IntersectionObserver || !Element.prototype.animate) return;
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const revealed = new WeakSet<Element>();
  let teardown = () => {};

  const configure = () => {
   teardown();
   if (preference.matches) return;

   root.classList.add("motion-enabled");
   const animations = new Set<Animation>();
   const pending = new Set<HTMLElement>();
   let disposed = false;

   const reveal = (element: HTMLElement) => {
    const group = element.parentElement;
    const stagger = group?.matches(".service-grid,.domain-grid,.process-grid,.article-grid")
     ? Array.from(group.children).indexOf(element) % (window.innerWidth < 600 ? 2 : 3) * 110
     : 0;
    const animation = element.animate([
     {opacity:0, transform:"translate3d(0, 48px, 0) scale(.975)"},
     {opacity:1, transform:"translate3d(0, 0, 0) scale(1)"},
    ], {duration:950, delay:stagger, easing:"cubic-bezier(.16,1,.3,1)", fill:"both"});
    animations.add(animation);
    animation.onfinish = () => {
     delete element.dataset.motionPending;
     pending.delete(element);
     animations.delete(animation);
     animation.cancel();
    };
   };

   const observer = new IntersectionObserver(entries => {
    if (disposed) return;
    for (const entry of entries) {
     const element = entry.target as HTMLElement;
     if (!entry.isIntersecting || revealed.has(element) || !pending.has(element)) continue;
     revealed.add(element);
     observer.unobserve(element);
     reveal(element);
    }
   }, {threshold:.08, rootMargin:"0px 0px -5% 0px"});

   const register = () => {
    if (disposed) return;
    root.querySelectorAll<HTMLElement>(".reveal,.about-copy > *,.project-row,.faq-item,.detail-hero > *,.detail-body > *").forEach(element => {
     if (revealed.has(element) || pending.has(element)) return;
     // Content already visible at hydration or a restored scroll position should stay visible.
     if (element.getBoundingClientRect().top < window.innerHeight) {
      revealed.add(element);
      return;
     }
     element.dataset.motionPending = "true";
     pending.add(element);
     observer.observe(element);
    });
   };
   register();
   const mutation = new MutationObserver(register);
   mutation.observe(root, {childList:true, subtree:true});

   const hero = root.querySelector<HTMLElement>(".hero");
   const heroPhoto = root.querySelector<HTMLElement>(".hero-photo");
   const aboutImage = root.querySelector<HTMLElement>(".about-image");
   const process = root.querySelector<HTMLElement>(".process-grid");
   const header = document.querySelector<HTMLElement>(".site-header");
   const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
   let heroVisible = true;
   let frame = 0;
   let lastScroll = Math.max(0, window.scrollY);
   let x = 0, y = 0, targetX = 0, targetY = 0;

   const render = () => {
    frame = 0;
    const height = window.innerHeight;
    const scroll = Math.max(0, window.scrollY);
    if (scroll !== lastScroll) {
     header?.toggleAttribute("data-nav-hidden", scroll > 200 && scroll > lastScroll);
     lastScroll = scroll;
    }
    x += (targetX - x) * .09;
    y += (targetY - y) * .09;
    if (finePointer.matches && heroPhoto && hero && heroVisible) {
     const position = hero.getBoundingClientRect();
     const shift = Math.min(Math.max(-position.top * .14, 0), 65);
     heroPhoto.style.setProperty("--photo-x", `${x}px`);
     heroPhoto.style.setProperty("--photo-y", `${shift + y}px`);
    }
    if (finePointer.matches && aboutImage) {
     const position = aboutImage.getBoundingClientRect();
     if (position.top < height && position.bottom > 0) {
      const shift = Math.max(-28, Math.min(28, (height / 2 - position.top - position.height / 2) * .08));
      aboutImage.style.setProperty("--image-shift", `${shift}px`);
     }
    }
    if (process) {
     const position = process.getBoundingClientRect();
     process.style.setProperty("--route-progress", String(Math.max(0, Math.min(1, (height * .85 - position.top) / (position.height + height * .2)))));
    }
    if (Math.abs(targetX - x) + Math.abs(targetY - y) > .05) schedule();
   };
   const schedule = () => { if (!frame && !disposed) frame = requestAnimationFrame(render); };
   const move = (event: PointerEvent) => {
    if (!hero || !finePointer.matches) return;
    const bounds = hero.getBoundingClientRect();
    targetX = (event.clientX / bounds.width - .5) * 24;
    targetY = ((event.clientY - bounds.top) / bounds.height - .5) * 16;
    schedule();
   };
   const reset = () => { targetX = 0; targetY = 0; schedule(); };
   const updatePointerMotion = () => {
    heroPhoto?.style.removeProperty("--photo-x");
    heroPhoto?.style.removeProperty("--photo-y");
    aboutImage?.style.removeProperty("--image-shift");
    x = 0;
    y = 0;
    reset();
   };
   const visibility = new IntersectionObserver(entries => {
    if (disposed) return;
    heroVisible = entries[0]?.isIntersecting ?? false;
    if (hero) hero.dataset.inView = String(heroVisible);
    if (heroVisible) schedule();
   });
   if (hero) {
    visibility.observe(hero);
    hero.addEventListener("pointermove", move, {passive:true});
    hero.addEventListener("pointerleave", reset);
   }
   window.addEventListener("scroll", schedule, {passive:true});
   window.addEventListener("resize", schedule, {passive:true});
   finePointer.addEventListener("change", updatePointerMotion);
   schedule();

   teardown = () => {
    disposed = true;
    observer.disconnect();
    mutation.disconnect();
    visibility.disconnect();
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    finePointer.removeEventListener("change", updatePointerMotion);
    hero?.removeEventListener("pointermove", move);
    hero?.removeEventListener("pointerleave", reset);
    pending.forEach(element => delete element.dataset.motionPending);
    animations.forEach(animation => animation.cancel());
    root.classList.remove("motion-enabled");
    heroPhoto?.style.removeProperty("--photo-x");
    heroPhoto?.style.removeProperty("--photo-y");
    aboutImage?.style.removeProperty("--image-shift");
    process?.style.removeProperty("--route-progress");
    header?.removeAttribute("data-nav-hidden");
   };
  };

  configure();
  preference.addEventListener("change", configure);
  return () => { preference.removeEventListener("change", configure); teardown(); };
 }, []);
}
