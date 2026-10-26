import cv2
import numpy as np
import os
import sys

VIDEO_PATH = sys.argv[1] if len(sys.argv) > 1 else r"C:\khushi_porfolio\Character_tracking_mouse_cursor_1080p_20261026042114.mp4"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "frames")
os.makedirs(OUT_DIR, exist_ok=True)

# 64-frame counter-clockwise continuous circular mapping:
# 0..7:   RIGHT (0 deg) -> UP-RIGHT (45 deg)
# 8..15:  UP-RIGHT (45 deg) -> UP (90 deg)
# 16..23: UP (90 deg) -> UP-LEFT (135 deg)
# 24..31: UP-LEFT (135 deg) -> LEFT (180 deg)
# 32..39: LEFT (180 deg) -> DOWN-LEFT (225 deg)
# 40..47: DOWN-LEFT (225 deg) -> DOWN (270 deg)
# 48..55: DOWN (270 deg) -> DOWN-RIGHT (315 deg)
# 56..63: DOWN-RIGHT (315 deg) -> RIGHT (360 deg)
frame_map = [
    # 0..7: 0 deg to 45 deg (RIGHT -> UP-RIGHT)
    10, 13, 16, 19, 22, 25, 28, 31,
    # 8..15: 45 deg to 90 deg (UP-RIGHT -> UP)
    33, 35, 37, 39, 41, 43, 45, 47,
    # 16..23: 90 deg to 135 deg (UP -> UP-LEFT)
    138, 141, 144, 147, 150, 153, 156, 159,
    # 24..31: 135 deg to 180 deg (UP-LEFT -> LEFT)
    162, 166, 170, 174, 178, 183, 188, 193,
    # 32..39: 180 deg to 225 deg (LEFT -> DOWN-LEFT)
    196, 185, 175, 165, 130, 125, 122, 120,
    # 40..47: 225 deg to 270 deg (DOWN-LEFT -> DOWN)
    118, 116, 114, 112, 110, 108, 106, 104,
    # 48..55: 270 deg to 315 deg (DOWN -> DOWN-RIGHT)
    102, 100, 95, 90, 85, 80, 75, 70,
    # 56..63: 315 deg to 360 deg (DOWN-RIGHT -> RIGHT)
    65, 58, 50, 42, 30, 20, 15, 10
]

def inpaint_watermark(img):
    mask = np.zeros(img.shape[:2], dtype=np.uint8)
    # Kling AI sparkle watermark region in bottom-right quadrant
    mask[780:1020, 1600:1890] = 255
    return cv2.inpaint(img, mask, 6, cv2.INPAINT_TELEA)

cap = cv2.VideoCapture(VIDEO_PATH)
if not cap.isOpened():
    print(f"Error opening video: {VIDEO_PATH}")
    sys.exit(1)

all_frames = {}
frame_idx = 0
needed_indices = set(frame_map)
needed_indices.add(0) # Center direct eye-contact frame

while True:
    ret, frame = cap.read()
    if not ret: break
    if frame_idx in needed_indices:
        all_frames[frame_idx] = frame
    frame_idx += 1
cap.release()

print(f"Loaded {len(all_frames)} needed video frames.")

# Save 64 directional WebP frames
for i, f_num in enumerate(frame_map):
    raw = all_frames[f_num]
    cleaned = inpaint_watermark(raw)
    out_path = os.path.join(OUT_DIR, f"{i:03d}.webp")
    cv2.imwrite(out_path, cleaned, [cv2.IMWRITE_WEBP_QUALITY, 90])

# Save neutral eye-contact frame (Frame 0)
raw_center = all_frames[0]
cleaned_center = inpaint_watermark(raw_center)
cv2.imwrite(os.path.join(OUT_DIR, "center.webp"), cleaned_center, [cv2.IMWRITE_WEBP_QUALITY, 90])

print(f"Successfully saved 64 WebP frames + center.webp into {OUT_DIR}")
