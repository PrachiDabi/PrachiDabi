const CursorLayer = document.querySelector('.CursorLayer');
const CursorGlow = document.querySelector('.CursorGlow');
const CursorRing = document.querySelector('.CursorRing');
const CursorDot = document.querySelector('.CursorDot');

const FinePointerQuery = window.matchMedia('(pointer: fine)');
const CursorReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

let CursorX = window.innerWidth / 2;
let CursorY = window.innerHeight / 2;
let GlowX = CursorX;
let GlowY = CursorY;
let RingX = CursorX;
let RingY = CursorY;
let IsPointerActive = false;
let IsAnimating = false;

function IsCursorEnabled() {
    return FinePointerQuery.matches && !CursorReducedMotionQuery.matches && CursorLayer;
}

function SetCursorVisibility(IsVisible) {
    if (!CursorLayer) return;

    CursorLayer.classList.toggle('IsHidden', !IsVisible);
    document.body.classList.toggle('HasCustomCursor', IsVisible);
}

function UpdateCursorTargets(ClientX, ClientY) {
    CursorX = ClientX;
    CursorY = ClientY;
}

function AnimateCursor() {
    if (!IsCursorEnabled()) {
        IsAnimating = false;
        return;
    }

    GlowX += (CursorX - GlowX) * 0.08;
    GlowY += (CursorY - GlowY) * 0.08;
    RingX += (CursorX - RingX) * 0.22;
    RingY += (CursorY - RingY) * 0.22;

    CursorGlow.style.transform = `translate(${GlowX}px, ${GlowY}px)`;
    CursorRing.style.transform = `translate(${RingX}px, ${RingY}px)`;
    CursorDot.style.transform = `translate(${CursorX}px, ${CursorY}px)`;
    document.documentElement.style.setProperty('--CursorAmbientX', `${GlowX}px`);
    document.documentElement.style.setProperty('--CursorAmbientY', `${GlowY}px`);

    requestAnimationFrame(AnimateCursor);
}

function StartCursorAnimation() {
    if (IsAnimating || !IsCursorEnabled()) return;

    IsAnimating = true;
    requestAnimationFrame(AnimateCursor);
}

function HandlePointerMove(Event) {
    if (!IsCursorEnabled()) return;

    UpdateCursorTargets(Event.clientX, Event.clientY);

    if (!IsPointerActive) {
        IsPointerActive = true;
        CursorLayer.classList.add('IsActive');
        StartCursorAnimation();
    }
}

function HandlePointerLeave() {
    IsPointerActive = false;
    CursorLayer?.classList.remove('IsActive');
}

function HandlePointerDown() {
    CursorLayer?.classList.add('IsPressed');
}

function HandlePointerUp() {
    CursorLayer?.classList.remove('IsPressed');
}

function HandleInteractiveEnter() {
    CursorLayer?.classList.add('IsHovering');
}

function HandleInteractiveLeave() {
    CursorLayer?.classList.remove('IsHovering');
}

function BindInteractiveElements() {
    const InteractiveSelector = 'a, button, [role="button"], input, textarea, select, label, .OrbitPill, .TechTag, .SkillsCard, .JourneyCard, .JourneyAward, .WorkDoneCard, .WorkDoneFilter, .MediaGalleryItem, .MediaLightboxClose, .MediaLightboxBackdrop';

    document.addEventListener('mouseover', (Event) => {
        if (!IsCursorEnabled()) return;
        if (Event.target.closest(InteractiveSelector)) {
            HandleInteractiveEnter();
        }
    });

    document.addEventListener('mouseout', (Event) => {
        if (!IsCursorEnabled()) return;
        const Related = Event.relatedTarget;
        if (Event.target.closest(InteractiveSelector) && (!Related || !Related.closest(InteractiveSelector))) {
            HandleInteractiveLeave();
        }
    });
}

function SyncCursorMode() {
    const Enabled = IsCursorEnabled();
    SetCursorVisibility(Enabled);

    if (!Enabled) {
        IsPointerActive = false;
        IsAnimating = false;
        CursorLayer?.classList.remove('IsActive', 'IsPressed', 'IsHovering');
        return;
    }

    if (IsPointerActive) {
        StartCursorAnimation();
    }
}

function InitCursor() {
    if (!CursorLayer) return;

    SyncCursorMode();
    BindInteractiveElements();

    document.addEventListener('mousemove', HandlePointerMove);
    document.addEventListener('mouseleave', HandlePointerLeave);
    document.addEventListener('mousedown', HandlePointerDown);
    document.addEventListener('mouseup', HandlePointerUp);

    FinePointerQuery.addEventListener('change', SyncCursorMode);
    CursorReducedMotionQuery.addEventListener('change', SyncCursorMode);
}

InitCursor();
