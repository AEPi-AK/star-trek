function [] = newMain(occupiedFilename, emptyFilename)

    %SourcePath = '../';
    %occupiedFilename = 'woo_occupied.jpg';
    %emptyFilename = 'woo_empty.jpg';
    %foreignFilename = 'woo_foreign.jpg';
    %outFilename = '../Video.mp4';

    sigma = 30; % Blur sigma
    %numFrames = 30; % Number of video frames
    effect = 'PIXELIZE'; % Type of fading effect

    tic;
    [emptyImage, occupiedImage] = ReadImages(emptyFilename, occupiedFilename);
    t = toc;
    sprintf('Read Images: %f seconds', t)
    tic
    map = GetMap(emptyImage, occupiedImage, sigma);
    t = toc;
    sprintf('Got map: %f seconds', t)
    %[FadeOutVideo] = FadeOut(emptyImage, occupiedImage, map, numFrames, effect);
    %'Faded Out'
    %[FadeInVideo] = FadeIn(occupiedImage, foreignImage, map, numFrames, effect);
    %'Faded In'
    %WriteVideo(FadeOutVideo, FadeInVideo, outFilename, size(emptyImage,3));
    %'Wrote Video'
end