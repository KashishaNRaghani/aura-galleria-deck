// Force scroll to top on page reload to avoid being stuck below the locked hero section
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener("DOMContentLoaded", () => {
    // GSAP Initial Setup
    gsap.registerPlugin(ScrollTrigger);

    // Initial Loading Sequence
    const loaderTL = gsap.timeline();

    loaderTL.to(".loader-text", { opacity: 1, duration: 1, ease: "power2.inOut" })
        .to(".loader-progress", { width: "100%", duration: 1.5, ease: "power2.inOut" }, "-=0.5")
        .to("#loader", { yPercent: -100, duration: 1, ease: "power4.inOut" })
        .to("#global-nav", { opacity: 1, duration: 1 }, "-=0.5")
        .from(".title-reveal", { y: 100, opacity: 0, duration: 1.5, stagger: 0.2, ease: "power4.out" }, "-=1")
        .from(".subtitle-reveal", { y: 50, opacity: 0, duration: 1, ease: "power3.out" }, "-=1")
        .from(".cta-enter", { opacity: 0, scale: 0.9, duration: 1, ease: "power3.out" }, "-=0.8");

    // Scroll-based Scene Transitions
    // We create a ScrollTrigger for each scene to handle snap and reveal
    const scenes = gsap.utils.toArray('.scene');

    // (Removed abstract shape animations as they are replaced by video)

    // Scene 2: Scale Animation Update
    const scaleTL = gsap.timeline({
        scrollTrigger: {
            trigger: "#scene-2",
            start: "top 60%",
            toggleActions: "restart reverse restart reverse"
        }
    });

    scaleTL.from(".scale-image", { clipPath: "inset(100% 0 0 0)", duration: 1.5, ease: "power4.out" })
           .to("#scale-img", { scale: 1, filter: "contrast(100%) grayscale(0%)", duration: 2, ease: "power2.out" }, "-=1")
           .from(".stat-card", { y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: "power3.out" }, "-=1.5");

    // Scene 3: Retail Grid Interaction & Parallax
    gsap.to("#retail-img", {
        scrollTrigger: {
            trigger: "#scene-3",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        },
        yPercent: 20
    });
    gsap.from(".retail-panel", {
        scrollTrigger: {
            trigger: "#scene-3",
            start: "top 70%",
            toggleActions: "restart reverse restart reverse"
        },
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out"
    });

    // Scene 4: Luxury Marquee and Line
    gsap.from(".luxury-line", {
        scrollTrigger: {
            trigger: "#scene-4",
            start: "top 60%",
            toggleActions: "restart reverse restart reverse"
        },
        height: 0,
        duration: 1.5,
        ease: "power3.inOut"
    });

    // Scene 5: Entertainment Hotspots & Floorplan
    gsap.from("#floorplan-img", {
        scrollTrigger: {
            trigger: "#scene-5",
            start: "top 60%",
            toggleActions: "restart reverse restart reverse"
        },
        scale: 1.1,
        opacity: 0,
        duration: 2,
        ease: "power3.out"
    });

    gsap.from(".hotspot", {
        scrollTrigger: {
            trigger: "#scene-5",
            start: "top 50%",
            toggleActions: "restart reverse restart reverse"
        },
        scale: 0,
        opacity: 0,
        duration: 1,
        stagger: 0.3,
        ease: "elastic.out(1, 0.5)"
    });

    // Scene 6: Climax
    const climaxTL = gsap.timeline({
        scrollTrigger: {
            trigger: "#scene-6",
            start: "top 40%",
            toggleActions: "restart reverse restart reverse"
        }
    });

    climaxTL.from(".climax-title", { scale: 1.5, opacity: 0, filter: "blur(20px)", duration: 2, ease: "power4.out" })
        .from(".climax-desc", { y: 30, opacity: 0, duration: 1 }, "-=1");


    // Cinematic Hero Video Logic
    const heroVideo = document.getElementById("hero-video");
    const videoOverlay = document.getElementById("video-overlay");
    const heroContent = document.getElementById("hero-content");
    const skipBtn = document.getElementById("skip-btn");
    const enterBtn = document.getElementById("enter-btn");
    const muteToggleBtn = document.getElementById("mute-toggle-btn");

    let videoPlayed = false;

    // Lock scrolling initially ONLY if we are at the top
    function checkScrollLock() {
        if (window.scrollY > 50) {
            // User somehow bypassed the scroll lock (e.g., page reload restoration)
            videoPlayed = true;
            document.body.style.overflow = "auto";
            
            // Fast-forward to post-cinematic state without animating scroll
            heroContent.style.opacity = "0";
            heroContent.style.pointerEvents = "none";
            const scene1 = document.getElementById("scene-1");
            scene1.classList.add("post-cinematic");
            videoOverlay.style.opacity = "0.5";
            heroVideo.loop = true;
            heroVideo.playbackRate = 0.6;
            heroVideo.muted = true;
            heroVideo.play().catch(e => console.log("Ambient loop play prevented"));
        } else {
            document.body.style.overflow = "hidden";
        }
    }
    
    // Check immediately and also after a short delay to catch browser scroll restoration
    checkScrollLock();
    setTimeout(checkScrollLock, 100);

    function playCinematic() {
        if (videoPlayed) return;
        videoPlayed = true;

        // Fade out content and show video
        heroContent.style.opacity = "0";
        heroContent.style.pointerEvents = "none";
        
        videoOverlay.style.opacity = "0";
        skipBtn.classList.add("visible");
        muteToggleBtn.classList.add("visible");
        
        heroVideo.muted = true; // Unmute manually by user
        muteToggleBtn.textContent = "UNMUTE";
        heroVideo.currentTime = 0;
        heroVideo.playbackRate = 1.5; // Make video 50% faster
        
        // Use a promise to handle autoplay restrictions safely
        const playPromise = heroVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Autoplay prevented or video not loaded fully yet.");
                heroVideo.muted = true;
                muteToggleBtn.textContent = "UNMUTE";
                heroVideo.play();
            });
        }
    }

    muteToggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (heroVideo.muted) {
            heroVideo.muted = false;
            muteToggleBtn.textContent = "MUTE";
        } else {
            heroVideo.muted = true;
            muteToggleBtn.textContent = "UNMUTE";
        }
    });

    function endCinematic(autoScroll = true) {
        // If called from an event listener, autoScroll will be the event object, so default to true
        if (typeof autoScroll !== 'boolean') {
            autoScroll = true;
        }
        document.body.style.overflow = "auto";
        skipBtn.classList.remove("visible");
        muteToggleBtn.classList.remove("visible");
        
        // Transform hero into post-cinematic interactive frame
        const scene1 = document.getElementById("scene-1");
        scene1.classList.add("post-cinematic");
        
        videoOverlay.style.opacity = "0.5"; // Darken slightly for new text readability
        
        // Loop ambiently for the revisit state
        heroVideo.loop = true;
        heroVideo.playbackRate = 0.6; // Slow, chill premium vibe
        heroVideo.muted = true;
        heroVideo.play().catch(e => console.log("Ambient loop play prevented"));
        
        // Ensure user stays on the hero section to see the CTA after the video ends
    }

    // Connect CTA Scroll
    const connectBtn = document.querySelector(".cta-connect");
    if(connectBtn) {
        connectBtn.addEventListener("click", () => {
            gsap.to(window, {
                duration: 1.5,
                scrollTo: "#footer",
                ease: "power3.inOut"
            });
        });
    }

    // Force scroll to top on reload
    window.addEventListener('beforeunload', () => {
        window.scrollTo(0, 0);
    });

    enterBtn.addEventListener("click", playCinematic);
    skipBtn.addEventListener("click", endCinematic);
    heroVideo.addEventListener("ended", endCinematic);

    // Trigger on first scroll attempt (mouse wheel or trackpad)
    window.addEventListener("wheel", (e) => {
        // Only trigger if scrolling down and video hasn't played
        if (!videoPlayed && e.deltaY > 0) {
            if (window.scrollY < 50) {
                playCinematic();
            } else {
                // Failsafe: if we are somehow scrolled down, just unlock
                checkScrollLock();
            }
        }
    });
    
    // Also support touch scrolling for mobile
    let touchStartY = 0;
    window.addEventListener("touchstart", (e) => {
        touchStartY = e.touches[0].clientY;
    }, {passive: true});
    
    window.addEventListener("touchend", (e) => {
        let touchEndY = e.changedTouches[0].clientY;
        // If swiped up (scrolling down the page)
        if (!videoPlayed && touchStartY > touchEndY + 30) {
            if (window.scrollY < 50) {
                playCinematic();
            } else {
                checkScrollLock();
            }
        }
    }, {passive: true});

    // Navigation Active State Update
    scenes.forEach((scene, i) => {
        ScrollTrigger.create({
            trigger: scene,
            start: "top 50%",
            end: "bottom 50%",
            onEnter: () => updateNav(i),
            onEnterBack: () => updateNav(i)
        });
    });

    // Navigation Click Logic
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator) => {
        indicator.style.cursor = 'pointer';
        indicator.addEventListener('click', () => {
            const targetId = indicator.getAttribute('data-target');
            if (targetId) {
                gsap.to(window, {
                    duration: 1.5,
                    scrollTo: `#${targetId}`,
                    ease: "power3.inOut"
                });
            }
        });
    });

    // Menu Button Click Logic
    const menuBtn = document.querySelector('.nav-menu-btn');
    if (menuBtn) {
        menuBtn.style.cursor = 'pointer';
        menuBtn.addEventListener('click', () => {
            const targetId = menuBtn.getAttribute('data-target');
            if (targetId) {
                gsap.to(window, {
                    duration: 1.5,
                    scrollTo: `#${targetId}`,
                    ease: "power3.inOut"
                });
            }
        });
    }

    // Hotspot Interactive Info Logic
    const hotspots = document.querySelectorAll('.hotspot');
    const infoTitle = document.getElementById('ent-info-title');
    const infoDesc = document.getElementById('ent-info-desc');
    
    if (hotspots.length > 0 && infoTitle && infoDesc) {
        hotspots.forEach(hotspot => {
            hotspot.addEventListener('mouseenter', () => {
                infoTitle.textContent = hotspot.getAttribute('data-title');
                infoDesc.textContent = hotspot.getAttribute('data-desc');
            });
            hotspot.addEventListener('mouseleave', () => {
                infoTitle.textContent = 'EXPLORE THE MAP';
                infoDesc.textContent = 'Interactive hotspots reveal the future of immersive experiences.';
            });
        });
    }

    function updateNav(index) {
        document.querySelectorAll('.indicator').forEach((ind, i) => {
            if (i === index) {
                ind.classList.add('active');
            } else {
                ind.classList.remove('active');
            }
        });
    }

    // Secure Your Space CTA
    const secureBtn = document.getElementById("secure-btn");
    if (secureBtn) {
        secureBtn.addEventListener("click", () => {
            gsap.to(window, {
                duration: 1.5,
                scrollTo: "#footer",
                ease: "power3.inOut"
            });
        });
    }

    // Footer Enquiry Form & Overlay Logic
    const enquiryForm = document.getElementById("enquiry-form");
    const overlay = document.getElementById("thank-you-overlay");

    if (enquiryForm && overlay) {
        enquiryForm.addEventListener("submit", (e) => {
            e.preventDefault(); // Stop page reload
            
            // Show Overlay
            overlay.classList.add("active");
            
            // Wait 3 seconds, then redirect/scroll
            setTimeout(() => {
                overlay.classList.remove("active");
                enquiryForm.reset();
                
                // Scroll back to hero
                gsap.to(window, {
                    duration: 1.5,
                    scrollTo: 0,
                    ease: "power3.inOut"
                });
            }, 3000);
        });
    }
});
