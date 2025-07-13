# Assets Directory

This directory contains the model files needed for the Mobile LLM Chat application.

## Required Model File

**File**: `gemma-1.1-2b-it-gpu-int4.bin`  
**Size**: ~1.3GB  
**Format**: Quantized 4-bit INT model

## How to Download

### Option 1: Kaggle Models (Recommended)
1. Visit [Gemma-2 2B GPU INT4](https://www.kaggle.com/models/google/gemma-2-2b-it-gpu-int4)
2. Download the `gemma-1.1-2b-it-gpu-int4.bin` file
3. Place it in this directory

### Option 2: GitHub Releases
1. Check the [Releases](../../releases) section of this repository
2. Download the model file from the latest release
3. Place it in this directory

### Option 3: Alternative Sources
- Hugging Face: [google/gemma-2-2b-it](https://huggingface.co/google/gemma-2-2b-it)
- Google AI: [Gemma Models](https://ai.google.dev/gemma)

## File Structure

After downloading, your assets directory should look like:
```
assets/
├── README.md                        # This file
└── gemma-1.1-2b-it-gpu-int4.bin   # Downloaded model file
```

## Important Notes

- ⚠️ **File Size**: The model file is ~1.3GB and cannot be included in the Git repository due to GitHub's 100MB file limit
- ✅ **Demo Mode**: The application works without the model file in demo mode
- 🔒 **Security**: Model files are listed in `.gitignore` to prevent accidental commits
- 📱 **Performance**: The model is optimized for mobile devices with WebGPU support

## Troubleshooting

### Model Not Loading
- Verify the file is named exactly `gemma-1.1-2b-it-gpu-int4.bin`
- Check that the file is in the correct `assets/` directory
- Ensure your browser supports WebGPU

### File Size Issues
- The model file should be approximately 1.3GB
- Corrupted downloads may have different sizes
- Re-download if the file size doesn't match

### Browser Compatibility
- Chrome 113+ with WebGPU enabled
- Safari 16.4+ with WebGPU enabled
- Firefox 113+ with WebGPU enabled
- Edge 113+ with WebGPU enabled

## License

The Gemma model is subject to Google's [Gemma Terms of Use](https://ai.google.dev/gemma/terms). Please review the terms before downloading and using the model. 