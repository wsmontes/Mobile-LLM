# Mobile LLM Chat Application

A JavaScript module that runs large language models (LLMs) directly on mobile devices using Google AI Edge MediaPipe. This application provides a chat interface that works completely offline once the model is loaded.

## Features

- 🤖 **On-device LLM**: Runs Gemma-2 2B model directly in the browser
- 📱 **Mobile-optimized**: Designed for iPhone 14 and other mobile devices
- 🔄 **Real-time streaming**: Responses stream in real-time as they're generated
- ⚙️ **Configurable settings**: Adjust temperature, max tokens, and top-k
- 💾 **Offline support**: Service worker caches assets for offline use
- 🎨 **Modern UI**: Clean, mobile-friendly chat interface

## Requirements

### Browser Support
- **WebGPU support** (Chrome 113+, Safari 16.4+, Firefox 113+)
- **Modern mobile browser** with WebAssembly support
- **Sufficient memory**: At least 2GB RAM recommended

### Model Requirements
- **Gemma-2 2B model** in 8-bit quantized format (`.bin` file)
- **Model size**: ~1.5GB (quantized)
- **Storage**: At least 2GB free space

## Setup Instructions

### 1. Load Model File (Optional for Full LLM Functionality)

**🎯 Easy Mobile Testing**: You can now upload the model file directly from your mobile device using the "Load Model File" button!

**⚠️ Important**: The model file is **not included** in this repository due to GitHub's 100MB file size limit. The app includes a **demo mode** that works without the model file.

#### Option A: Upload from Mobile Device (Recommended)
1. Open the app on your mobile device
2. Click the **"📁 Load Model File"** button
3. Select your `gemma-2b-it-gpu-int4.bin` file
4. The app will automatically load and initialize the model

