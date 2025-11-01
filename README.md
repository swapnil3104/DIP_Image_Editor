# Photo Editor - Modern Image Processing Web Application

A modern, clean, and minimalistic image processing dashboard with advanced image editing capabilities.

## Features

### Image Operations
- **Crop** - Crop your images to desired dimensions
- **Rotate** - Rotate images in 90-degree increments
- **Blur** - Apply Gaussian blur effects
- **Sharpen** - Enhance image sharpness
- **Brightness** - Adjust brightness levels
- **Contrast** - Fine-tune contrast settings
- **Grayscale** - Convert images to grayscale
- **Edge Detection** - Apply Sobel edge detection algorithm
- **Add Filter** - Apply vintage, cool, or warm color filters
- **Draw** - Draw with multi-color pen tool

### Interface Features
- **Large Preview Area** - See your edits in real-time
- **Upload Image** - Upload images from your device
- **Save** - Save edited images
- **Undo** - Undo recent operations
- **History Panel** - View and track all recent edits
- **Thumbnail Grid** - Quick access to previously edited images
- **Script Running Indicator** - Shows backend status
- **Responsive Design** - Works on desktop and mobile devices

## Files Structure

```
.
├── index.html          # Main HTML structure
├── styles.css          # Modern CSS styling
├── script.js           # JavaScript functionality
├── photo_editor.py     # Python backend script
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## Installation

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Setup Steps

1. **Clone or download this repository**

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Open the application:**
   - Simply open `index.html` in your web browser
   - Or use a local web server:
     ```bash
     python -m http.server 8000
     ```
     Then navigate to `http://localhost:8000`

## Usage

### Basic Workflow

1. **Upload an Image**
   - Click the "Upload Image" button
   - Select an image file from your device

2. **Apply Edits**
   - Click any operation button from the toolbar
   - Use the intensity slider to adjust effect strength
   - Your changes appear immediately

3. **Drawing Tool**
   - Click the "Draw" button
   - Select a color from the color picker
   - Use the brush size slider to adjust pen size
   - Click and drag on the image to draw

4. **View History**
   - Click "History Panel" to view recent actions
   - All operations are automatically logged

5. **Undo Operations**
   - Click the "Undo" button to revert the last operation
   - Multiple undo operations are supported

6. **Save Your Work**
   - Click the "Save" button to download your edited image
   - The image is saved as a PNG file

### Python Backend

The `photo_editor.py` script provides server-side image processing capabilities:

```bash
# Run the script
python photo_editor.py

# Run tests
python photo_editor.py test
```

## Design Features

- **Clean White Background** with soft blue and gray accents
- **Modern Typography** for excellent readability
- **Rounded Buttons** with subtle shadows for depth
- **Smooth Animations** for better user experience
- **Icon Integration** using Font Awesome icons
- **Responsive Layout** that adapts to different screen sizes

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## Technologies Used

- **HTML5** - Structure and canvas
- **CSS3** - Modern styling with gradients and animations
- **JavaScript (ES6+)** - Client-side image processing
- **Python** - Backend processing
- **PIL/Pillow** - Image manipulation
- **NumPy** - Numerical operations for advanced filters
- **Font Awesome** - Icons

## Known Limitations

- Large images may take longer to process
- Some operations may be memory-intensive
- History is limited to 20 operations
- Browser-based processing has performance limits

## Future Enhancements

- [ ] Support for more file formats
- [ ] Additional filters and effects
- [ ] Batch processing capabilities
- [ ] Cloud storage integration
- [ ] Export options (JPEG, WebP, etc.)
- [ ] Advanced selection tools
- [ ] Text overlay functionality

## License

This project is open source and available for personal and commercial use.

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.

---

**Enjoy editing your photos with Photo Editor!**


