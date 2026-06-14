(() => {
    const WorkDoneSection = document.querySelector('.WorkDoneSection');
    const WorkDoneCards = document.querySelectorAll('.WorkDoneCard');
    const WorkDoneFilters = document.querySelectorAll('.WorkDoneFilter');
    const WorkDoneRevealTargets = document.querySelectorAll('.WorkDoneHeader, .WorkDoneFilters, .WorkDoneCard');
    const ReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    function InitWorkDoneReveal() {
        if (!WorkDoneSection) return;

        if (ReducedMotionQuery.matches) {
            WorkDoneRevealTargets.forEach((Target) => Target.classList.add('IsRevealed'));
            return;
        }

        WorkDoneSection.classList.add('HasScrollReveal');

        const RevealObserver = new IntersectionObserver(
            (Entries) => {
                Entries.forEach((Entry) => {
                    if (Entry.isIntersecting) {
                        Entry.target.classList.add('IsRevealed');
                        RevealObserver.unobserve(Entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
        );

        WorkDoneRevealTargets.forEach((Target) => {
            if (Target.getBoundingClientRect().top < window.innerHeight * 0.9) {
                Target.classList.add('IsRevealed');
                return;
            }

            RevealObserver.observe(Target);
        });
    }

    function ApplyFilter(FilterValue) {
        WorkDoneCards.forEach((Card) => {
            const Category = Card.dataset.category;
            const IsVisible = FilterValue === 'All' || Category === FilterValue;
            Card.classList.toggle('IsHidden', !IsVisible);
        });
    }

    function InitWorkDoneFilters() {
        WorkDoneFilters.forEach((FilterButton) => {
            FilterButton.addEventListener('click', () => {
                const FilterValue = FilterButton.dataset.filter;

                WorkDoneFilters.forEach((Button) => {
                    const IsActive = Button === FilterButton;
                    Button.classList.toggle('WorkDoneFilter--Active', IsActive);
                    Button.setAttribute('aria-selected', IsActive ? 'true' : 'false');
                });

                ApplyFilter(FilterValue);
            });
        });
    }

    InitWorkDoneReveal();
    InitWorkDoneFilters();
})();