#### Option B: Download and Place Model File
For full LLM functionality, download the Gemma-2 2B model:
- Visit: [Gemma-2 2B GPU INT4](https://www.kaggle.com/models/google/gemma-2-2b-it-gpu-int4)
- Download the `gemma-2b-it-gpu-int4.bin` file (~1.3GB)
- Alternative: Check the [Releases](../../releases) section for model downloads

### 2. Place Model File (Optional - for Option B)

If you downloaded the model, place it in the assets directory:
```
your-project/
├── assets/
│   └── gemma-2b-it-gpu-int4.bin  # Download separately
├── index.html
├── styles.css
├── mobile-llm.js
├── sw.js
└── README.md
```

**Note**: The app will work in demo mode without the model file, showing simulated responses for testing the UI and functionality.

### 3. Serve the Application

Due to CORS restrictions, you need to serve the files from a web server:

#### Option A: Using Python
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Option B: Using Node.js
```bash
# Install serve globally
npm install -g serve

# Serve the directory
serve -p 8000
```

#### Option C: Using PHP
```bash
php -S localhost:8000
```

#### Option D: GitHub Pages (Recommended)
1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Your site will be available at `https://yourusername.github.io/mobile-llm-chat`

### 4. Access the Application

**Local Development:**
```
http://localhost:8000
```

**GitHub Pages:**
```
https://yourusername.github.io/mobile-llm-chat
```

## Usage

### Basic Usage
1. **Load the page** - The app will initialize MediaPipe GenAI
2. **Upload model file** - Click "📁 Load Model File" to upload your Gemma model (or skip for demo mode)
3. **Wait for initialization** - Progress bar shows loading status
4. **Start chatting** - Type your message and press Send or Enter
5. **Adjust settings** - Click the ⚙️ button to modify generation parameters

### Settings
- **Temperature**: Controls randomness (0.1 = focused, 1.5 = creative)
- **Max Tokens**: Maximum response length (100-2000 tokens)
- **Top-K**: Number of tokens considered at each step (10-100)

### Mobile Optimization Tips

1. **Add to Home Screen**
   - Open in Safari/Chrome
   - Tap "Add to Home Screen"
   - Access like a native app

2. **Enable Offline Mode**
   - The service worker caches assets
   - Works offline after first load

3. **Battery Optimization**
   - Close other apps while using
   - Keep device plugged in for extended use

4. **iOS-Specific Tips**
   - Use Safari for best WebGPU support
   - Try Safari Technology Preview for better compatibility
   - Keep other apps closed to free up memory
   - Consider smaller models for better performance

## Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript with ES6 classes
- **LLM Engine**: Google AI Edge MediaPipe
- **Model**: Gemma-2 2B (8-bit quantized)
- **Caching**: Service Worker for offline support

### Performance
- **Initial load**: ~30-60 seconds (model download)
- **Response time**: 2-10 seconds depending on length
- **Memory usage**: ~1.5GB during inference
- **Battery impact**: High (GPU-intensive)

### Browser Compatibility

| Browser | Version | WebGPU Support | Status |
|---------|---------|---------------|--------|
| Chrome | 113+ | ✅ Yes | ✅ Full support |
| Safari | 16.4+ | ✅ Yes | ✅ Full support |
| Firefox | 113+ | ✅ Yes | ✅ Full support |
| Edge | 113+ | ✅ Yes | ✅ Full support |
| Mobile Chrome | 113+ | ⚠️ Limited | 🔶 Partial (demo mode) |
| Mobile Safari | 16.4+ | ⚠️ Limited | 🔶 Partial (demo mode) |
| Older browsers | < 113 | ❌ No | 🔴 Demo mode only |

**Note:** Mobile browsers have limited WebGPU support, but the app now includes iOS-specific optimizations to attempt real AI functionality on iPhone/iPad. The upload functionality works for testing purposes.

## Troubleshooting

### Common Issues

**"WebGPU is not supported"**
- Update your browser to the latest version
- Enable WebGPU in browser flags (if needed)

**"Model failed to load"**
- Check that the model file is in the correct location
- Verify the file is not corrupted
- Ensure sufficient storage space

**"Out of memory"**
- Close other browser tabs
- Restart the browser
- Use a device with more RAM

**"Slow performance"**
- Reduce max tokens in settings
- Lower temperature for faster responses
- Close background apps

### Debug Mode

Open browser developer tools and check the console for detailed error messages.

## Customization

### Changing the Model
To use a different model:

1. Download the new model file
2. Update the `modelAssetPath` in `mobile-llm.js`:
```javascript
baseOptions: {
    modelAssetPath: '/assets/your-new-model.bin'
}
```

### Styling
Modify `styles.css` to customize the appearance:
- Colors and gradients
- Layout and spacing
- Mobile responsiveness

### Adding Features
Extend the `MobileLLM` class in `mobile-llm.js`:
- Custom generation parameters
- Additional UI controls
- Integration with external APIs

## Security Considerations

- **No data leaves the device** - All processing is local
- **No API keys required** - Model runs completely offline
- **Privacy-first** - No tracking or data collection

## Performance Optimization

### For Developers
- Use quantized models (8-bit or 4-bit)
- Implement progressive loading
- Add model compression
- Optimize WASM memory usage

### For Users
- Use on devices with 4GB+ RAM
- Keep device cool during use
- Close unnecessary apps
- Use Wi-Fi for initial model download

## License

This project is open source and available under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile devices
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section
- Review browser compatibility
- Test on different devices
- Check console for error messages

---

## GitHub Pages Deployment

This application is designed to work seamlessly with GitHub Pages:

### Quick Deploy to GitHub Pages
1. **Fork this repository** to your GitHub account
2. **Go to Settings** → **Pages** in your forked repository
3. **Select source**: Deploy from a branch
4. **Choose branch**: `main` (or your default branch)
5. **Choose folder**: `/ (root)`
6. **Save** and wait for deployment

Your site will be available at: `https://yourusername.github.io/mobile-llm-chat`

### GitHub Pages Benefits
- ✅ **Free hosting** for static sites
- ✅ **HTTPS by default** 
- ✅ **Custom domain support**
- ✅ **Automatic deployment** on push
- ✅ **Demo mode works** without model files
- ✅ **Mobile-optimized** interface

## Current Status

The application is currently working with the following setup:

- **GitHub Pages Ready**: Fully compatible with GitHub Pages hosting
- **MediaPipe GenAI**: Successfully integrated with fallback to demo mode
- **Demo Mode**: Works without model files for testing UI and functionality
- **Real LLM**: Requires downloading the Gemma 2B model file separately
- **Browser support**: WebGPU support is required but not universally available

### Demo Mode
When the MediaPipe GenAI library or model files are not available, the app runs in demo mode:
- Chat interface works normally
- Responses are simulated for testing
- All UI features are functional
- No external dependencies required
- **Perfect for GitHub Pages** demonstration

### Getting Real LLM Functionality
To use the real LLM functionality:
1. Download the Gemma 2B model file
2. Place it in the `assets/` directory as `gemma-2b-it-gpu-int8.bin`
3. The app will automatically detect and use the real model

---

**Note**: This application requires significant computational resources and may not work optimally on all mobile devices. Test thoroughly on your target devices before deployment. 