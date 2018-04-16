function [ emptyImage, occupiedImage, foreignImage ] = ReadImages( emptyFilename, occupiedFilename )
    %occupiedImage = imread(char(strcat({SourcePath},{occupiedFilename})));
    %emptyImage = imread(char(strcat({SourcePath}, {emptyFilename})));
    %foreignImage = imread(char(strcat({SourcePath}, {foreignFilename})));
    occupiedImage = imread(occupiedFilename);
    emptyImage = imread(emptyFilename);
    %foreignImage = imread(foreignFilename);
end

