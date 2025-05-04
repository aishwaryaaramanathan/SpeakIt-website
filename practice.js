// Practice Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');
    const wordGrid = document.getElementById('wordGrid');
    
    // Word data with reference videos from the reference_videos folder
    const words = [
        {
            id: 1,
            word: "Hello",
            image: "hello.jpg", // Using the provided image
            videoPath: "reference_videos/hello.mp4"
        },
        {
            id: 2,
            word: "Water",
            image: "water.jpg", // Using the provided image
            videoPath: "reference_videos/water.mp4"
        },
        {
            id: 3,
            word: "Thank You",
            image: "https://images.unsplash.com/photo-1521566652839-697aa473761a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
            videoPath: "reference_videos/thankyou.mp4"
        },
        {
            id: 4,
            word: "Please",
            image: "please.jpg",
            videoPath: "reference_videos/please.mp4",
        }
    ];
    
    // Display words with animation
    function displayWords(wordsToDisplay) {
        // Clear the grid first
        wordGrid.innerHTML = '';
        
        if (wordsToDisplay.length === 0) {
            wordGrid.innerHTML = '<p class="error-message">No words found matching your search. Try a different term.</p>';
            return;
        }
        
        // Add loading animation
        const loadingContainer = document.createElement('div');
        loadingContainer.className = 'loading-container';
        loadingContainer.innerHTML = `
            <div class="loading">
                <div></div><div></div><div></div><div></div>
            </div>
        `;
        wordGrid.appendChild(loadingContainer);
        
        // Simulate loading delay for better UX
        setTimeout(() => {
            wordGrid.innerHTML = '';
            
            wordsToDisplay.forEach((word, index) => {
                const wordCard = document.createElement('div');
                wordCard.className = 'word-card';
                wordCard.style.animationDelay = `${index * 0.1}s`;
                
                wordCard.innerHTML = `
                    <div class="word-image" data-video="${word.videoPath}" data-word="${word.word}">
                        <img src="${word.image}" alt="${word.word}">
                    </div>
                    <h3 class="word-title">Word: "${word.word}"</h3>
                    <a href="practice-detail.html?id=${word.id}" class="btn btn-primary">Start Practice</a>
                `;
                
                wordGrid.appendChild(wordCard);
                
                // Add click event to play reference video in a modal
                const wordImage = wordCard.querySelector('.word-image');
                wordImage.addEventListener('click', function() {
                    const videoPath = this.getAttribute('data-video');
                    const wordName = this.getAttribute('data-word');
                    showVideoModal(videoPath, wordName);
                });
            });
        }, 800);
    }
    
    // Create and show video modal
    function showVideoModal(videoPath, wordName) {
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'video-modal';
        
        // Create modal content
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Reference Video: "${wordName}"</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <video controls autoplay>
                        <source src="${videoPath}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        `;
        
        // Add modal to body
        document.body.appendChild(modal);
        
        // Prevent body scrolling
        document.body.style.overflow = 'hidden';
        
        // Add close functionality
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', function() {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        });
        
        // Close modal when clicking outside content
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.body.style.overflow = '';
            }
        });
    }
    
    // Search functionality with improved UX
    if (searchInput && clearSearch) {
        // Initial state of clear button
        clearSearch.style.display = 'none';
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase().trim();
            
            if (searchTerm) {
                clearSearch.style.display = 'block';
                clearSearch.classList.add('visible');
                
                const filteredWords = words.filter(word => 
                    word.word.toLowerCase().includes(searchTerm)
                );
                
                displayWords(filteredWords);
            } else {
                clearSearch.style.display = 'none';
                clearSearch.classList.remove('visible');
                displayWords(words);
            }
        });
        
        clearSearch.addEventListener('click', function() {
            searchInput.value = '';
            clearSearch.style.display = 'none';
            clearSearch.classList.remove('visible');
            displayWords(words);
            
            // Focus back on search input
            searchInput.focus();
        });
        
        // Add focus effects
        searchInput.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        searchInput.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    }
    
    // Add CSS for video modal
    const style = document.createElement('style');
    style.textContent = `
        .video-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .modal-content {
            background-color: white;
            border-radius: 1rem;
            width: 80%;
            max-width: 800px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            animation: modalFadeIn 0.3s ease;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            background-color: #4169e1;
            color: white;
        }
        
        .modal-header h3 {
            margin: 0;
            font-size: 1.5rem;
        }
        
        .close-modal {
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            transition: transform 0.3s ease;
        }
        
        .close-modal:hover {
            transform: scale(1.2);
        }
        
        .modal-body {
            padding: 0;
        }
        
        .modal-body video {
            width: 100%;
            display: block;
        }
        
        @keyframes modalFadeIn {
            from {
                opacity: 0;
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    // Initial display with animation
    displayWords(words);
});