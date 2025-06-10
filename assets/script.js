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

// FAQ Accordion Functionality - DISABLED: All answers now visible by default
/*
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
*/

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

// RSVP Form Handling - BULLETPROOF VERSION
document.addEventListener('DOMContentLoaded', function() {
    const rsvpForm = document.getElementById('rsvpForm');
    
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', handleRSVPSubmission);
        
        // Log test mode status
        if (RSVP_CONFIG.testMode.enabled) {
            console.log('🧪 TEST MODE ENABLED');
            console.log('📋 Test Configuration:', RSVP_CONFIG.testMode);
            showNotification('🧪 TEST MODE: Simulating failures for testing backup systems', 'info');
        } else {
            console.log('✅ RSVP system initialized with bulletproof backup configuration');
        }
        
        // Check for any failed submissions on page load
        checkAndRetryFailedSubmissions();
    }
});

// Configuration for fallback services
const RSVP_CONFIG = {
    // Set to true to test backup systems
    testMode: {
        enabled: false, // Disabled - normal operation
        simulateGoogleSheetsFailure: false, // Normal operation
        simulateFormspreeFailure: false, // Normal operation
        simulateCompleteFailure: false // Normal operation
    },
    primary: {
        name: 'Google Sheets',
        url: 'https://script.google.com/macros/s/AKfycbxK-bhn9IYX2jMKeQ6ZAcgZ4z8iTwOp9a4qSu_3CnHibcQfMuz9w8V7IBduGiqM19g/exec', // Restored for auto-retry testing
        timeout: 10000
    },
    fallbacks: [
        {
            name: 'Formspree',
            url: 'https://formspree.io/f/meokabpj', // Restored for auto-retry testing
            timeout: 8000
        },
        {
            name: 'Netlify Forms',
            url: 'https://your-netlify-site.netlify.app/', // Replace with your Netlify endpoint
            timeout: 8000
        }
    ],
    maxRetries: 3,
    retryDelay: 2000
};

async function handleRSVPSubmission(e) {
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
    
    // Basic validation - only whosComing is required now
    if (!whosComing) {
        showFieldError('whosComing', 'Required');
        return;
    }
    
    // Create submission data
    const submissionData = {
        whosComing: whosComing,
        contact: contact,
        message: message,
        timestamp: new Date().toISOString(),
        id: generateSubmissionId()
    };
    
    // Save to local storage immediately as backup
    saveToLocalStorage(submissionData);
    
    // Show loading state
    setButtonState(submitButton, 'loading');
    
    try {
        // Attempt to submit through primary and fallback services
        const success = await submitWithFallbacks(submissionData);
        
        if (success) {
            setButtonState(submitButton, 'success');
            removeFromLocalStorage(submissionData.id);
            
            // Show celebration popup instead of just notification
            showCelebrationPopup();
            
            // Reset form after delay
            setTimeout(() => {
                form.reset();
                setButtonState(submitButton, 'default');
            }, 3000);
            
            // Show success notification (but shorter since we have popup)
            showNotification('RSVP submitted successfully! 🎉', 'success');
            
        } else {
            throw new Error('All submission methods failed');
        }
        
    } catch (error) {
        console.error('RSVP submission failed:', error);
        setButtonState(submitButton, 'error');
        
        // Show detailed error message to user
        showNotification(
            'Unable to submit RSVP right now. Don\'t worry - your response has been saved locally and we\'ll try sending it again automatically. ' +
            'You can also try refreshing the page or contact us directly at [your-email@domain.com].', 
            'error'
        );
        
        // Reset button after delay
        setTimeout(() => {
            setButtonState(submitButton, 'default');
        }, 5000);
    }
}

async function submitWithFallbacks(data) {
    // Try primary service first
    try {
        const success = await submitToService(RSVP_CONFIG.primary, data);
        if (success) {
            console.log('✅ Primary service (Google Sheets) succeeded');
            return true;
        }
    } catch (error) {
        console.warn('⚠️ Primary service failed:', error.message);
    }
    
    // Try fallback services
    for (const fallback of RSVP_CONFIG.fallbacks) {
        try {
            const success = await submitToService(fallback, data);
            if (success) {
                console.log(`✅ Fallback service (${fallback.name}) succeeded`);
                
                // Notify about fallback usage
                showNotification(
                    `RSVP submitted via backup system (${fallback.name}). Your response is confirmed!`, 
                    'warning'
                );
                return true;
            }
        } catch (error) {
            console.warn(`⚠️ Fallback service ${fallback.name} failed:`, error.message);
        }
    }
    
    return false;
}

