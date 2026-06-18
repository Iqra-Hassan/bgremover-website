import sys
import os

def main():
    if len(sys.argv) < 3:
        print("Usage: python remove_bg.py <input_path> <output_path>", file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    try:
        from rembg import remove
        from PIL import Image
    except ImportError as e:
        print(f"Error: Required Python packages not installed. Please run 'pip install rembg Pillow'. Details: {e}", file=sys.stderr)
        sys.exit(1)

    if not os.path.exists(input_path):
        print(f"Error: Input file {input_path} does not exist", file=sys.stderr)
        sys.exit(1)

    try:
        input_image = Image.open(input_path)
        output_image = remove(input_image)
        output_image.save(output_path)
        print("Success")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
