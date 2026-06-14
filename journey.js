(() => {
    const JourneySection = document.querySelector('.JourneySection');
    const JourneyTimeline = document.querySelector('.JourneyTimeline');
    const JourneyTrackFill = document.querySelector('.JourneyTrackFill');
    const JourneyNodes = document.querySelectorAll('.JourneyNode');
    const JourneyRevealTargets = document.querySelectorAll(
        '.JourneyHeader, .JourneyAwards, .JourneyPhaseLabel, .JourneyNode'
    );
    const ReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    function InitJourneyReveal() {
        if (!JourneySection) return;

        if (ReducedMotionQuery.matches) {
            JourneyRevealTargets.forEach((Target) => Target.classList.add('IsRevealed'));
            return;
        }

        JourneySection.classList.add('HasScrollReveal');

        const RevealObserver = new IntersectionObserver(
            (Entries) => {
                Entries.forEach((Entry) => {
                    if (Entry.isIntersecting) {
                        Entry.target.classList.add('IsRevealed');
                        RevealObserver.unobserve(Entry.target);
                    }
                });
            },
            { threshold: 0.18, rootMargin: '0px 0px -10% 0px' }
        );

        JourneyRevealTargets.forEach((Target) => {
            if (Target.getBoundingClientRect().top < window.innerHeight * 0.88) {
                Target.classList.add('IsRevealed');
                return;
            }

            RevealObserver.observe(Target);
        });
    }

    function UpdateTimelineProgress() {
        if (!JourneyTimeline || !JourneyTrackFill) return;

        const Rect = JourneyTimeline.getBoundingClientRect();
        const ViewportMiddle = window.innerHeight * 0.55;
        const TimelineTop = Rect.top;
        const TimelineHeight = Rect.height;
        const Scrolled = ViewportMiddle - TimelineTop;
        const Progress = Math.min(Math.max(Scrolled / TimelineHeight, 0), 1);

        JourneyTrackFill.style.height = `${Progress * 100}%`;

        JourneyNodes.forEach((Node) => {
            const NodeRect = Node.getBoundingClientRect();
            const NodeCenter = NodeRect.top + NodeRect.height / 2;
            Node.classList.toggle('IsActive', NodeCenter < ViewportMiddle + 40);
        });
    }

    function InitJourneyTimeline() {
        if (!JourneySection) return;

        UpdateTimelineProgress();
        window.addEventListener('scroll', UpdateTimelineProgress, { passive: true });
        window.addEventListener('resize', UpdateTimelineProgress);
    }

    InitJourneyReveal();
    InitJourneyTimeline();
})();
