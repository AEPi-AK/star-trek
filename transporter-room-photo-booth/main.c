#include <stdio.h>
#include <stdlib.h>
#include <limits.h>
#include <time.h>
#include <omp.h>

/* Needed for image reading & writing */
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "stb_image_write.h"
#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"

/* Total number of output frames */
int NUMFRAMES; // At most 498, must be even

/* Path to store output frames */
#define RESULTSPATH "./Results/"

/* Comment to suppress debug messages */
//#define DEBUG

/* Type of effect */
enum EFFECT {NONE, PIXELIZE};

enum EFFECT effect = PIXELIZE;

/* Width, Height, Channels */
int X, Y, N;

/**
 * Read in image.
 */
unsigned char *ReadImage(char* filename, int *x, int *y, int *n) {
  unsigned char *data = stbi_load(filename, x, y, n, 0);
  if (data == NULL) {
    printf("ERROR: Could not read image file %s\n", filename);
  }

  return data;
}

/**
 * Frees the specified image.
 */
void FreeImage(unsigned char* data) {
  if (data) {
    stbi_image_free(data);
  }
}

/**
 * Frees the specified video.
 */
void FreeVideo(unsigned char** video) {
  if (video) {
    int i;
    for (i = 0; i < NUMFRAMES / 2; i++) {
      if (video[i]) {
        free(video[i]);
      }
    }
    free(video);
  }
}

/**
 * Fades the person out of the occupied image.
 */
unsigned char** FadeOut(unsigned char* occupiedScene, unsigned char* emptyScene, unsigned char* map) {
#ifdef DEBUG
  clock_t start = clock();
#endif
  unsigned char** video = (unsigned char**)malloc(NUMFRAMES / 2 * sizeof(unsigned char*));
  if (video == NULL) {
    printf("ERROR: Could not allocate memory\n");
    return NULL;
  }

  int i;
  for (i = 0; i < NUMFRAMES / 2; i++) {
    video[i] = (unsigned char *)malloc(X * Y * N * sizeof(unsigned char));
    if (video[i] == NULL) {
      printf("ERROR: Could not allocate memory\n");
      int j;
      for (j = 0; i < i; j++) {
        free(video[j]);
      }
      free(video);
      return NULL;
    }
  }

  for (i = 0; i < NUMFRAMES / 2; i++) {
    int x, y, n;
    for (y = 0; y < Y; y++) {
      for (x = 0; x < X; x++) {
        float alpha = 1.0 - (float)i / (float)((NUMFRAMES / 2) - 1);
        int yellow = (double)map[y*X + x] > 200.0 ? (random() / (double)INT_MAX) < (1.0 - alpha) : 0;
        for (n = 0; n < N; n++) {
          if (effect == PIXELIZE && yellow) {
            video[i][y*X*N + x*N + n] = alpha * (n == 2 ? 0 : 255) + (1.0 - alpha) * emptyScene[y*X*N + x*N + n];
          } else {
            video[i][y*X*N + x*N + n] = alpha * occupiedScene[y*X*N + x*N + n] + (1.0 - alpha) * emptyScene[y*X*N + x*N + n];
          }
        }
      }
    }
  }

#ifdef DEBUG
  clock_t end = clock();
  printf("Fading out took %f seconds\n", ((double)(end - start)) / CLOCKS_PER_SEC);
#endif
  return video;
}

/**
 * Fade the person into the foreign scene.
 */
