document.addEventListener('DOMContentLoaded', () => {

    // =========================
    // Set Current Year
    // =========================
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // =========================
    // REGISTRATION TIMER
    // =========================
    const REGISTRATION_CLOSE = new Date("March 20, 2026 23:59:59").getTime();
    const openState = document.getElementById('reg-open-state');
    const closedState = document.getElementById('reg-closed-state');
    const dEl = document.getElementById('timer-days');
    const hEl = document.getElementById('timer-hours');
    const mEl = document.getElementById('timer-mins');
    const sEl = document.getElementById('timer-secs');
    const pad = (n) => String(n).padStart(2, '0');

    function updateTimer() {
        const now = Date.now();
        const distance = REGISTRATION_CLOSE - now;

        if (distance <= 0) {
            if (openState) openState.style.display = 'none';
            if (closedState) closedState.style.display = 'block';
            return;
        }

        if (openState) openState.style.display = 'block';
        if (closedState) closedState.style.display = 'none';

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((distance / (1000 * 60)) % 60);
        const secs = Math.floor((distance / 1000) % 60);

        if (dEl) dEl.textContent = pad(days);
        if (hEl) hEl.textContent = pad(hours);
        if (mEl) mEl.textContent = pad(mins);
        if (sEl) sEl.textContent = pad(secs);
    }

    updateTimer();
    setInterval(updateTimer, 1000);

    // =========================
    // MODALS
    // =========================
    document.addEventListener('click', function(e) {
        // Open WhatsApp
        if (e.target.closest('#whatsappBtn')) {
            const modal = document.getElementById('whatsappModal');
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        }
        // Open Email
        if (e.target.closest('#emailQueryBtn')) {
            const modal = document.getElementById('emailModal');
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        }
        // Close Modal
        if (e.target.closest('.close-modal') || e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        document.body.style.overflow = 'auto';
        resetForms();
    }

    // =========================
    // Forms
    // =========================
    const whatsappForm = document.getElementById('whatsappForm');
    const emailForm = document.getElementById('emailForm');

    if (whatsappForm) whatsappForm.addEventListener('submit', e => {
        e.preventDefault();
        if (validateWhatsAppForm()) redirectToWhatsApp();
    });

    if (emailForm) emailForm.addEventListener('submit', e => {
        e.preventDefault();
        if (validateEmailForm()) sendEmail();
    });

    // =========================
    // Validation
    // =========================
    function validateWhatsAppForm() {
        const email = document.getElementById('wpEmail')?.value.trim() || '';
        const mobile = document.getElementById('wpMobile')?.value.trim() || '';

        if (!email.includes('@kiit.ac.in')) {
            showToast("Use KIIT email ❌");
            return false;
        }

        if (!/^\d{10,15}$/.test(mobile.replace(/\D/g, ''))) {
            showToast("Invalid mobile number ❌");
            return false;
        }

        return true;
    }

    function validateEmailForm() {
        const email = document.getElementById('email')?.value.trim() || '';
        if (!email.includes('@kiit.ac.in')) {
            showToast("Use KIIT email ❌");
            return false;
        }
        return true;
    }

    // =========================
    // WhatsApp Redirect (All Data)
    // =========================
    function redirectToWhatsApp() {
        const fullName   = document.getElementById('wpFullName')?.value.trim() || '';
        const rollNumber = document.getElementById('wpRollNumber')?.value.trim() || '';
        const department = document.getElementById('wpDepartment')?.value || '';
        const section    = document.getElementById('wpSection')?.value.trim() || '';
        const mobile     = document.getElementById('wpMobile')?.value.trim() || '';
        const email      = document.getElementById('wpEmail')?.value.trim() || '';
        const queryMsg   = document.getElementById('wpQueryMessage')?.value.trim() || '';

        const message = `Hello K{devs} Team,

*Student Details:*
- Name: ${fullName}
- Roll Number: ${rollNumber}
- Department: ${department}
- Section: ${section}
- Mobile: ${mobile}
- KIIT Email: ${email}

*Query:*
${queryMsg}`;

        const url = `https://wa.me/917366006363?text=${encodeURIComponent(message)}`;

        closeAllModals();
        showToast("Redirecting to WhatsApp...");
        window.open(url, '_blank');
    }

    // =========================
    // Email Redirect (All Data)
    // =========================
    function sendEmail() {
        const fullName   = document.getElementById('fullName')?.value.trim() || '';
        const rollNumber = document.getElementById('rollNumber')?.value.trim() || '';
        const department = document.getElementById('department')?.value || '';
        const section    = document.getElementById('section')?.value.trim() || '';
        const mobile     = document.getElementById('mobile')?.value.trim() || '';
        const email      = document.getElementById('email')?.value.trim() || '';
        const queryMsg   = document.getElementById('queryMessage')?.value.trim() || '';

        const subject = `K{devs} Query - ${rollNumber}`;
        const body = `Hello K{devs} Team,

Student Details:
- Name: ${fullName}
- Roll Number: ${rollNumber}
- Department: ${department}
- Section: ${section}
- Mobile: ${mobile}
- KIIT Email: ${email}

Query:
${queryMsg}`;

        const mailto = `mailto:2570237@kiit.ac.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        closeAllModals();
        showToast("Opening email client...");
        window.location.href = mailto;
    }

    // =========================
    // Toast
    // =========================
    function showToast(message) {
        const toast = document.getElementById('successToast');
        const text = document.getElementById('toastText');

        if (toast && text) {
            text.textContent = message;
            toast.style.display = 'block';
            setTimeout(() => toast.style.display = 'none', 4000);
        }
    }

    // =========================
    // Reset Forms
    // =========================
    function resetForms() {
        whatsappForm?.reset();
        emailForm?.reset();
    }

});
