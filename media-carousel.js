(() => {
    const VideoExtensions = ['mp4', 'webm', 'mov', 'ogg', 'm4v'];

    function IsVideoFile(FilePath) {
        const Extension = FilePath.split('.').pop()?.toLowerCase() || '';
        return VideoExtensions.includes(Extension);
    }

    function CreateMediaElement(FilePath, Options = {}) {
        const {
            Autoplay = false,
            Muted = true,
            Controls = false,
            Loop = false,
            ClassName = '',
            AltText = 'Gallery media'
        } = Options;

        if (IsVideoFile(FilePath)) {
            const Video = document.createElement('video');
            Video.src = FilePath;
            Video.className = ClassName;
            Video.muted = Muted;
            Video.loop = Loop;
            Video.playsInline = true;
            Video.controls = Controls;
            Video.preload = 'metadata';
            if (Autoplay) {
                Video.autoplay = true;
            }
            return Video;
        }

        const Image = document.createElement('img');
        Image.src = FilePath;
        Image.alt = AltText;
        Image.className = ClassName;
        Image.loading = 'lazy';
        Image.decoding = 'async';
        return Image;
    }

    function InitMediaCarousel(Config) {
        const {
            SectionSelector,
            TrackId,
            TrackCloneId,
            CarouselId,
            HoverZoomId,
            HoverZoomFrameSelector,
            LightboxId,
            LightboxContentId,
            LightboxBodyClass,
            ItemClass,
            ItemFrameClass,
            ItemMediaClass,
            ItemMetaClass,
            ItemLabelClass,
            ItemTypeClass,
            HoverZoomMediaClass,
            HoverZoomCaptionClass,
            LightboxMediaClass,
            LightboxCaptionClass,
            Assets,
            CarouselSpeed = 72,
            MediaAlt = 'Gallery media',
            ReverseDirection = false,
            GalleryVariant = 'Default',
            ShowCaptions = true
        } = Config;

        const Track = document.getElementById(TrackId);
        const TrackClone = document.getElementById(TrackCloneId);
        const Carousel = document.getElementById(CarouselId);
        const Section = document.querySelector(SectionSelector);
        const HoverZoom = document.getElementById(HoverZoomId);
        const HoverZoomFrame = HoverZoom?.querySelector(HoverZoomFrameSelector);
        const Lightbox = document.getElementById(LightboxId);
        const LightboxContent = document.getElementById(LightboxContentId);
        const LightboxClose = Lightbox?.querySelector('.MediaLightboxClose');
        const LightboxBackdrop = Lightbox?.querySelector('.MediaLightboxBackdrop');
        const ReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        let HoverHideTimer = null;
        let LightboxOpen = false;

        function CreateGalleryItem(Asset, IsClone = false) {
            const Item = document.createElement('button');
            Item.type = 'button';
            Item.className = ItemClass;
            Item.dataset.src = Asset.File;
            Item.dataset.label = Asset.Label;
            Item.dataset.isVideo = IsVideoFile(Asset.File) ? 'true' : 'false';

            if (GalleryVariant === 'Testimonial') {
                Item.classList.add('TestimonialsCard');
            }

            if (IsClone) {
                Item.setAttribute('tabindex', '-1');
                Item.setAttribute('aria-hidden', 'true');
            }

            const Frame = document.createElement('div');
            Frame.className = ItemFrameClass;

            if (GalleryVariant === 'Testimonial') {
                const QuoteMark = document.createElement('span');
                QuoteMark.className = 'TestimonialsQuoteMark';
                QuoteMark.setAttribute('aria-hidden', 'true');
                QuoteMark.textContent = '“';
                Frame.appendChild(QuoteMark);
            }

            const Media = CreateMediaElement(Asset.File, {
                ClassName: ItemMediaClass,
                AltText: MediaAlt
            });
            Frame.appendChild(Media);

            if (GalleryVariant === 'Testimonial') {
                Item.appendChild(Frame);
                return Item;
            }

            const Meta = document.createElement('div');
            Meta.className = ItemMetaClass;
            Meta.innerHTML = `
                <span class="${ItemLabelClass}">${Asset.Label}</span>
                ${IsVideoFile(Asset.File) ? `<span class="${ItemTypeClass}">Video</span>` : ''}
            `;

            Item.appendChild(Frame);
            Item.appendChild(Meta);
            return Item;
        }

        function BuildTracks() {
            if (!Track || !TrackClone) return;

            Assets.forEach((Asset) => {
                Track.appendChild(CreateGalleryItem(Asset, false));
                TrackClone.appendChild(CreateGalleryItem(Asset, true));
            });
        }

        function ClearContainer(Container) {
            if (!Container) return;
            Container.querySelectorAll('video').forEach((Video) => {
                Video.pause();
                Video.removeAttribute('src');
                Video.load();
            });
            Container.innerHTML = '';
        }

        function SetCarouselPaused(IsPaused) {
            Carousel?.classList.toggle('IsPaused', IsPaused);
        }

        function UpdateCarouselDuration() {
            if (!Track || !Carousel) return;

            const TrackWidth = Track.getBoundingClientRect().width;
            const Duration = Math.max(TrackWidth / CarouselSpeed, 24);
            Carousel.style.setProperty('--CarouselDuration', `${Duration}s`);
            Carousel.classList.toggle('IsReverse', ReverseDirection);
        }

        function ShowHoverZoom(Item) {
            if (!HoverZoom || !HoverZoomFrame || LightboxOpen) return;

            ClearContainer(HoverZoomFrame);

            const Media = CreateMediaElement(Item.dataset.src, {
                ClassName: HoverZoomMediaClass,
                AltText: MediaAlt,
                Autoplay: Item.dataset.isVideo === 'true',
                Muted: true,
                Loop: true
            });

            HoverZoomFrame.appendChild(Media);

            if (Media.tagName === 'VIDEO') {
                Media.play().catch(() => {});
            }

            if (ShowCaptions) {
                const Caption = document.createElement('span');
                Caption.className = HoverZoomCaptionClass;
                Caption.textContent = Item.dataset.label;
                HoverZoomFrame.appendChild(Caption);
            }

            HoverZoom.classList.add('IsVisible');
            SetCarouselPaused(true);
        }

        function HideHoverZoom() {
            if (!HoverZoom || LightboxOpen) return;
            HoverZoom.classList.remove('IsVisible');
            ClearContainer(HoverZoomFrame);

            if (!LightboxOpen) {
                SetCarouselPaused(false);
            }
        }

        function OpenLightbox(Item) {
            if (!Lightbox || !LightboxContent) return;

            HideHoverZoom();
            ClearContainer(LightboxContent);

            const Media = CreateMediaElement(Item.dataset.src, {
                ClassName: LightboxMediaClass,
                AltText: MediaAlt,
                Autoplay: Item.dataset.isVideo === 'true',
                Muted: false,
                Controls: Item.dataset.isVideo === 'true',
                Loop: false
            });

            LightboxContent.appendChild(Media);

            if (Media.tagName === 'VIDEO') {
                Media.play().catch(() => {});
            }

            if (ShowCaptions) {
                const Caption = document.createElement('p');
                Caption.className = LightboxCaptionClass;
                Caption.textContent = Item.dataset.label;
                LightboxContent.appendChild(Caption);
            }

            Lightbox.classList.add('IsOpen');
            Lightbox.setAttribute('aria-hidden', 'false');
            document.body.classList.add(LightboxBodyClass);
            LightboxOpen = true;
            SetCarouselPaused(true);
        }

        function CloseLightbox() {
            if (!Lightbox || !LightboxContent) return;

            ClearContainer(LightboxContent);
            Lightbox.classList.remove('IsOpen');
            Lightbox.setAttribute('aria-hidden', 'true');
            document.body.classList.remove(LightboxBodyClass);
            LightboxOpen = false;
            SetCarouselPaused(false);
        }

        function BindItemInteractions(Item) {
            Item.addEventListener('mouseenter', () => {
                clearTimeout(HoverHideTimer);
                Item.classList.add('IsHovered');
                ShowHoverZoom(Item);
            });

            Item.addEventListener('mouseleave', () => {
                Item.classList.remove('IsHovered');
                HoverHideTimer = setTimeout(HideHoverZoom, 120);
            });

            Item.addEventListener('click', () => {
                OpenLightbox(Item);
            });

            if (Item.getAttribute('aria-hidden') !== 'true') {
                Item.addEventListener('focus', () => {
                    Item.classList.add('IsHovered');
                    ShowHoverZoom(Item);
                });

                Item.addEventListener('blur', () => {
                    Item.classList.remove('IsHovered');
                    HideHoverZoom();
                });
            }
        }

        function BindInteractions() {
            if (!Carousel) return;

            Carousel.querySelectorAll(`.${ItemClass}`).forEach(BindItemInteractions);

            LightboxClose?.addEventListener('click', CloseLightbox);
            LightboxBackdrop?.addEventListener('click', CloseLightbox);

            document.addEventListener('keydown', (Event) => {
                if (Event.key === 'Escape' && LightboxOpen) {
                    CloseLightbox();
                }
            });
        }

        function InitReveal() {
            if (!Section) return;

            const Header = Section.querySelector('.MediaGalleryHeader');
            const ScrollWrap = Section.querySelector('.MediaScrollWrap');

            if (ReducedMotionQuery.matches) {
                Header?.classList.add('IsRevealed');
                ScrollWrap?.classList.add('IsRevealed');
                SetCarouselPaused(true);
                return;
            }

            Section.classList.add('HasScrollReveal');

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

            if (Header) RevealObserver.observe(Header);
            if (ScrollWrap) RevealObserver.observe(ScrollWrap);
        }

        function InitAutoCarousel() {
            if (!Carousel) return;

            const RefreshDuration = () => {
                requestAnimationFrame(UpdateCarouselDuration);
            };

            RefreshDuration();
            window.addEventListener('resize', RefreshDuration);
            window.addEventListener('load', RefreshDuration);

            Track?.querySelectorAll('img, video').forEach((Media) => {
                Media.addEventListener('loadeddata', RefreshDuration, { once: true });
                Media.addEventListener('load', RefreshDuration, { once: true });
            });

            if (!ReducedMotionQuery.matches) {
                Carousel.classList.add('IsAutoPlaying');
            }
        }

        BuildTracks();
        BindInteractions();
        InitReveal();
        InitAutoCarousel();
    }

    window.InitMediaCarousel = InitMediaCarousel;
})();