unsigned char** FadeIn(unsigned char* occupiedScene, unsigned char* foreignScene, unsigned char* map) {
#ifdef DEBUG
  clock_t start = clock();
#endif
  unsigned char** video = (unsigned char**)malloc(NUMFRAMES / 2 * sizeof(unsigned char*));
  if (video == NULL) {
    printf("ERROR: Could not allocate memory\n");
    return NULL;
  }

  int i;
  for (i = 0; i < NUMFRAMES / 2; i++) {
    video[i] = (unsigned char *)malloc(X * Y * N * sizeof(unsigned char));
    if (video[i] == NULL) {
      printf("ERROR: Could not allocate memory\n");
      int j;
      for (j = 0; i < i; j++) {
        free(video[j]);
      }
      free(video);
      return NULL;
    }
  }

  for (i = 0; i < NUMFRAMES / 2; i++) {
    int x, y, n;
    for (y = 0; y < Y; y++) {
      for (x = 0; x < X; x++) {
        float alpha = (float)i / (float)((NUMFRAMES / 2) - 1);
        int yellow = (effect == PIXELIZE) ? (random() / (double)INT_MAX) < (1.0 - alpha) : 0;
        for (n = 0; n < N; n++) {
          if ((double)map[y*X + x] > 200.0) {
            /* This pixel contains the person */
            if (yellow) {
              video[i][y*X*N + x*N + n] = alpha * (n == 2 ? 0 : 255) + (1.0 - alpha) * foreignScene[y*X*N + x*N + n];
            } else {
              video[i][y*X*N + x*N + n] = alpha * occupiedScene[y*X*N + x*N + n] + (1.0 - alpha) * foreignScene[y*X*N + x*N + n];
            }
          } else {
            video[i][y*X*N + x*N + n] = foreignScene[y*X*N + x*N + n];
          }
        }
      }
    }
  }

#ifdef DEBUG
  clock_t end = clock();
  printf("Fading In took %f seconds\n", ((double)(end - start)) / CLOCKS_PER_SEC);
#endif
  return video;
}

/**
 * Returns true iff the pixel values specified by x, y, and n of pic1 and pic2
 * are approximately equal (within epsilon).
 */
char EpsilonEquals(unsigned char* pic1, unsigned char* pic2, int x, int y, int n, double epsilon) {
  char pixel1 = pic1[y*X*N + x*N + n];
  char pixel2 = pic2[y*X*N + x*N + n];
  return (char)abs((double)pixel1 - (double)pixel2) <= epsilon;
}

/**
 *
 */
/*unsigned char* GetDifference(unsigned char* emptyScene, unsigned char* occupiedScene) {
  unsigned char* difference = (unsigned char*)malloc(X * Y * N * sizeof(unsigned char));
  if (difference == NULL) {
    printf("ERROR: Could not allocate memory\n");
    return NULL;
  }

  int r = 2;
  unsigned char *blurredEmptyScene = (unsigned char*)malloc(X * Y * N * sizeof(unsigned char));
  if (!blurredEmptyScene) {
    printf("ERROR: Could not allocate memory\n");
    free(difference);
    return NULL;
  }
  GaussianBlur(emptyScene, blurredEmptyScene, X, Y, N, r);
#ifdef DEBUG
  printf("Blurred empty\n");
#endif
  unsigned char *blurredOccupiedScene = (unsigned char*)malloc(X * Y * N * sizeof(unsigned char));
  if (!blurredOccupiedScene) {
    printf("ERROR: Could not allocate memory\n");
    free(difference);
    free(blurredEmptyScene);
    return NULL;
  }
  if (GaussianBlur(occupiedScene, blurredOccupiedScene, X, Y, N, r) < 0) {
    printf("ERROR: Error in GaussianBlur\n");
    free(difference);
    free(blurredEmptyScene);
    return NULL;
  }
#ifdef DEBUG
  printf("Blurred occupied\n");
#endif

  int x,y,n;
  for (x = 0; x < X; x++) {
    for (y = 0; y < Y; y++) {
      for (n = 0; n < N; n++) {
        difference[y*X*N + x*N + n] = blurredOccupiedScene[y*X*N + x*N + n] - blurredEmptyScene[y*X*N + x*N + n];
      }
    }
  }

  free(blurredEmptyScene);
  free(blurredOccupiedScene);
  return difference;
}*/

/**
 * Returns a map of where the person is in the scene.
 */
/*int* GetPersonMap(unsigned char* emptyScene, unsigned char* occupiedScene) {
  int* map = (int *)malloc(X * Y * sizeof(int));
  if (map == NULL) {
    printf("ERROR: Could not allocate memory\n");
    return NULL;
  }
  memset(map, 0, X * Y);

  int x,y,n;
  for (x = 0; x < X; x++) {
    for (y = 0; y < Y; y++) {
      char containsPerson = 0;
      for (n = 0; n < N; n++) {
        if (!EpsilonEquals(emptyScene, occupiedScene, x, y, n, 50.0)) {
          containsPerson = 1;
          break;
        }
      }
      if (containsPerson) {
        map[y*X + x] = 1;
      }
    }
  }

#ifdef DEBUG
  printf("Successful map creation\n");
#endif
  return map;
}*/

