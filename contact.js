(() => {
    const ContactSection = document.querySelector('.ContactSection');
    const ContactForm = document.getElementById('ContactForm');
    const ContactFormStatus = document.getElementById('ContactFormStatus');
    const ReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const ContactEmail = 'prachidabi96@gmail.com';

    function InitContactReveal() {
        if (!ContactSection) return;

        const Card = ContactSection.querySelector('.ContactCard');

        if (ReducedMotionQuery.matches) {
            Card?.classList.add('IsRevealed');
            return;
        }

        ContactSection.classList.add('HasScrollReveal');

        const RevealObserver = new IntersectionObserver(
            ([Entry]) => {
                if (Entry.isIntersecting) {
                    Card?.classList.add('IsRevealed');
                    RevealObserver.disconnect();
                }
            },
            { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
        );

        if (Card) RevealObserver.observe(Card);
    }

    function SetFormStatus(Message, Type = '') {
        if (!ContactFormStatus) return;
        ContactFormStatus.textContent = Message;
        ContactFormStatus.className = 'ContactFormStatus';
        if (Type) {
            ContactFormStatus.classList.add(`ContactFormStatus--${Type}`);
        }
    }

    async function HandleFormSubmit(Event) {
        Event.preventDefault();
        if (!ContactForm) return;

        const SubmitButton = ContactForm.querySelector('.ContactSubmitButton');
        const HoneyField = ContactForm.querySelector('.ContactHoney');

        if (HoneyField?.value) return;

        const FormData = new FormData(ContactForm);
        const Name = FormData.get('Name')?.toString().trim();
        const Email = FormData.get('Email')?.toString().trim();
        const Message = FormData.get('Message')?.toString().trim();

        if (!Name || !Email || !Message) {
            SetFormStatus('Please fill in all fields.', 'Error');
            return;
        }

        SubmitButton?.classList.add('IsLoading');
        SubmitButton?.setAttribute('disabled', 'true');
        SetFormStatus('Sending your message...', 'Pending');

        try {
            const Response = await fetch(`https://formsubmit.co/ajax/${ContactEmail}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({
                    name: Name,
                    email: Email,
                    message: Message,
                    _subject: `Portfolio message from ${Name}`,
                    _template: 'table'
                })
            });

            if (!Response.ok) {
                throw new Error('Request failed');
            }

            ContactForm.reset();
            SetFormStatus('Message sent! I will get back to you soon.', 'Success');
        } catch {
            SetFormStatus('Something went wrong. Please email me directly.', 'Error');
        } finally {
            SubmitButton?.classList.remove('IsLoading');
            SubmitButton?.removeAttribute('disabled');
        }
    }

    function CheckSentQuery() {
        const Params = new URLSearchParams(window.location.search);
        if (Params.get('sent') === 'true') {
            SetFormStatus('Message sent! I will get back to you soon.', 'Success');
        }
    }

    if (ContactForm) {
        ContactForm.addEventListener('submit', HandleFormSubmit);
    }

    InitContactReveal();
    CheckSentQuery();
})();
