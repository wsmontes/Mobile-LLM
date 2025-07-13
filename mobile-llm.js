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
        
        // Validate that all required elements exist
        const requiredElements = [
            'status', 'progress-fill', 'chat-messages', 'user-input', 
            'send-btn', 'clear-btn', 'settings-btn', 'settings-modal', 
            'close-settings', 'upload-model-btn', 'model-file-input', 
            'upload-status', 'temperature', 'max-tokens', 'top-k',
            'temperature-value', 'max-tokens-value', 'top-k-value'
        ];
        
        for (const id of requiredElements) {
            if (!document.getElementById(id)) {
                console.error(`Required element with id '${id}' not found`);
            }
        }
    }

    bindEvents() {
        // Send button
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        // Enter key in textarea
        if (this.userInput) {
            this.userInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Clear chat
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => this.clearChat());
        }

        // Settings
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => this.openSettings());
        }
        if (this.closeSettingsBtn) {
            this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        }

        // Settings controls
        if (this.temperatureInput && this.temperatureValue) {
            this.temperatureInput.addEventListener('input', (e) => {
                this.settings.temperature = parseFloat(e.target.value);
                this.temperatureValue.textContent = e.target.value;
            });
        }

        if (this.maxTokensInput && this.maxTokensValue) {
            this.maxTokensInput.addEventListener('input', (e) => {
                this.settings.maxTokens = parseInt(e.target.value);
                this.maxTokensValue.textContent = e.target.value;
            });
        }

        if (this.topKInput && this.topKValue) {
            this.topKInput.addEventListener('input', (e) => {
                this.settings.topK = parseInt(e.target.value);
                this.topKValue.textContent = e.target.value;
            });
        }

        // Model upload
        if (this.uploadBtn && this.modelFileInput) {
            this.uploadBtn.addEventListener('click', () => this.modelFileInput.click());
            this.modelFileInput.addEventListener('change', (e) => this.handleModelUpload(e));
        }

        // Close modal when clicking outside
        if (this.settingsModal) {
            this.settingsModal.addEventListener('click', (e) => {
                if (e.target === this.settingsModal) {
                    this.closeSettings();
                }
            });
        }
    }

    async initializeLLM() {
        try {
            this.updateStatus('Checking browser capabilities...', 10);
            
            // Check for WebGPU support with better mobile detection
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const hasWebGPU = !!navigator.gpu;
            
            if (!hasWebGPU) {
                if (isMobile) {
                    this.updateStatus('Mobile browser detected - WebGPU not available', 30);
                    this.addMessage('assistant', `📱 **Mobile Browser Detected**\n\nYour mobile browser doesn't support WebGPU, which is required for running AI models locally. However, you can still:\n\n✅ **Test the interface** - Try the demo mode\n✅ **Upload model files** - Test the upload functionality\n✅ **Explore settings** - Adjust parameters\n\n**For full AI functionality, try:**\n• Chrome 113+ on Android\n• Safari 16.4+ on iOS\n• Desktop browsers with WebGPU support\n\n**Current mode:** Demo mode with simulated responses`);
                } else {
                    this.addMessage('assistant', `🌐 **WebGPU Not Available**\n\nYour browser doesn't support WebGPU, which is required for running AI models locally. Please try:\n\n✅ **Chrome 113+** (recommended)\n✅ **Safari 16.4+**\n✅ **Firefox 113+**\n✅ **Edge 113+**\n\n**Current mode:** Demo mode with simulated responses`);
                }
                
                this.updateStatus('Using demo mode - WebGPU not supported', 50);
                this.isInitialized = true;
                if (this.sendBtn) {
                    this.sendBtn.disabled = false;
                }
                return;
            }

            this.updateStatus('WebGPU detected - Loading MediaPipe GenAI...', 20);
            
            // Try to load MediaPipe GenAI dynamically
            let FilesetResolver, LlmInference;
            try {
                const mediapipeModule = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@latest/genai_bundle.mjs');
                FilesetResolver = mediapipeModule.FilesetResolver;
                LlmInference = mediapipeModule.LlmInference;
            } catch (importError) {
                console.warn('MediaPipe GenAI not available, using fallback:', importError);
                this.updateStatus('MediaPipe GenAI not available. Using demo mode.', 50);
                this.isInitialized = true;
                if (this.sendBtn) {
                    this.sendBtn.disabled = false;
                }
                this.addMessage('assistant', '🔧 **MediaPipe GenAI Not Available**\n\nWhile WebGPU is supported, the MediaPipe GenAI library couldn\'t be loaded. This might be due to:\n\n• Network connectivity issues\n• CDN availability\n• Browser compatibility\n\n**Current mode:** Demo mode with simulated responses\n\nYou can still test the upload functionality and interface!');
                return;
            }

            this.updateStatus('Initializing GenAI tasks...', 60);
            
            try {
                this.genai = await FilesetResolver.forGenAiTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-genai@0.10.23/wasm"
                );
                this.LlmInference = LlmInference;

                this.updateStatus('✅ Ready to load model! Click "Load Model File" to upload your model.', 100);
                this.isInitialized = true;
                if (this.sendBtn) {
                    this.sendBtn.disabled = false;
                }
                
                // Add welcome message
                this.addMessage('assistant', '🚀 **Full AI Mode Ready!**\n\nYour browser supports WebGPU and MediaPipe GenAI is loaded successfully!\n\n**Next steps:**\n1. Click "📁 Load Model File" to upload your Gemma model\n2. Or start chatting in demo mode to test the interface\n\n**Supported model formats:** .bin files (~1.3GB for Gemma 2B)');

            } catch (genaiError) {
                console.warn('GenAI initialization failed:', genaiError);
                this.updateStatus('GenAI initialization failed. Using demo mode.', 50);
                this.isInitialized = true;
                if (this.sendBtn) {
                    this.sendBtn.disabled = false;
                }
                this.addMessage('assistant', '⚠️ **GenAI Initialization Failed**\n\nWebGPU is available but MediaPipe GenAI couldn\'t be initialized. This might be due to:\n\n• WASM loading issues\n• Memory constraints\n• Browser security restrictions\n\n**Current mode:** Demo mode with simulated responses\n\nYou can still test the upload functionality!');
            }

        } catch (error) {
            console.error('Error initializing LLM:', error);
            this.updateStatus(`Error: ${error.message}`, 0);
            this.showError(`Failed to initialize LLM: ${error.message}`);
        }
    }

    updateStatus(message, progress = null) {
        if (this.statusElement) {
            this.statusElement.textContent = message;
        }
        if (progress !== null && this.progressFill) {
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
        if (this.uploadBtn) {
            this.uploadBtn.disabled = true;
        }

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
            if (this.uploadBtn) {
                this.uploadBtn.textContent = '✅ Model Loaded';
                this.uploadBtn.disabled = true;
            }

            // Add success message
            this.addMessage('assistant', `Great! I've loaded the ${file.name} model. I'm now ready to help you with questions, writing, analysis, and more. What would you like to know?`);

        } catch (error) {
            console.error('Error loading uploaded model:', error);
            this.updateStatus('Failed to load model.', 0);
            this.updateUploadStatus(`Error loading model: ${error.message}`, 'error');
            if (this.uploadBtn) {
                this.uploadBtn.disabled = false;
            }
            this.showError(`Failed to load model: ${error.message}`);
        }
    }

    updateUploadStatus(message, type = '') {
        if (this.uploadStatus) {
            this.uploadStatus.textContent = message;
            this.uploadStatus.className = `upload-status ${type}`;
        }
    }

    async sendMessage() {
        if (!this.isInitialized || this.isGenerating) return;

        const message = this.userInput?.value?.trim() || '';
        if (!message) return;

        // Add user message to chat
        this.addMessage('user', message);
        if (this.userInput) {
            this.userInput.value = '';
        }

        // Show typing indicator
        const typingMessage = this.addMessage('assistant', 'Thinking...', 'typing');

        this.isGenerating = true;
        if (this.sendBtn) {
            this.sendBtn.classList.add('loading');
            this.sendBtn.disabled = true;
        }

        try {
            // Check if we're in demo mode (no real LLM)
            if (!this.llmInference) {
                // Demo mode - simulate response
                await new Promise(resolve => setTimeout(resolve, 1000));
                typingMessage.remove();
                
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                const hasWebGPU = !!navigator.gpu;
                
                let demoMessage = `🎭 **Demo Response**\n\nThis is a simulated response to: "${message}"\n\n`;
                
                if (!hasWebGPU) {
                    if (isMobile) {
                        demoMessage += `📱 **Mobile Browser Limitation**\nYour mobile browser doesn't support WebGPU, which is required for running AI models locally.\n\n**To get real AI responses:**\n• Try Chrome 113+ on Android\n• Try Safari 16.4+ on iOS\n• Use a desktop browser with WebGPU support`;
                    } else {
                        demoMessage += `🌐 **Browser Limitation**\nYour browser doesn't support WebGPU, which is required for running AI models locally.\n\n**To get real AI responses:**\n• Try Chrome 113+ (recommended)\n• Try Safari 16.4+\n• Try Firefox 113+\n• Try Edge 113+`;
                    }
                } else {
                    demoMessage += `📁 **Upload Model Required**\nYour browser supports WebGPU! To get real AI responses:\n\n1. Click "📁 Load Model File" button\n2. Select your Gemma model (.bin file)\n3. Wait for model to load\n4. Start chatting with real AI!`;
                }
                
                this.addMessage('assistant', demoMessage);
                this.isGenerating = false;
                if (this.sendBtn) {
                    this.sendBtn.classList.remove('loading');
                    this.sendBtn.disabled = false;
                }
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
                    if (this.sendBtn) {
                        this.sendBtn.classList.remove('loading');
                        this.sendBtn.disabled = false;
                    }
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
        if (this.sendBtn) {
            this.sendBtn.classList.remove('loading');
            this.sendBtn.disabled = false;
        }
    }
    }

    addMessage(sender, content, className = '') {
        if (!this.chatMessages) {
            console.error('Chat messages container not found');
            return null;
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender} ${className}`;
        messageDiv.textContent = content;
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        return messageDiv;
    }

    clearChat() {
        if (this.chatMessages) {
            this.chatMessages.innerHTML = '';
            this.addMessage('assistant', 'Chat cleared. How can I help you today?');
        }
    }

    openSettings() {
        if (this.settingsModal) {
            this.settingsModal.style.display = 'block';
        }
    }

    closeSettings() {
        if (this.settingsModal) {
            this.settingsModal.style.display = 'none';
        }
    }

    showError(message) {
        if (!this.chatMessages) {
            console.error('Chat messages container not found');
            return;
        }
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        this.chatMessages.appendChild(errorDiv);
    }

    showSuccess(message) {
        if (!this.chatMessages) {
            console.error('Chat messages container not found');
            return;
        }
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