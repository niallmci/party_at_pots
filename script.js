// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }));
}

// FAQ Accordion Functionality
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const isActive = answer.classList.contains('active');
        
        // Close all other FAQ items
        document.querySelectorAll('.faq-answer').forEach(item => {
            item.classList.remove('active');
        });
        
        // Toggle current item
        if (!isActive) {
            answer.classList.add('active');
        }
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    }
});

// Add animation on scroll for cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards for animation
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.detail-card, .activity-card, .faq-item');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Set initial body opacity for fade-in effect
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    // Fade in page after load
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// RSVP Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const rsvpForm = document.getElementById('rsvpForm');
    
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', handleRSVPSubmission);
    }
});

function handleRSVPSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('.rsvp-submit');
    
    // Clear any existing error messages first
    clearFieldErrors();
    
    // Get form values
    const whosComing = formData.get('whosComing').trim();
    const contact = formData.get('contact').trim();
    const message = formData.get('message').trim();
    
    // Basic validation
    if (!whosComing) {
        showFieldError('whosComing', 'Required');
        return;
    }
    
    if (!contact) {
        showFieldError('contact', 'Required');
        return;
    }
    
    // Email or phone validation
    if (!isValidContact(contact)) {
        showFieldError('contact', 'Invalid format');
        return;
    }
    
    // Show loading state
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Prepare data for Google Sheets
    const data = {
        whosComing: whosComing,
        contact: contact,
        message: message,
        timestamp: new Date().toISOString()
    };
    
    // Send data to Google Apps Script Web App
    fetch('https://script.google.com/macros/s/AKfycbxK-bhn9IYX2jMKeQ6ZAcgZ4z8iTwOp9a4qSu_3CnHibcQfMuz9w8V7IBduGiqM19g/exec', {
        method: 'POST',
        mode: 'no-cors', // Required for Google Apps Script
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow',
        body: JSON.stringify(data)
    })
    .then(() => {
        // Change button to "RECEIVED" and keep it disabled
        submitButton.textContent = 'RECEIVED';
        submitButton.style.background = '#28a745';
        submitButton.style.borderColor = '#28a745';
        submitButton.style.cursor = 'default';
        
        // Reset form fields after a delay
        setTimeout(() => {
            form.reset();
        }, 1000);
    })
    .catch(error => {
        console.error('Error sending RSVP:', error);
        submitButton.textContent = 'Failed. Try Again';
        submitButton.disabled = false;
        submitButton.style.background = '#dc3545';
        submitButton.style.borderColor = '#dc3545';
        
        // Reset button after a delay
        setTimeout(() => {
            submitButton.textContent = originalText;
            submitButton.style.background = '';
            submitButton.style.borderColor = '';
        }, 3000);
    });
}

function isValidContact(contact) {
    // Simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Simple phone regex (allows various formats)
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    
    return emailRegex.test(contact) || phoneRegex.test(contact);
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.parentNode;
    
    // Create error span
    const errorSpan = document.createElement('span');
    errorSpan.className = 'field-error';
    errorSpan.textContent = message;
    
    // Add error styling to field
    field.style.borderColor = '#dc3545';
    
    // Insert error message after the field
    formGroup.appendChild(errorSpan);
}

function clearFieldErrors() {
    // Remove all existing error messages
    const existingErrors = document.querySelectorAll('.field-error');
    existingErrors.forEach(error => error.remove());
    
    // Reset field border colors
    const fields = document.querySelectorAll('#rsvpForm input, #rsvpForm textarea');
    fields.forEach(field => {
        field.style.borderColor = '#A8C8A8';
    });
} 