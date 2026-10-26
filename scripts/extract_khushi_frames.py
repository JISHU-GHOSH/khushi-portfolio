import cv2
import numpy as np
import os
import sys

VIDEO_PATH = sys.argv[1] if len(sys.argv) > 1 else r"C:\khushi_porfolio\Character_tracking_mouse_cursor_1080p_20261026042114.mp4"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "frames")
os.makedirs(OUT_DIR, exist_ok=True)

# 64-frame counter-clockwise continuous circular mapping from pure raw 1080p video frames:
# 0..7:   RIGHT (0 deg) -> UP-RIGHT (45 deg)
# 8..15:  UP-RIGHT (45 deg) -> UP (90 deg)
# 16..23: UP (90 deg) -> UP-LEFT (135 deg)
# 24..31: UP-LEFT (135 deg) -> LEFT (180 deg)
# 32..39: LEFT (180 deg) -> DOWN-LEFT (225 deg)
# 40..47: DOWN-LEFT (225 deg) -> DOWN (270 deg)
# 48..55: DOWN (270 deg) -> DOWN-RIGHT (315 deg)
# 56..63: DOWN-RIGHT (315 deg) -> RIGHT (360 deg)
raw_map = [
    # 0..7: 0 to 45 deg (Right -> Up-Right)
    185, 184, 183, 182, 181, 180, 178, 177,
    # 8..15: 45 to 90 deg (Up-Right -> Up)
    176, 176, 175, 175, 174, 174, 173, 172,
    # 16..23: 90 to 135 deg (Up -> Up-Left)
    172, 171, 170, 169, 168, 162, 156, 150,
    # 24..31: 135 to 180 deg (Up-Left -> Left)
    144, 138, 136, 134, 133, 132, 131, 130,
    # 32..39: 180 to 225 deg (Left -> Down-Left)
    129, 128, 126, 124, 122, 120, 116, 110,
    # 40..47: 225 to 270 deg (Down-Left -> Down)
    106, 104, 102, 100,  99,  98,  97,  96,
    # 48..55: 270 to 315 deg (Down -> Down-Right)
     95,  94,  93,  92,  90,  84,  78,  76,
    # 56..63: 315 to 360 deg (Down-Right -> Right)
     70,  66,  62,  60, 194, 190, 188, 186
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
needed_indices = set(raw_map)
needed_indices.add(0) # Center direct eye-contact frame

while True:
    ret, frame = cap.read()
    if not ret: break
    if frame_idx in needed_indices:
        all_frames[frame_idx] = frame
    frame_idx += 1
cap.release()

print(f"Loaded {len(all_frames)} needed video frames.")

# Save 64 directional raw WebP frames (Quality 96 for pin-sharp pristine 1080p rendering)
for i, f_num in enumerate(raw_map):
    raw = all_frames[f_num]
    cleaned = inpaint_watermark(raw)
    out_path = os.path.join(OUT_DIR, f"{i:03d}.webp")
    cv2.imwrite(out_path, cleaned, [cv2.IMWRITE_WEBP_QUALITY, 96])

# Save neutral eye-contact frame (Frame 0)
raw_center = all_frames[0]
cleaned_center = inpaint_watermark(raw_center)
cv2.imwrite(os.path.join(OUT_DIR, "center.webp"), cleaned_center, [cv2.IMWRITE_WEBP_QUALITY, 96])

print(f"Successfully saved 64 RAW 1080p WebP frames + center.webp into {OUT_DIR}")
