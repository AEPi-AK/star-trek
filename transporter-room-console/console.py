from picamera import PiCamera
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

