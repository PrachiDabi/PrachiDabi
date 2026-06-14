(() => {
    const ContactSection = document.querySelector('.ContactSection');
    const ContactForm = document.getElementById('ContactForm');
    const ContactFormStatus = document.getElementById('ContactFormStatus');
    const ReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const FormspreeEndpoint = 'https://formspree.io/f/mjgdjpgo';

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
        const HoneyField = ContactForm.querySelector('[name="_gotcha"]');

        if (HoneyField?.value) return;

        const FormPayload = new window.FormData(ContactForm);
        const Name = FormPayload.get('name')?.toString().trim();
        const Email = FormPayload.get('email')?.toString().trim();
        const UserMessage = FormPayload.get('message')?.toString().trim();

        if (!Name || !Email || !UserMessage) {
            SetFormStatus('Please fill in all fields.', 'Error');
            return;
        }

        FormPayload.set('_subject', `Portfolio message from ${Name}`);
        FormPayload.set('_replyto', Email);

        SubmitButton?.classList.add('IsLoading');
        SubmitButton?.setAttribute('disabled', 'true');
        SetFormStatus('Sending your message...', 'Pending');

        try {
            const Response = await fetch(FormspreeEndpoint, {
                method: 'POST',
                body: FormPayload,
                headers: {
                    Accept: 'application/json'
                }
            });

            const Result = await Response.json().catch(() => null);

            if (!Response.ok) {
                const ErrorMessage = Result?.error || Result?.errors?.[0]?.message;
                throw new Error(ErrorMessage || 'Request failed');
            }

            ContactForm.reset();
            SetFormStatus('Message sent! I will get back to you soon.', 'Success');
        } catch (SubmitError) {
            const StatusMessage = SubmitError instanceof Error && SubmitError.message !== 'Request failed'
                ? SubmitError.message
                : 'Something went wrong. Please email me directly.';
            SetFormStatus(StatusMessage, 'Error');
        } finally {
            SubmitButton?.classList.remove('IsLoading');
            SubmitButton?.removeAttribute('disabled');
        }
    }

    if (ContactForm) {
        ContactForm.addEventListener('submit', HandleFormSubmit);
    }

    InitContactReveal();
})();