/*unsigned char* MapImage(int* map) {
  unsigned char* image = (unsigned char*)malloc(X * Y * 1 * sizeof(unsigned char));
  if (image == NULL) {
    printf("ERROR: Failed to allocate memory\n");
    return NULL;
  }

  int x,y,n;
  for (x = 0; x < X; x++) {
    for (y = 0; y < Y; y++) {
     // for (n = 0; n < 4; n++) {
        //image[y*X*4 + x*4 + n] = (map[y*X + x] == 1 ? 255 : 0);
     // }
        image[y*X*1 + x*1 + 0] = (map[y*X + x] == 1 ? 255 : 0);
    }
  }

  return image;
}*/

/**
 * Writes the image to file.
 */
int WriteImage(char const *filename, int w, int h, int comp, const void *data) {
  return stbi_write_jpg(filename, w, h, comp, data, 50);
}

/**
 * Writes the frames of the video to file.
 */
void WriteVideo(unsigned char** fadeOutVideo, unsigned char** fadeInVideo) {
#ifdef DEBUG
  clock_t start = clock();
#endif
  int thread_id;
  //int ret;
  //int num_loops;

  int i;
  //#pragma omp parallel private(thread_id, num_loops)
  //{
  //  num_loops = 0;
  if (fadeOutVideo) {
    #pragma omp for 
    for (i = 0; i < NUMFRAMES / 2; i++) {
      int len = strlen(RESULTSPATH) + 3 + 3 + strlen(".jpg") + 1;
      char filename[len];
      snprintf(filename, len, "%simg%03d.jpg", RESULTSPATH, i);
      int ret = WriteImage(filename, X, Y, N, fadeOutVideo[i]);
      if (ret < 0) {
        printf("ERROR: Failed to write frame %d\n", i);
        //break;
      }
      //num_loops++;
    }
  }
  //thread_id = omp_get_thread_num();
  //printf("Thread %d performed %d iterations of the loop.\n", thread_id, num_loops);
  //}

  if (fadeInVideo) {
    for (i = 0; i < NUMFRAMES / 2; i++) {
      int len = strlen(RESULTSPATH) + 3 + 3 + strlen(".jpg") + 1;
      char filename[len];
      snprintf(filename, len, "%simg%03d.jpg", RESULTSPATH, i + NUMFRAMES / 2);
      int ret = WriteImage(filename, X, Y, N, fadeInVideo[i]);
      if (ret < 0) {
        printf("ERROR: Failed to write frame %d\n", i + NUMFRAMES);
        break;
      }
    }
  }

#ifdef DEBUG
  clock_t end = clock();
  printf("Writing took %f seconds\n", ((double)(end - start)) / CLOCKS_PER_SEC);
#endif

  //return ret;
}

/**
 * Returns 1 iff new dimensions match global dimensions.
 */
int CheckDimensions(int newX, int newY, int newN) {
  newX = newX / 2 * 2;
  newY = newY / 2 * 2;
  return (newX == X && newY == Y && newN == N);
}

/**
 * Takes in an occupied scene, an empty scene, and a foreign scene and
 * "transports" the person from the occupied scene to the foreign scene.
 */
