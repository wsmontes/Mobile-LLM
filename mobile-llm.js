class MobileLLM {
    constructor() {
        this.llmInference = null;
        this.isInitialized = false;
        this.isGenerating = false;
        this.settings = {
            temperature: 0.8,
            maxTokens: 1000,
            topK: 40,
            randomSeed: 101
        };
        
        this.initializeElements();
        this.bindEvents();
        this.initializeLLM();
    }

    initializeElements() {
        this.statusElement = document.getElementById('status');
        this.progressFill = document.getElementById('progress-fill');
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        this.settingsModal = document.getElementById('settings-modal');
        this.closeSettingsBtn = document.getElementById('close-settings');
        
        // Model upload elements
        this.uploadBtn = document.getElementById('upload-model-btn');
        this.modelFileInput = document.getElementById('model-file-input');
        this.uploadStatus = document.getElementById('upload-status');
        
        // Settings controls
        this.temperatureInput = document.getElementById('temperature');
        this.maxTokensInput = document.getElementById('max-tokens');
        this.topKInput = document.getElementById('top-k');
        this.temperatureValue = document.getElementById('temperature-value');
        this.maxTokensValue = document.getElementById('max-tokens-value');
        this.topKValue = document.getElementById('top-k-value');
    }

    bindEvents() {
        // Send button
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Enter key in textarea
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Clear chat
        this.clearBtn.addEventListener('click', () => this.clearChat());

        // Settings
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());

        // Settings controls
        this.temperatureInput.addEventListener('input', (e) => {
            this.settings.temperature = parseFloat(e.target.value);
            this.temperatureValue.textContent = e.target.value;
        });

        this.maxTokensInput.addEventListener('input', (e) => {
            this.settings.maxTokens = parseInt(e.target.value);
            this.maxTokensValue.textContent = e.target.value;
        });

        this.topKInput.addEventListener('input', (e) => {
            this.settings.topK = parseInt(e.target.value);
            this.topKValue.textContent = e.target.value;
        });

        // Model upload
        this.uploadBtn.addEventListener('click', () => this.modelFileInput.click());
        this.modelFileInput.addEventListener('change', (e) => this.handleModelUpload(e));

        // Close modal when clicking outside
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });
    }

    async initializeLLM() {
        try {
            this.updateStatus('Loading MediaPipe GenAI...', 10);
            
            // Check for WebGPU support
            if (!navigator.gpu) {
                throw new Error('WebGPU is not supported in this browser. Please use a modern browser with WebGPU support.');
            }

            this.updateStatus('Initializing GenAI tasks...', 30);
            
            // Try to load MediaPipe GenAI dynamically
            let FilesetResolver, LlmInference;
            try {
                const mediapipeModule = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@latest/genai_bundle.mjs');
                FilesetResolver = mediapipeModule.FilesetResolver;
                LlmInference = mediapipeModule.LlmInference;
            } catch (importError) {
                console.warn('MediaPipe GenAI not available, using fallback:', importError);
                // For now, we'll use a mock implementation
                this.updateStatus('MediaPipe GenAI not available. Using demo mode.', 50);
                this.isInitialized = true;
                this.sendBtn.disabled = false;
                this.addMessage('assistant', 'Hello! I\'m in demo mode since MediaPipe GenAI is not available. This is a placeholder for the real LLM functionality.');
                return;
            }

            this.genai = await FilesetResolver.forGenAiTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@0.10.23/wasm"
            );
            this.LlmInference = LlmInference;

            this.updateStatus('Ready to load model. Click "Load Model File" to upload your model.', 100);
            this.isInitialized = true;
            this.sendBtn.disabled = false;
            
            // Add welcome message
            this.addMessage('assistant', 'Hello! I\'m ready to help. Please click "Load Model File" to upload your Gemma model, or start chatting in demo mode.');

        } catch (error) {
            console.error('Error initializing LLM:', error);
            this.updateStatus(`Error: ${error.message}`, 0);
            this.showError(`Failed to initialize LLM: ${error.message}`);
        }
    }

    updateStatus(message, progress = null) {
        this.statusElement.textContent = message;
        if (progress !== null) {
            this.progressFill.style.width = `${progress}%`;
        }
    }

    async handleModelUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.name.endsWith('.bin')) {
            this.updateUploadStatus('Please select a .bin model file.', 'error');
            return;
        }

        // Validate file size (should be around 1.3GB for Gemma 2B)
        const fileSizeGB = file.size / (1024 * 1024 * 1024);
        if (fileSizeGB < 0.5 || fileSizeGB > 3) {
            this.updateUploadStatus(`File size (${fileSizeGB.toFixed(1)}GB) seems unusual for a Gemma model. Expected ~1.3GB.`, 'error');
            return;
        }

        this.updateUploadStatus('Uploading model file...', 'loading');
        this.uploadBtn.disabled = true;

        try {
            // Create object URL for the file
            const modelUrl = URL.createObjectURL(file);
            
            this.updateStatus('Loading model from uploaded file...', 60);
            this.updateUploadStatus('Initializing model...', 'loading');

            // Initialize LLM with uploaded model
            this.llmInference = await this.LlmInference.createFromOptions(this.genai, {
                baseOptions: {
                    modelAssetPath: modelUrl
                },
                maxTokens: this.settings.maxTokens,
                topK: this.settings.topK,
                temperature: this.settings.temperature,
                randomSeed: this.settings.randomSeed
            });

            this.updateStatus('Model loaded successfully! Ready to chat.', 100);
            this.updateUploadStatus(`Model loaded: ${file.name}`, 'success');
            this.uploadBtn.textContent = '✅ Model Loaded';
            this.uploadBtn.disabled = true;

            // Add success message
            this.addMessage('assistant', `Great! I've loaded the ${file.name} model. I'm now ready to help you with questions, writing, analysis, and more. What would you like to know?`);

        } catch (error) {
            console.error('Error loading uploaded model:', error);
            this.updateStatus('Failed to load model.', 0);
            this.updateUploadStatus(`Error loading model: ${error.message}`, 'error');
            this.uploadBtn.disabled = false;
            this.showError(`Failed to load model: ${error.message}`);
        }
    }

    updateUploadStatus(message, type = '') {
        this.uploadStatus.textContent = message;
        this.uploadStatus.className = `upload-status ${type}`;
    }

    async sendMessage() {
        if (!this.isInitialized || this.isGenerating) return;

        const message = this.userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage('user', message);
        this.userInput.value = '';

        // Show typing indicator
        const typingMessage = this.addMessage('assistant', 'Thinking...', 'typing');

        this.isGenerating = true;
        this.sendBtn.classList.add('loading');
        this.sendBtn.disabled = true;

        try {
            // Check if we're in demo mode (no real LLM)
            if (!this.llmInference) {
                // Demo mode - simulate response
                await new Promise(resolve => setTimeout(resolve, 1000));
                typingMessage.remove();
                this.addMessage('assistant', `This is a demo response to: "${message}". Please upload a model file using the "Load Model File" button to get real AI responses.`);
                this.isGenerating = false;
                this.sendBtn.classList.remove('loading');
                this.sendBtn.disabled = false;
                return;
            }

            // Generate response with streaming
            let fullResponse = '';
            await this.llmInference.generateResponse(
                message,
                {
                    maxTokens: this.settings.maxTokens,
                    topK: this.settings.topK,
                    temperature: this.settings.temperature,
                    randomSeed: this.settings.randomSeed
                },
                (partialResult, done) => {
                    if (done) {
                        // Remove typing indicator and add final response
                        typingMessage.remove();
                        this.addMessage('assistant', fullResponse);
                        this.isGenerating = false;
                        this.sendBtn.classList.remove('loading');
                        this.sendBtn.disabled = false;
                    } else {
                        fullResponse += partialResult;
                        typingMessage.textContent = fullResponse;
                    }
                }
            );

        } catch (error) {
            console.error('Error generating response:', error);
            typingMessage.remove();
            this.addMessage('assistant', 'Sorry, I encountered an error while generating a response. Please try again.');
            this.isGenerating = false;
            this.sendBtn.classList.remove('loading');
            this.sendBtn.disabled = false;
        }
    }

    addMessage(sender, content, className = '') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender} ${className}`;
        messageDiv.textContent = content;
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        return messageDiv;
    }

    clearChat() {
        this.chatMessages.innerHTML = '';
        this.addMessage('assistant', 'Chat cleared. How can I help you today?');
    }

    openSettings() {
        this.settingsModal.style.display = 'block';
    }

    closeSettings() {
        this.settingsModal.style.display = 'none';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        this.chatMessages.appendChild(errorDiv);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success';
        successDiv.textContent = message;
        this.chatMessages.appendChild(successDiv);
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MobileLLM();
});

// Service Worker for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 