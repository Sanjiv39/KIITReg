// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        menuToggle.innerHTML = navLinks.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });
    
    // Registration button - Google Form redirect with warning
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            // Show warning alert
            const userConfirmed = confirm(
                "⚠️ IMPORTANT: Please register ONLY using your KIIT Email ID.\n\n" +
                "Ensure all information is correct. Incorrect details may lead to rejection.\n\n" +
                "Click OK to proceed to the registration form."
            );
            
            if (userConfirmed) {
                // Redirect to Google Form in new tab
                window.open('https://forms.gle/snu1guAPRXVSWnGr6', '_blank');
                
                // Show a follow-up message
                setTimeout(() => {
                    alert("Registration form opened in new tab. Remember to use your KIIT email address!");
                }, 500);
            }
        });
    }
    
    // WhatsApp Modal
    const whatsappModal = document.getElementById('whatsappModal');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const whatsappForm = document.getElementById('whatsappForm');
    
    // Open WhatsApp modal
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function() {
            whatsappModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Email Modal
    const emailModal = document.getElementById('emailModal');
    const emailQueryBtn = document.getElementById('emailQueryBtn');
    const emailForm = document.getElementById('emailForm');
    
    // Open Email modal
    if (emailQueryBtn) {
        emailQueryBtn.addEventListener('click', function() {
            emailModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
            document.body.style.overflow = 'auto';
            resetForms();
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
            document.body.style.overflow = 'auto';
            resetForms();
        }
    });
    
    // WhatsApp Form validation and submission
    if (whatsappForm) {
        whatsappForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateWhatsAppForm()) {
                redirectToWhatsApp();
            }
        });
    }
    
    // Email Form validation and submission
    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateEmailForm()) {
                sendEmail();
            }
        });
    }
    
    // Real-time validation for KIIT email in WhatsApp form
    const wpEmailInput = document.getElementById('wpEmail');
    if (wpEmailInput) {
        wpEmailInput.addEventListener('blur', validateWhatsAppKIITEmail);
    }
    
    // Real-time validation for KIIT email in Email form
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', validateEmailKIITEmail);
    }
    
    // Function to validate KIIT email in WhatsApp form
    function validateWhatsAppKIITEmail() {
        const email = wpEmailInput.value.trim();
        const emailError = document.getElementById('wpEmailError');
        
        if (!email) {
            emailError.textContent = 'KIIT Email ID is required';
            return false;
        }
        
        if (!email.includes('@kiit.ac.in')) {
            emailError.textContent = 'Please use your KIIT email ID (@kiit.ac.in)';
            return false;
        }
        
        emailError.textContent = '';
        return true;
    }
    
    // Function to validate KIIT email in Email form
    function validateEmailKIITEmail() {
        const email = emailInput.value.trim();
        const emailError = document.getElementById('emailError');
        
        if (!email) {
            emailError.textContent = 'KIIT Email ID is required';
            return false;
        }
        
        if (!email.includes('@kiit.ac.in')) {
            emailError.textContent = 'Please use your KIIT email ID (@kiit.ac.in)';
            return false;
        }
        
        emailError.textContent = '';
        return true;
    }
    
    // Function to validate WhatsApp form
    function validateWhatsAppForm() {
        let isValid = true;
        
        // Clear all error messages
        whatsappForm.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        
        // Validate each required field
        const requiredFields = whatsappForm.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                const errorMsg = field.parentElement.querySelector('.error-message');
                if (errorMsg) {
                    const fieldName = field.previousElementSibling?.textContent || 'This field';
                    errorMsg.textContent = `${fieldName.replace(' *', '')} is required`;
                }
            }
        });
        
        // Special validation for KIIT email
        if (!validateWhatsAppKIITEmail()) {
            isValid = false;
        }
        
        // Validate WhatsApp number format
        const wpMobile = document.getElementById('wpMobile').value.trim();
        if (wpMobile && !/^\d{10,15}$/.test(wpMobile.replace(/\D/g, ''))) {
            isValid = false;
            const errorMsg = document.getElementById('wpMobile').parentElement.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.textContent = 'Please enter a valid WhatsApp number (10-15 digits)';
            }
        }
        
        return isValid;
    }
    
    // Function to validate Email form
    function validateEmailForm() {
        let isValid = true;
        
        // Clear all error messages
        emailForm.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        
        // Validate each required field
        const requiredFields = emailForm.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                const errorMsg = field.parentElement.querySelector('.error-message');
                if (errorMsg) {
                    const fieldName = field.previousElementSibling?.textContent || 'This field';
                    errorMsg.textContent = `${fieldName.replace(' *', '')} is required`;
                }
            }
        });
        
        // Special validation for KIIT email
        if (!validateEmailKIITEmail()) {
            isValid = false;
        }
        
        return isValid;
    }
    
    // Function to redirect to WhatsApp with pre-filled message
    function redirectToWhatsApp() {
        // Get form values
        const fullName = document.getElementById('wpFullName').value.trim();
        const rollNumber = document.getElementById('wpRollNumber').value.trim();
        const department = document.getElementById('wpDepartment').value;
        const section = document.getElementById('wpSection').value.trim();
        const mobile = document.getElementById('wpMobile').value.trim();
        const email = document.getElementById('wpEmail').value.trim();
        const queryMessage = document.getElementById('wpQueryMessage').value.trim();
        
        // Clean mobile number (remove non-digits)
        const cleanMobile = mobile.replace(/\D/g, '');
        
        // Construct WhatsApp message
        const whatsappMessage = `Hello KIIT Coding Club Team,

I have a query regarding Coding Club registration:

*Student Details:*
- Name: ${fullName}
- Roll Number: ${rollNumber}
- Department: ${department}
- Section: ${section}
- Mobile: ${mobile}
- KIIT Email: ${email}

*My Query:*
${queryMessage}

Please let me know how to proceed.

Thank you!`;
        
        // Encode message for URL
        const encodedMessage = encodeURIComponent(whatsappMessage);
        
        // Create WhatsApp URL
        const whatsappUrl = `https://wa.me/917366006363?text=${encodedMessage}`;
        
        // Close modal
        whatsappModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Show success toast
        showSuccessToast("Redirecting to WhatsApp... Please wait.");
        
        // Redirect to WhatsApp after a short delay
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
            
            // Show confirmation message
            setTimeout(() => {
                showSuccessToast("WhatsApp opened in new tab. Please send the message to complete your query.");
            }, 1000);
        }, 1500);
        
        // Reset form
        resetForms();
    }
    
    // Function to send email via mailto
    function sendEmail() {
        // Get form values
        const fullName = document.getElementById('fullName').value.trim();
        const rollNumber = document.getElementById('rollNumber').value.trim();
        const department = document.getElementById('department').value;
        const section = document.getElementById('section').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        const email = document.getElementById('email').value.trim();
        const queryMessage = document.getElementById('queryMessage').value.trim();
        
        // Construct email body
        const subject = `Coding Club Query - ${rollNumber}`;
        const body = `
Name: ${fullName}
Roll Number: ${rollNumber}
Department: ${department}
Section: ${section}
Mobile Number: ${mobile}
KIIT Email: ${email}

Query Message:
${queryMessage}

---
This query was submitted via the KIIT Coding Club website.
        `.trim();
        
        // Create mailto link
        const mailtoLink = `mailto:2570237@kiit.ac.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Close modal
        emailModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Show success toast
        showSuccessToast("Opening email client... Please wait.");
        
        // Open user's default email client after a delay
        setTimeout(() => {
            window.location.href = mailtoLink;
            
            // Show confirmation message
            setTimeout(() => {
                showSuccessToast("Email client opened. Please send the email to complete your query.");
                
                // Scroll to home section
                document.querySelector('#home').scrollIntoView({ behavior: 'smooth' });
            }, 1000);
        }, 1500);
        
        // Reset form
        resetForms();
    }
    
    // Function to show success toast
    function showSuccessToast(message) {
        const toast = document.getElementById('successToast');
        const toastText = document.getElementById('toastText');
        
        toastText.textContent = message;
        toast.style.display = 'block';
        
        // Hide toast after 5 seconds
        setTimeout(() => {
            toast.style.display = 'none';
        }, 5000);
    }
    
    // Function to reset all forms
    function resetForms() {
        if (whatsappForm) whatsappForm.reset();
        if (emailForm) emailForm.reset();
        
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Update active nav link
                document.querySelectorAll('.nav-links a').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
                
                // Scroll to target
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add scroll effect to header
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
            header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.05)';
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        }
        
        // Update active nav link based on scroll position
        updateActiveNavLink();
    });
    
    // Function to update active nav link based on scroll position
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-links a');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Initial call to set active nav link
    updateActiveNavLink();
    
    // Add animation to cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.about-card, .contact-option, .action-card').forEach(el => {
        observer.observe(el);
    });
});