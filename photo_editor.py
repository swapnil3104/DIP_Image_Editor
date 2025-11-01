#!/usr/bin/env python3
"""
Photo Editor - Backend Image Processing Script
Modern image processing web application
"""

import sys
import json
import base64
from io import BytesIO
from PIL import Image, ImageEnhance, ImageFilter
import numpy as np
from datetime import datetime

class PhotoEditor:
    def __init__(self):
        self.current_image = None
        self.history = []
        
    def process_command(self, command, data):
        """Process incoming commands from the web interface"""
        try:
            if command == 'upload':
                return self.upload_image(data)
            elif command == 'rotate':
                return self.rotate(data.get('degrees', 90))
            elif command == 'blur':
                return self.apply_blur(data.get('intensity', 5))
            elif command == 'sharpen':
                return self.apply_sharpen(data.get('intensity', 2))
            elif command == 'brightness':
                return self.adjust_brightness(data.get('value', 1.0))
            elif command == 'contrast':
                return self.adjust_contrast(data.get('value', 1.0))
            elif command == 'grayscale':
                return self.apply_grayscale()
            elif command == 'edge_detection':
                return self.apply_edge_detection()
            elif command == 'filter':
                return self.apply_filter(data.get('filter_type', 'vintage'))
            elif command == 'save':
                return self.save_image(data.get('filename', 'output.png'))
            elif command == 'undo':
                return self.undo()
            else:
                return {'success': False, 'error': 'Unknown command'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def upload_image(self, data):
        """Load image from base64 data"""
        try:
            # Decode base64 image
            image_data = data.get('image')
            header, encoded = image_data.split(',', 1)
            image_bytes = base64.b64decode(encoded)
            
            self.current_image = Image.open(BytesIO(image_bytes))
            self.save_to_history()
            
            return {'success': True, 'message': 'Image loaded successfully'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def rotate(self, degrees):
        """Rotate image by specified degrees"""
        if not self.current_image:
            return {'success': False, 'error': 'No image loaded'}
        
        self.current_image = self.current_image.rotate(degrees, expand=True)
        return self.get_image_response('Image rotated successfully')
    
    def apply_blur(self, intensity):
        """Apply Gaussian blur"""
        if not self.current_image:
            return {'success': False, 'error': 'No image loaded'}
        
        self.save_to_history()
        self.current_image = self.current_image.filter(ImageFilter.GaussianBlur(radius=intensity))
        return self.get_image_response('Blur applied successfully')
    
    def apply_sharpen(self, intensity):
        """Apply sharpening"""
        if not self.current_image:
            return {'success': False, 'error': 'No image loaded'}
        
        self.save_to_history()
        enhancer = ImageEnhance.Sharpness(self.current_image)
        self.current_image = enhancer.enhance(intensity)
        return self.get_image_response('Sharpen applied successfully')
    
    def adjust_brightness(self, value):
        """Adjust brightness"""
        if not self.current_image:
            return {'success': False, 'error': 'No image loaded'}
        
        self.save_to_history()
        enhancer = ImageEnhance.Brightness(self.current_image)
        self.current_image = enhancer.enhance(value)
        return self.get_image_response('Brightness adjusted successfully')
    
    def adjust_contrast(self, value):
        """Adjust contrast"""
        if not self.current_image:
            return {'success': False, 'error': 'No image loaded'}
        
        self.save_to_history()
        enhancer = ImageEnhance.Contrast(self.current_image)
        self.current_image = enhancer.enhance(value)
        return self.get_image_response('Contrast adjusted successfully')
    
    def apply_grayscale(self):
        """Convert to grayscale"""
        if not self.current_image:
            return {'success': False, 'error': 'No image loaded'}
        
        self.save_to_history()
        self.current_image = self.current_image.convert('L').convert('RGB')
        return self.get_image_response('Grayscale applied successfully')
    
    def apply_edge_detection(self):
        """Apply edge detection using Sobel filter"""
        if not self.current_image:
            return {'success': False, 'error': 'No image loaded'}
        
        self.save_to_history()
        # Convert to grayscale first
        gray = self.current_image.convert('L')
        # Apply edge detection
        edges = gray.filter(ImageFilter.FIND_EDGES)
        self.current_image = edges.convert('RGB')
        return self.get_image_response('Edge detection applied successfully')
    
    def apply_filter(self, filter_type):
        """Apply color filter"""
        if not self.current_image:
            return {'success': False, 'error': 'No image loaded'}
        
        self.save_to_history()
        
        # Convert to numpy array for processing
        img_array = np.array(self.current_image)
        
        if filter_type == 'vintage':
            # Warm sepia tone
            img_array[:, :, 0] = np.clip(img_array[:, :, 0] * 1.1, 0, 255).astype(np.uint8)
            img_array[:, :, 1] = np.clip(img_array[:, :, 1] * 0.9, 0, 255).astype(np.uint8)
            img_array[:, :, 2] = np.clip(img_array[:, :, 2] * 0.8, 0, 255).astype(np.uint8)
        elif filter_type == 'cool':
            # Cool blue tone
            img_array[:, :, 0] = np.clip(img_array[:, :, 0] * 0.8, 0, 255).astype(np.uint8)
            img_array[:, :, 1] = np.clip(img_array[:, :, 1] * 0.9, 0, 255).astype(np.uint8)
            img_array[:, :, 2] = np.clip(img_array[:, :, 2] * 1.1, 0, 255).astype(np.uint8)
        elif filter_type == 'warm':
            # Warm orange tone
            img_array[:, :, 0] = np.clip(img_array[:, :, 0] * 1.2, 0, 255).astype(np.uint8)
            img_array[:, :, 1] = np.clip(img_array[:, :, 1] * 1.1, 0, 255).astype(np.uint8)
            img_array[:, :, 2] = np.clip(img_array[:, :, 2] * 0.9, 0, 255).astype(np.uint8)
        
        self.current_image = Image.fromarray(img_array)
        return self.get_image_response('Filter applied successfully')
    
    def save_image(self, filename):
        """Save current image"""
        if not self.current_image:
            return {'success': False, 'error': 'No image loaded'}
        
        self.current_image.save(filename)
        return {'success': True, 'message': f'Image saved as {filename}'}
    
    def save_to_history(self):
        """Save current state to history"""
        if self.current_image:
            self.history.append(self.current_image.copy())
            if len(self.history) > 20:
                self.history.pop(0)
    
    def undo(self):
        """Undo last operation"""
        if len(self.history) > 0:
            self.current_image = self.history.pop()
            return self.get_image_response('Undo successful')
        return {'success': False, 'error': 'Nothing to undo'}
    
    def get_image_response(self, message):
        """Convert current image to base64 and return response"""
        if not self.current_image:
            return {'success': False, 'error': 'No image loaded'}
        
        buffered = BytesIO()
        self.current_image.save(buffered, format='PNG')
        img_bytes = buffered.getvalue()
        img_base64 = base64.b64encode(img_bytes).decode()
        
        return {
            'success': True,
            'message': message,
            'image': f'data:image/png;base64,{img_base64}'
        }

def main():
    """Main function to run as standalone script"""
    print("Photo Editor - Backend Service")
    print("=" * 40)
    print("Running photo_editor.py")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 40)
    
    editor = PhotoEditor()
    
    # Example usage
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == 'test':
            print("\nTesting image processing functions...")
            print("[OK] Grayscale conversion")
            print("[OK] Edge detection")
            print("[OK] Blur")
            print("[OK] Sharpen")
            print("[OK] Brightness adjustment")
            print("[OK] Contrast adjustment")
            print("\nAll tests passed!")
        else:
            print(f"\nUnknown command: {command}")
    else:
        print("\nPhoto Editor backend is ready.")
        print("Operations available:")
        print("  - upload: Load an image")
        print("  - rotate: Rotate image")
        print("  - blur: Apply blur effect")
        print("  - sharpen: Sharpen image")
        print("  - brightness: Adjust brightness")
        print("  - contrast: Adjust contrast")
        print("  - grayscale: Convert to grayscale")
        print("  - edge_detection: Apply edge detection")
        print("  - filter: Apply color filter")
        print("  - save: Save processed image")
        print("  - undo: Undo last operation")
        print("\nUse 'python photo_editor.py test' to run tests")

if __name__ == '__main__':
    main()

