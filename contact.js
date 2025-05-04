// Contact Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        // Form validation and submission with enhanced UX
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            const firstName = document.getElementById('firstName');
            const lastName = document.getElementById('lastName');
            const email = document.getElementById('email');
            const message = document.getElementById('message');
            
            let isValid = true;
            
            // Simple validation
            if (!firstName.value.trim()) {
                showFormError(firstName, 'First name is required');
                isValid = false;
            }
            
            if (!lastName.value.trim()) {
                showFormError(lastName, 'Last name is required');
                isValid = false;
            }
            
            if (!email.value.trim()) {
                showFormError(email, 'Email is required');
                isValid = false;
            } else if (!isValidEmail(email.value.trim())) {
                showFormError(email, 'Please enter a valid email address');
                isValid = false;
            }
            
            if (!message.value.trim()) {
                showFormError(message, 'Message is required');
                isValid = false;
            }
            
            if (!isValid) {
                return;
            }
            
            // Get form data
            const formData = {
                firstName: firstName.value,
                lastName: lastName.value,
                email: email.value,
                phone: document.getElementById('phone').value,
                subject: document.querySelector('input[name="subject"]:checked').value,
                message: message.value
            };
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            // Simulate API call
            setTimeout(() => {
                // In a real app, you would send this to your backend
                console.log('Form submitted:', formData);
                
                // Show success message
                showFormSuccess('Thank you for your message! We\'ll get back to you soon.');
                
                // Reset form
                contactForm.reset();
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
                // Scroll to success message
                const successMessage = document.querySelector('.form-success');
                if (successMessage) {
                    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 1500);
        });
        
        // Add input validation
        const formInputs = contactForm.querySelectorAll('input, textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', function() {
                clearFormError(this);
            });
            
            // Add focus effects
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('input-focused');
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.classList.remove('input-focused');
            });
        });
        
        // Email validation function
        function isValidEmail(email) {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
        
        // Show form error
        function showFormError(input, message) {
            clearFormError(input);
            
            const errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            errorElement.textContent = message;
            
            input.classList.add('error');
            input.parentElement.appendChild(errorElement);
            
            // Shake animation
            input.style.animation = 'shake 0.5s';
            setTimeout(() => {
                input.style.animation = '';
            }, 500);
        }
        
        // Clear form error
        function clearFormError(input) {
            input.classList.remove('error');
            const errorElement = input.parentElement.querySelector('.form-error');
            if (errorElement) {
                errorElement.remove();
            }
        }
        
        // Show success message
        function showFormSuccess(message) {
            // Check if success message already exists
            let successElement = document.querySelector('.form-success');
            
            if (!successElement) {
                successElement = document.createElement('div');
                successElement.className = 'form-success';
                contactForm.insertAdjacentElement('beforebegin', successElement);
            }
            
            successElement.textContent = message;
            successElement.style.opacity = '0';
            successElement.style.transform = 'translateY(20px)';
            
            // Trigger reflow
            successElement.offsetHeight;
            
            // Animate in
            successElement.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            successElement.style.opacity = '1';
            successElement.style.transform = 'translateY(0)';
        }
    }
    
    // Add CSS for new elements
    const style = document.createElement('style');
    style.textContent = `
        .form-error {
            color: #e53e3e;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
        
        .form-success {
            color: #38a169;
            background-color: rgba(198, 246, 213, 0.9);
            padding: 1rem;
            border-radius: 0.25rem;
            margin-bottom: 1.5rem;
            text-align: center;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        input.error, textarea.error {
            border-color: #e53e3e;
        }
        
        .input-focused label {
            color: var(--primary-color);
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
    
    // Add hover effects to contact info items
    const infoItems = document.querySelectorAll('.info-item');
    if (infoItems) {
        infoItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateX(5px)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateX(0)';
            });
        });
    }
});