async function submitToService(service, data, retryCount = 0) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), service.timeout);
    
    if (RSVP_CONFIG.testMode.enabled) {
        console.log(`🚀 Attempting to submit to ${service.name}...`);
    }
    
    try {
        // Test mode simulations
        if (RSVP_CONFIG.testMode.enabled) {
            console.log(`🧪 Test mode enabled - checking for simulations...`);
            
            if (RSVP_CONFIG.testMode.simulateCompleteFailure) {
                console.log(`💥 SIMULATING: Complete failure`);
                throw new Error('Test mode: Simulating complete failure');
            }
            if (service.name === 'Google Sheets' && RSVP_CONFIG.testMode.simulateGoogleSheetsFailure) {
                console.log(`💥 SIMULATING: Google Sheets failure`);
                throw new Error('Test mode: Simulating Google Sheets failure');
            }
            if (service.name === 'Formspree' && RSVP_CONFIG.testMode.simulateFormspreeFailure) {
                console.log(`💥 SIMULATING: Formspree failure`);
                throw new Error('Test mode: Simulating Formspree failure');
            }
            console.log(`✅ No simulation configured for ${service.name}, proceeding normally...`);
        }
        
        if (RSVP_CONFIG.testMode.enabled) {
            console.log(`📡 Making actual request to ${service.url}...`);
        }
        
        const response = await fetch(service.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            signal: controller.signal,
            mode: service.name === 'Google Sheets' ? 'no-cors' : 'cors'
        });
        
        clearTimeout(timeoutId);
        
        // For Google Sheets (no-cors), we assume success if no error is thrown
        if (service.name === 'Google Sheets') {
            return true;
        }
        
        // For other services, check response status
        if (response.ok) {
            return true;
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
    } catch (error) {
        clearTimeout(timeoutId);
        
        // Retry logic
        if (retryCount < RSVP_CONFIG.maxRetries && !error.name === 'AbortError') {
            console.log(`Retrying ${service.name} (attempt ${retryCount + 1}/${RSVP_CONFIG.maxRetries})`);
            await delay(RSVP_CONFIG.retryDelay * (retryCount + 1)); // Exponential backoff
            return submitToService(service, data, retryCount + 1);
        }
        
        throw error;
    }
}

// Local Storage Management
function saveToLocalStorage(data) {
    try {
        const existing = JSON.parse(localStorage.getItem('pendingRSVPs') || '[]');
        existing.push(data);
        localStorage.setItem('pendingRSVPs', JSON.stringify(existing));
        console.log('💾 RSVP saved to local storage as backup');
    } catch (error) {
        console.error('Failed to save to local storage:', error);
    }
}

function removeFromLocalStorage(id) {
    try {
        const existing = JSON.parse(localStorage.getItem('pendingRSVPs') || '[]');
        const filtered = existing.filter(item => item.id !== id);
        localStorage.setItem('pendingRSVPs', JSON.stringify(filtered));
    } catch (error) {
        console.error('Failed to remove from local storage:', error);
    }
}

function checkAndRetryFailedSubmissions() {
    try {
        const pending = JSON.parse(localStorage.getItem('pendingRSVPs') || '[]');
        
        if (pending.length > 0) {
            console.log(`📤 Found ${pending.length} pending RSVP(s), attempting to resend...`);
            
            // Show notification about retry attempt
            showNotification(
                `Found ${pending.length} unsent RSVP(s) from previous session. Attempting to send now...`, 
                'info'
            );
            
            // Try to send each pending submission
            pending.forEach(async (data, index) => {
                try {
                    const success = await submitWithFallbacks(data);
                    if (success) {
                        removeFromLocalStorage(data.id);
                        showNotification(`✅ Successfully sent delayed RSVP for "${data.whosComing}"`, 'success');
                    }
                } catch (error) {
                    console.error(`Failed to resend RSVP ${index + 1}:`, error);
                }
            });
        }
    } catch (error) {
        console.error('Error checking failed submissions:', error);
    }
}

// Button State Management
function setButtonState(button, state) {
    const states = {
        default: {
            text: 'Send Request to Party',
            background: '#6B8E6B',
            cursor: 'pointer',
            disabled: false
        },
        loading: {
            text: 'Sending Request...',
            background: '#ffa500',
            cursor: 'wait',
            disabled: true
        },
        success: {
            text: 'Request Accepted: Lets Party! 🎉',
            background: '#28a745',
            cursor: 'default',
            disabled: true
        },
        error: {
            text: 'Temporary Issue - Saved Locally ⚠️',
            background: '#dc3545',
            cursor: 'pointer',
            disabled: false
        }
    };
    
    const config = states[state];
    button.textContent = config.text;
    button.style.background = config.background;
    button.style.borderColor = config.background;
    button.style.cursor = config.cursor;
    button.disabled = config.disabled;
    button.style.transition = 'all 0.3s ease';
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.rsvp-notification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `rsvp-notification rsvp-notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto-remove after delay (except for errors)
    if (type !== 'error') {
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, type === 'success' ? 6000 : 8000);
    }
}

// Utility Functions
function generateSubmissionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Network Status Monitoring
window.addEventListener('online', () => {
    showNotification('Internet connection restored. Checking for unsent RSVPs...', 'success');
    checkAndRetryFailedSubmissions();
});

window.addEventListener('offline', () => {
    showNotification('Internet connection lost. RSVPs will be saved locally and sent when connection is restored.', 'warning');
});

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
    
    // Remove error styling from form fields
    const formFields = document.querySelectorAll('.form-group input, .form-group textarea');
    formFields.forEach(field => {
        field.style.borderColor = '#A8C8A8';
    });
}

// Lightbox functionality for map zoom
document.addEventListener('DOMContentLoaded', function() {
    const mapImage = document.getElementById('clareMap');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxClose = document.querySelector('.lightbox-close');
    
    if (mapImage && lightbox && lightboxImage) {
        // Open lightbox when map is clicked
        mapImage.addEventListener('click', function() {
            lightboxImage.src = this.src;
            lightboxImage.alt = this.alt;
            lightbox.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        });
        
        // Close lightbox when X is clicked
        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }
        
        // Close lightbox when clicking outside the image
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Close lightbox with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && lightbox.style.display === 'block') {
                closeLightbox();
            }
        });
        
        function closeLightbox() {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
    }
});

// Celebration Popup Functions
function showCelebrationPopup() {
    const modal = document.getElementById('celebrationModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Auto-close after 8 seconds
        setTimeout(() => {
            closeCelebrationModal();
        }, 8000);
        
        // Close on click outside modal
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeCelebrationModal();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeCelebrationModal();
            }
        });
    }
}

function closeCelebrationModal() {
    const modal = document.getElementById('celebrationModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
} 