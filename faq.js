// FAQ Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const accordionItems = document.querySelectorAll('.accordion-item');
    const emailForm = document.getElementById('emailForm');
    
    // Accordion functionality with smooth animations
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const body = item.querySelector('.accordion-body');
        const icon = item.querySelector('.accordion-icon i');
        
        // Set initial height for animation
        body.style.maxHeight = '0px';
        
        header.addEventListener('click', () => {
            // Toggle current item with animation
            const isActive = item.classList.contains('active');
            
            // Close all other items first
            accordionItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    const otherBody = otherItem.querySelector('.accordion-body');
                    const otherIcon = otherItem.querySelector('.accordion-icon i');
                    
                    otherBody.style.maxHeight = '0px';
                    otherIcon.style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
                body.style.maxHeight = '0px';
                icon.style.transform = 'rotate(0deg)';
            } else {
                item.classList.add('active');
                body.style.maxHeight = body.scrollHeight + 'px';
                icon.style.transform = 'rotate(45deg)';
            }
        });
        
        // Add hover effect
        header.addEventListener('mouseenter', () => {
            if (!item.classList.contains('active')) {
                header.style.backgroundColor = 'rgba(224, 231, 255, 0.3)';
            }
        });
        
        header.addEventListener('mouseleave', () => {
            if (!item.classList.contains('active')) {
                header.style.backgroundColor = '';
            }
        });
    });
    
    // Email form submission with validation and feedback
    if (emailForm) {
        const emailInput = document.getElementById('emailInput');
        
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            
            if (!isValidEmail(email)) {
                showFormError(emailInput, 'Please enter a valid email address');
                return;
            }
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            
            // Simulate API call
            setTimeout(() => {
                // In a real app, you would send this to your backend
                showFormSuccess(`Thank you! We'll respond to ${email} soon.`);
                
                // Reset form
                emailForm.reset();
                
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }, 1500);
        });
        
        // Add input validation
        emailInput.addEventListener('input', function() {
            clearFormError(this);
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
            input.parentNode.appendChild(errorElement);
            
            // Shake animation
            input.style.animation = 'shake 0.5s';
            setTimeout(() => {
                input.style.animation = '';
            }, 500);
        }
        
        // Clear form error
        function clearFormError(input) {
            input.classList.remove('error');
            const errorElement = input.parentNode.querySelector('.form-error');
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
                emailForm.appendChild(successElement);
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
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                successElement.style.opacity = '0';
                successElement.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    successElement.remove();
                }, 500);
            }, 5000);
        }
    }
    
    // Add CSS for new elements
    const style = document.createElement('style');
    style.textContent = `
        .form-error {
            color: #e53e3e;
            font-size: 0.875rem;
            margin-top: 0.5rem;
        }
        
        .form-success {
            color: #38a169;
            background-color: rgba(198, 246, 213, 0.9);
            padding: 0.75rem 1rem;
            border-radius: 0.25rem;
            margin-top: 1rem;
            text-align: center;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        input.error {
            border-color: #e53e3e;
            box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.2);
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
});