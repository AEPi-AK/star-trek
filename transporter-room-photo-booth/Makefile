.PHONY: clean

# Variables
CC = gcc
CCFLAGS = -std=c99 -pedantic -g

#Rules

main: main.o
	$(CC) $(CCFLAGS) -o main main.o

%.o: %.c stb_image.h stb_image_write.h
	$(CC) -c -o $@ $< $(CCFLAGS)

clean:
	rm -f main *.o ./Results/* map.jpg out.mp4
