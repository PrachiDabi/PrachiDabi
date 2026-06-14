(() => {
    const ExpertiseScene = document.querySelector('.ExpertiseScene');
    const GlobeRing = document.querySelector('.OrbitGlobeRing');
    const Pills = document.querySelectorAll('.OrbitPill[data-angle]');
    const SkillsSection = document.querySelector('.SkillsSection');
    const ReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    function GetGlobeAngle() {
        if (!GlobeRing) return 0;

        const Transform = getComputedStyle(GlobeRing).transform;
        if (Transform === 'none') return 0;

        const Values = Transform.match(/matrix\(([^)]+)\)/);
        if (!Values) return 0;

        const Parts = Values[1].split(',').map(Number);
        const Angle = Math.atan2(Parts[1], Parts[0]) * (180 / Math.PI);
        return ((Angle % 360) + 360) % 360;
    }

    function GetAngleDistance(AngleA, AngleB) {
        const Diff = Math.abs(AngleA - AngleB);
        return Math.min(Diff, 360 - Diff);
    }

    function UpdatePillHighlights() {
        const GlobeAngle = GetGlobeAngle();

        Pills.forEach((Pill) => {
            const PillAngle = parseFloat(Pill.dataset.angle);
            const Distance = GetAngleDistance(GlobeAngle, PillAngle);
            Pill.classList.toggle('IsLit', Distance < 28);
        });
    }

    function AnimateHighlights() {
        UpdatePillHighlights();
        requestAnimationFrame(AnimateHighlights);
    }

    if (ExpertiseScene) {
        const Observer = new IntersectionObserver(
            ([Entry]) => {
                if (Entry.isIntersecting) {
                    ExpertiseScene.classList.add('IsVisible');
                }
            },
            { threshold: 0.25 }
        );

        Observer.observe(ExpertiseScene);
        requestAnimationFrame(AnimateHighlights);
    }

    if (SkillsSection) {
        if (!ReducedMotionQuery.matches) {
            SkillsSection.classList.add('HasScrollReveal');
        }

        const SkillsObserver = new IntersectionObserver(
            ([Entry]) => {
                if (Entry.isIntersecting) {
                    SkillsSection.classList.add('IsVisible');
                    SkillsObserver.disconnect();
                }
            },
            { threshold: 0.08, rootMargin: '0px 0px -5% 0px' }
        );

        SkillsObserver.observe(SkillsSection);

        if (SkillsSection.getBoundingClientRect().top < window.innerHeight * 0.9) {
            SkillsSection.classList.add('IsVisible');
        }
    }
})();
