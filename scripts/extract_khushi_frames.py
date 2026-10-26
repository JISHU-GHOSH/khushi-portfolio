import cv2
import numpy as np
import os
import sys

VIDEO_PATH = sys.argv[1] if len(sys.argv) > 1 else r"C:\khushi_porfolio\Character_tracking_mouse_cursor_1080p_20261026042114.mp4"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "frames")
os.makedirs(OUT_DIR, exist_ok=True)

def inpaint_watermark(img):
    mask = np.zeros(img.shape[:2], dtype=np.uint8)
    # Kling AI sparkle watermark region in bottom-right quadrant
    mask[780:1020, 1600:1890] = 255
    return cv2.inpaint(img, mask, 6, cv2.INPAINT_TELEA)

cap = cv2.VideoCapture(VIDEO_PATH)
if not cap.isOpened():
    print(f"Error opening video: {VIDEO_PATH}")
    sys.exit(1)

frames = []
while True:
    ret, frame = cap.read()
    if not ret: break
    frames.append(frame)
cap.release()

print(f"Loaded {len(frames)} video frames from {VIDEO_PATH}.")

# Inpaint key anchor frames
anchors_def = [
    ( 0, 185), # Right (0 deg)
    ( 8, 176), # Up-Right (45 deg)
    (16, 174), # Up (90 deg)
    (24, 171), # Up-Left (135 deg)
    (28, 150), # 157.5 deg
    (32, 130), # Left (180 deg)
    (36, 115), # 202.5 deg
    (40, 100), # Down-Left (225 deg)
    (48,  96), # Down (270 deg)
    (52,  86), # 292.5 deg
    (56,  76), # Down-Right (315 deg)
    (60,  60), # 337.5 deg
    (61, 194), # bridge
    (62, 190), # 350 deg
    (63, 187), # 356 deg
    (64, 185)  # Right (360 deg)
]

inpainted_anchors = []
for slot, f_idx in anchors_def:
    cleaned = inpaint_watermark(frames[f_idx])
    inpainted_anchors.append((slot, cleaned))

dis = cv2.DISOpticalFlow.create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)

def morph_pair(f1, f2, alpha):
    if alpha <= 0.001: return f1.copy()
    if alpha >= 0.999: return f2.copy()
    g1 = cv2.cvtColor(f1, cv2.COLOR_BGR2GRAY)
    g2 = cv2.cvtColor(f2, cv2.COLOR_BGR2GRAY)
    flow_fwd = dis.calc(g1, g2, None)
    flow_bwd = dis.calc(g2, g1, None)
    h, w = f1.shape[:2]
    gx, gy = np.meshgrid(np.arange(w), np.arange(h))
    
    map1_x = (gx + alpha * flow_fwd[..., 0]).astype(np.float32)
    map1_y = (gy + alpha * flow_fwd[..., 1]).astype(np.float32)
    w1 = cv2.remap(f1, map1_x, map1_y, cv2.INTER_LINEAR)
    
    map2_x = (gx + (1 - alpha) * flow_bwd[..., 0]).astype(np.float32)
    map2_y = (gy + (1 - alpha) * flow_bwd[..., 1]).astype(np.float32)
    w2 = cv2.remap(f2, map2_x, map2_y, cv2.INTER_LINEAR)
    
    return cv2.addWeighted(w1, 1.0 - alpha, w2, alpha, 0)

print("Synthesizing 64 seamless circular frames with DIS optical flow...")
seq_64 = []
for a_idx in range(len(inpainted_anchors) - 1):
    s_slot, img_s = inpainted_anchors[a_idx]
    e_slot, img_e = inpainted_anchors[a_idx + 1]
    n_steps = e_slot - s_slot
    for step in range(n_steps):
        alpha = step / float(n_steps)
        seq_64.append(morph_pair(img_s, img_e, alpha))

print(f"Generated {len(seq_64)} directional frames. Saving WebP files to {OUT_DIR}...")
for i, frame in enumerate(seq_64):
    out_path = os.path.join(OUT_DIR, f"{i:03d}.webp")
    cv2.imwrite(out_path, frame, [cv2.IMWRITE_WEBP_QUALITY, 92])

# Center neutral eye-contact frame (Frame 0)
center_cleaned = inpaint_watermark(frames[0])
cv2.imwrite(os.path.join(OUT_DIR, "center.webp"), center_cleaned, [cv2.IMWRITE_WEBP_QUALITY, 92])

print("Finished saving frames. Running continuity diff report...")
diffs = [np.mean(cv2.absdiff(seq_64[i], seq_64[(i+1)%64])) for i in range(64)]
print(f"64-frame Diff Summary:")
print(f"  Mean diff: {np.mean(diffs):.2f}")
print(f"  Min diff:  {np.min(diffs):.2f}")
print(f"  Max diff:  {np.max(diffs):.2f}")
for i in range(64):
    if diffs[i] > 6.0:
        print(f"  Warning: Step {i:02d} -> {(i+1)%64:02d} has diff {diffs[i]:.2f}")

print("Frame extraction and inpainting complete!")
