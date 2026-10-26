import os
import cv2

FRAMES_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "frames")

def test_frame_count_and_dimensions():
    assert os.path.exists(FRAMES_DIR), f"Frames directory does not exist: {FRAMES_DIR}"
    
    # Check center frame
    center_path = os.path.join(FRAMES_DIR, "center.webp")
    assert os.path.exists(center_path), "center.webp is missing"
    center_img = cv2.imread(center_path)
    assert center_img is not None, "center.webp is unreadable"
    assert center_img.shape == (1080, 1920, 3), f"center.webp wrong shape: {center_img.shape}"
    
    # Check 64 directional frames
    for i in range(64):
        f_path = os.path.join(FRAMES_DIR, f"{i:03d}.webp")
        assert os.path.exists(f_path), f"Frame {i:03d}.webp is missing"
        img = cv2.imread(f_path)
        assert img is not None, f"Frame {i:03d}.webp is unreadable"
        assert img.shape == (1080, 1920, 3), f"Frame {i:03d}.webp wrong shape: {img.shape}"

    print("PASS: All 65 WebP frames are verified!")

if __name__ == "__main__":
    test_frame_count_and_dimensions()
