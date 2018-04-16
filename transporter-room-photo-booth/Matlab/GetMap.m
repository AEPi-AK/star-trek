function [ Map ] = GetMap( emptyImage, occupiedImage, sigma )
    blurredEmptyImage = imgaussfilt(emptyImage, sigma);
    blurredOccupiedImage = imgaussfilt(occupiedImage, sigma);

    difference1 = blurredOccupiedImage - blurredEmptyImage;
    difference2 = blurredEmptyImage - blurredOccupiedImage;
    %blurredDifference = imgaussfilt(difference, 50);
    difference1R = difference1(:,:,1) > 10;
    difference1G = difference1(:,:,2) > 10;
    difference1B = difference1(:,:,3) > 10;
    difference2R = difference2(:,:,1) > 40;
    difference2G = difference2(:,:,2) > 40;
    difference2B = difference2(:,:,3) > 30;

    R = difference1R | difference2R;
    %figure, imshow(R);
    G = difference1G | difference2G;
    %figure, imshow(G);
    B = difference1B | difference2B;
    %figure, imshow(B);

    SE = strel('square', 80);
    R = imdilate(R, SE);
    G = imdilate(G, SE);
    B = imdilate(B, SE);

    Map = R | G | B;
    Map = imerode(Map, SE);
    Filled = imfill(double(Map), 'holes');
    Holes = Filled & ~Map;
    BigHoles = bwareaopen(Holes, 50000);
    SmallHoles = Holes & ~BigHoles;
    Map = Map | SmallHoles;
    %Map = bwareafilt(logical(Map), 1);
    Map = bwareaopen(logical(Map), 100000);
    SE = strel('square', 30);
    Map = imerode(Map, SE);
    %figure, imshow(Map);

    %final2 = bwareafilt(final, 4);
    %figure, imshow(final2);

    %final3 = imfill(double(final2));
    %figure, imshow(final3);

    %final3 = bwareaopen(final2, 30000);
    %figure, imshow(final3);

    %OR = blurredDifferenceR | blurredDifferenceG | blurredDifferenceB;
    %BOR = imgaussfilt(double(OR), 90);

    %imshow(BOR > 0.15)
    
    %imshow(Map);
    imwrite(Map, './map.jpg', 'JPEG');
end

