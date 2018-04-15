import picamera
import pygame
import io

# Init pygame 
pygame.init()
screen = pygame.display.set_mode((0,0), pygame.fullscreen)

# Init camera
camera = picamera.PiCamera()
camera.resolution = (1280, 720)
camera.crop = (0.0, 0.0, 1.0, 1.0)

camera.start_preview()
sleep(5)
camera.stop_preview()


x = (screen.get_width() - camera.resolution[0]) / 2
y = (screen.get_height() - camera.resolution[1]) / 2

# Init buffer
rgb = bytearray(camera.resolution[0] * camera.resolution[1] * 3)

# Main loop
exitFlag = True
while(exitFlag):
    for event in pygame.event.get():
        if(event.type is pygame.MOUSEBUTTONDOWN or 
           event.type is pygame.QUIT or
           event.type is pygame.KEYDOWN):
            exitFlag = False

    stream = io.BytesIO()
    camera.capture(stream, use_video_port=True, format='rgb')
    stream.seek(0)
    stream.readinto(rgb)
    stream.close()
    img = pygame.image.frombuffer(rgb[0:
          (camera.resolution[0] * camera.resolution[1] * 3)],
           camera.resolution, 'RGB')

    screen.fill(0)
    if img:
        screen.blit(img, (x,y))

    pygame.display.update()

camera.close()
pygame.display.quit()


"""from picamera import PiCamera
from time import sleep
import pygame


pygame.init()
screenInfo = pygame.display.Info()


camera = PiCamera()

renderer = camera.start_preview()
#camera.resolution = (screenInfo.current_w/2, screenInfo.current_h/2)
renderer.fullscreen = False
renderer.window = (0, 0, screenInfo.current_w, screenInfo.current_h/2)





def countDown(seconds):
    for elapsed in xrange(seconds):
        print(seconds - elapsed)
        camera.annotate_text = str(seconds-elapsed)
        time.sleep(1)

def click():
    countDown(5)
    #take a picture
    camera.stop_preview()

def main():

    screen = pygame.display.set_mode((screenInfo.current_w,
                                      screenInfo.current_h))

    button = pygame.draw.rect(screen, (255, 255, 255), 0, 
            screenInfo.current_h/2, screenInfo.current_w,
            screenInfo.current_h/2, 0)

    print("entering loop")
    time.sleep(10)

    while(True):
        for event in pygame.event.get():
            if(event.type == pygame.MOUSEBUTTONDOWN):
                click()
            elif(event.type == pygame.QUIT):
                print("WAIT")
                sleep(2)
                break
    print("exiting loop")
    time.sleep(2)
    camera.stop_preview()
    camera.close()


main()

"""