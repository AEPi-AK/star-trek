from cv2 import *

cam = VideoGapture(0)
s, img = cam.read()
imwrite("test.jpg", img)
#http://www.chioka.in/python-live-video-streaming-example/