int main(int argc, char *argv[]) {
#ifdef DEBUG
  clock_t totalStart = clock();
#endif
  if (argc < 6) {
    printf("ERROR: Not enough input photos\n");
    printf("Usage:\n");
    printf("-----------------------------------------------------------------\n");
    printf("./test <occupied_scene.jpg> <empty_scene.jpg> <foreign_scene.jpg> <map.jpg> <numFrames>\n");
    return -1;
  }

  NUMFRAMES = atoi(argv[5]); 

  /* Read input images */
#ifdef DEBUG
  clock_t readImagesStart = clock();
#endif
  char* occupiedSceneFilename = argv[1];
  int occupiedSceneX, occupiedSceneY, occupiedSceneN;
  unsigned char* occupiedScene = ReadImage(occupiedSceneFilename, &occupiedSceneX, &occupiedSceneY, &occupiedSceneN);
  if (occupiedScene == NULL) {
    printf("ERROR: %s\n", stbi_failure_reason());
    return -1;
  }
  X = occupiedSceneX / 2 * 2;
  Y = occupiedSceneY / 2 * 2;
  N = occupiedSceneN;

  char* emptySceneFilename = argv[2];
  int emptySceneX, emptySceneY, emptySceneN;
  unsigned char* emptyScene = ReadImage(emptySceneFilename, &emptySceneX, &emptySceneY, &emptySceneN);
  if (emptyScene == NULL) {
    printf("ERROR: %s\n", stbi_failure_reason());
    FreeImage(occupiedScene);
    return -1;
  }
  if (!CheckDimensions(emptySceneX, emptySceneY, emptySceneN)) {
    printf("ERROR: Dimension mismatch\n");
    FreeImage(occupiedScene);
    FreeImage(emptyScene);
    return -1;
  }

  char* foreignSceneFilename = argv[3];
  int foreignSceneX, foreignSceneY, foreignSceneN;
  unsigned char* foreignScene = ReadImage(foreignSceneFilename, &foreignSceneX, &foreignSceneY, &foreignSceneN);
  if (foreignScene == NULL) {
    printf("ERROR: %s\n", stbi_failure_reason());
    FreeImage(occupiedScene);
    FreeImage(emptyScene);
    return -1;
  }
  if (!CheckDimensions(foreignSceneX, foreignSceneY, foreignSceneN)) {
    printf("ERROR: Dimension mismatch\n");
    FreeImage(occupiedScene);
    FreeImage(emptyScene);
    FreeImage(foreignScene);
    return -1;
  }

  char* mapFilename = argv[4];
  int mapX, mapY, mapN;
  unsigned char* map = ReadImage(mapFilename, &mapX, &mapY, &mapN);
  if (!map) {
    printf("ERROR: %s\n", stbi_failure_reason());
    FreeImage(occupiedScene);
    FreeImage(emptyScene);
    FreeImage(foreignScene);
    return -1;
  }
  if (!CheckDimensions(mapX, mapY, N)) {
    printf("ERROR: Dimension mismatch\n");
    FreeImage(occupiedScene);
    FreeImage(emptyScene);
    FreeImage(foreignScene);
    return -1;
  }
#ifdef DEBUG
  clock_t readImagesEnd = clock();
  printf("Read images time: %f\n", ((double)(readImagesEnd - readImagesStart)) / CLOCKS_PER_SEC);
#endif
  unsigned char** fadeOutVideo = FadeOut(occupiedScene, emptyScene, map);
  if (fadeOutVideo == NULL) {
    FreeImage(occupiedScene);
    FreeImage(emptyScene);
    FreeImage(foreignScene);
    free(map);
    return -1;
  }
  /*unsigned char** fadeInVideo = FadeIn(occupiedScene, foreignScene, map);
  if (fadeInVideo == NULL) {
    FreeImage(occupiedScene);
    FreeImage(emptyScene);
    FreeImage(foreignScene);
    free(map);
    FreeVideo(fadeOutVideo);
    return -1;
  }*/
  WriteVideo(fadeOutVideo, NULL);//fadeInVideo);
#ifdef DEBUG
  clock_t freeStart = clock();
#endif

  FreeImage(occupiedScene);
  FreeImage(emptyScene);
  FreeImage(foreignScene);
  free(map);
  FreeVideo(fadeOutVideo);
  //FreeVideo(fadeInVideo);

#ifdef DEBUG
  clock_t freeEnd = clock();
  printf("Free time: %f\n", ((double)(freeEnd - freeStart)) / CLOCKS_PER_SEC);
  clock_t totalEnd = clock();
  printf("Total time: %f\n", ((double)(totalEnd - totalStart)) / CLOCKS_PER_SEC);
#endif

  return 0;
}
