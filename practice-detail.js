// Practice Detail Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const startRecordingBtn = document.getElementById('startRecording');
    const stopRecordingBtn = document.getElementById('stopRecording');
    const userVideo = document.getElementById('userVideo');
    const referenceVideo = document.getElementById('referenceVideo');
    const feedbackContainer = document.getElementById('feedbackContainer');
    const feedbackText = document.getElementById('feedbackText');
    const wordTitle = document.getElementById('wordTitle');
    
    // Get word ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const wordId = urlParams.get('id');
    
    // Word data with reference videos from the reference_videos folder
    const words = {
        "1": {
            id: 1,
            word: "Hello",
            videoPath: "reference_videos/hello.mp4"
        },
        "2": {
            id: 2,
            word: "Water",
            videoPath: "reference_videos/water.mp4"
        },
        "3": {
            id: 3,
            word: "Thank You",
            videoPath: "reference_videos/thankyou.mp4"
        },
        "4": {
            id: 4,
            word: "Please",
            videoPath: "reference_videos/please.mp4"
        }
    };
    
    // Variables for recording
    let mediaRecorder;
    let recordedChunks = [];
    let stream;
    let isRecording = false;
    let recordedBlob;
    
    // Load word data and set up reference video
    function loadWordData() {
        // Show loading state
        wordTitle.innerHTML = `<span class="loading-text">Loading...</span>`;
        
        setTimeout(() => {
            if (wordId && words[wordId]) {
                const word = words[wordId];
                wordTitle.textContent = `Practice: "${word.word}"`;
                
                // Set the reference video source
                referenceVideo.innerHTML = `
                    <source src="${word.videoPath}" type="video/mp4">
                    Your browser does not support the video tag.
                `;
                
                // Load the reference video
                referenceVideo.load();
                
                // Add click event to play reference video
                referenceVideo.addEventListener('click', function() {
                    if (this.paused) {
                        this.play();
                    } else {
                        this.pause();
                    }
                });
                
                // Auto-play reference video when loaded
                referenceVideo.addEventListener('loadedmetadata', function() {
                    // Play the reference video automatically
                    this.play().catch(e => {
                        console.log('Auto-play prevented. Click to play the video.');
                    });
                });
            } else {
                wordTitle.textContent = "Word not found";
                feedbackContainer.classList.remove('hidden');
                feedbackText.innerHTML = `
                    <i class="fas fa-exclamation-circle"></i>
                    The requested word could not be found. Please return to the <a href="practice.html">practice page</a>.
                `;
            }
        }, 800);
    }
    
    // Start recording with visual feedback
    async function startRecording() {
        try {
            // Update button state
            startRecordingBtn.disabled = true;
            startRecordingBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Starting...';
            
            // Request user media
            stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            });
            
            // Set user video source
            userVideo.srcObject = stream;
            
            // Wait for video to be ready
            await new Promise(resolve => {
                userVideo.onloadedmetadata = resolve;
            });
            
            // Start playback
            await userVideo.play();
            
            // Create media recorder
            mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9,opus'
            });
            
            recordedChunks = [];
            
            // Handle data available event
            mediaRecorder.ondataavailable = function(event) {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };
            
            // Handle stop event
            mediaRecorder.onstop = function() {
                // Create blob from recorded chunks
                recordedBlob = new Blob(recordedChunks, {
                    type: 'video/webm'
                });
                
                // Create object URL for playback
                const videoURL = URL.createObjectURL(recordedBlob);
                
                // Set user video source to recorded video
                userVideo.srcObject = null;
                userVideo.src = videoURL;
                userVideo.controls = true;
                userVideo.play();
                
                // Show feedback
                showFeedback("Processing your recording...");
                
                // Add a pulsing effect to the feedback container
                feedbackContainer.classList.add('processing');
                
                // Compare with reference video (simulated)
                setTimeout(() => {
                    feedbackContainer.classList.remove('processing');
                    
                    // Get reference word
                    const word = words[wordId].word;
                    
                    // Simulate analysis results
                    const accuracy = Math.floor(Math.random() * 30) + 65; // Random accuracy between 65-95%
                    let feedback = '';
                    
                    if (accuracy >= 90) {
                        feedback = `
                            <div class="feedback-result">
                                <i class="fas fa-check-circle"></i>
                                <p>Excellent pronunciation of "${word}"! Your mouth shape and sound are very accurate.</p>
                                <div class="accuracy-meter">
                                    <div class="accuracy-label">Accuracy: ${accuracy}%</div>
                                    <div class="accuracy-bar">
                                        <div class="accuracy-fill" style="width: ${accuracy}%"></div>
                                    </div>
                                </div>
                            </div>
                        `;
                    } else if (accuracy >= 75) {
                        feedback = `
                            <div class="feedback-result">
                                <i class="fas fa-check-circle"></i>
                                <p>Good attempt at "${word}"! Try to open your mouth wider for this sound.</p>
                                <div class="accuracy-meter">
                                    <div class="accuracy-label">Accuracy: ${accuracy}%</div>
                                    <div class="accuracy-bar">
                                        <div class="accuracy-fill" style="width: ${accuracy}%"></div>
                                    </div>
                                </div>
                            </div>
                        `;
                    } else {
                        feedback = `
                            <div class="feedback-result">
                                <i class="fas fa-info-circle"></i>
                                <p>Keep practicing "${word}". Watch the reference video closely and try to match the mouth movements.</p>
                                <div class="accuracy-meter">
                                    <div class="accuracy-label">Accuracy: ${accuracy}%</div>
                                    <div class="accuracy-bar">
                                        <div class="accuracy-fill" style="width: ${accuracy}%"></div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                    
                    showFeedback(feedback);
                }, 2000);
            };
            
            // Start recording
            mediaRecorder.start();
            isRecording = true;
            
            // Update button states
            startRecordingBtn.disabled = true;
            startRecordingBtn.innerHTML = 'Recording in progress';
            stopRecordingBtn.disabled = false;
            
            // Add recording indicator
            const recordingIndicator = document.createElement('div');
            recordingIndicator.className = 'recording-indicator';
            recordingIndicator.innerHTML = '<span></span> Recording';
            document.querySelector('.video-box:nth-child(2)').appendChild(recordingIndicator);
            
        } catch (error) {
            console.error("Error accessing media devices:", error);
            startRecordingBtn.disabled = false;
            startRecordingBtn.innerHTML = 'Start Recording';
            
            let errorMessage = "Error: Could not access camera or microphone. Please check permissions.";
            
            if (error.name === 'NotAllowedError') {
                errorMessage = "Permission denied. Please allow access to your camera and microphone.";
            } else if (error.name === 'NotFoundError') {
                errorMessage = "No camera or microphone found. Please connect a device and try again.";
            }
            
            showFeedback(`<i class="fas fa-exclamation-triangle"></i> ${errorMessage}`);
        }
    }
    
    // Stop recording with visual feedback
    function stopRecording() {
        if (mediaRecorder && isRecording) {
            // Update button state
            stopRecordingBtn.disabled = true;
            stopRecordingBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Stopping...';
            
            mediaRecorder.stop();
            isRecording = false;
            
            // Remove recording indicator
            const recordingIndicator = document.querySelector('.recording-indicator');
            if (recordingIndicator) {
                recordingIndicator.remove();
            }
            
            // Stop all tracks
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            
            // Reset buttons after a short delay
            setTimeout(() => {
                startRecordingBtn.disabled = false;
                startRecordingBtn.innerHTML = 'Start New Recording';
                stopRecordingBtn.disabled = true;
                stopRecordingBtn.innerHTML = 'Stop Recording';
            }, 500);
        }
    }
    
    // Show feedback with animation
    function showFeedback(message) {
        feedbackText.innerHTML = message;
        
        if (feedbackContainer.classList.contains('hidden')) {
            feedbackContainer.classList.remove('hidden');
            feedbackContainer.style.opacity = '0';
            feedbackContainer.style.transform = 'translateY(20px)';
            
            // Trigger reflow
            feedbackContainer.offsetHeight;
            
            // Animate in
            feedbackContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            feedbackContainer.style.opacity = '1';
            feedbackContainer.style.transform = 'translateY(0)';
        }
    }
    
    // Event listeners with visual feedback
    if (startRecordingBtn && stopRecordingBtn) {
        // Add hover effects
        startRecordingBtn.addEventListener('mouseenter', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
            }
        });
        
        startRecordingBtn.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
        
        stopRecordingBtn.addEventListener('mouseenter', function() {
            if (!this.disabled) {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
            }
        });
        
        stopRecordingBtn.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
        
        // Click events
        startRecordingBtn.addEventListener('click', startRecording);
        stopRecordingBtn.addEventListener('click', stopRecording);
    }
    
    // Load word data on page load
    loadWordData();
});