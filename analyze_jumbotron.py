from PIL import Image

image_path = '/Users/brian.k.m./.gemini/antigravity/brain/28eb5ba6-0528-4737-a160-8505cb19dfc8/uploaded_image_1768547174366.png'
img = Image.open(image_path)
pixels = img.load()
width, height = img.size

# Find the bounding box of the large black area
# Scan center column to find segments
cx = width // 2
print(f"Scanning center column at x={cx}")

segments = []
current_start = 0
is_bright = False

for y in range(height):
    p = pixels[cx, y]
    # Check if bright (using same threshold > 30)
    # Actually, let's use a slightly higher threshold or check if significantly different from black
    # dark means r<30, g<30, b<30.
    pixel_is_bright = not (p[0] < 30 and p[1] < 30 and p[2] < 30 and (len(p)<4 or p[3]>0))
    
    if pixel_is_bright != is_bright:
        # State change, record segment
        segments.append({'start': current_start, 'end': y-1, 'is_bright': is_bright, 'length': y - current_start})
        current_start = y
        is_bright = pixel_is_bright

# Add last segment
segments.append({'start': current_start, 'end': height-1, 'is_bright': is_bright, 'length': height - current_start})

# Print significant segments (length > 5) to avoid noise
for seg in segments:
    if seg['length'] > 2:
        print(f"Segment: {seg}")

# Estimate screen height by aggregating bright segments in the middle area
# Find the range of bright segments that are close together




