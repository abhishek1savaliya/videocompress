const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const cliProgress = require('cli-progress');

// Input and output folder paths
const inputFolder = './Input';
const outputFolder = './Output';

// Ensure the output folder exists
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

// Get all video files from the input folder
const videoFiles = fs.readdirSync(inputFolder).filter(file => {
  return /\.(mp4|avi|mov|mkv)$/i.test(file); // Adjust extensions as needed
});

if (videoFiles.length === 0) {
  console.log('No video files found in the input folder.');
  process.exit(0);
}

// Function to compress a video
const compressVideo = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    console.log(`Compressing: ${path.basename(inputPath)}`);

    ffmpeg(inputPath)
      .videoCodec('libx264') // Set video codec
      .outputOptions('-crf 28') // Set quality (lower CRF = better quality, larger size)
      .on('start', () => progressBar.start(100, 0))
      .on('progress', progress => {
        if (progress.percent) {
          progressBar.update(progress.percent);
        }
      })
      .on('end', () => {
        progressBar.stop();
        console.log(`Compression complete: ${outputPath}`);
        resolve();
      })
      .on('error', err => {
        progressBar.stop();
        console.error(`Error compressing ${inputPath}:`, err.message);
        reject(err);
      })
      .save(outputPath);
  });
};

// Compress videos sequentially
const processVideos = async () => {
  for (const videoFile of videoFiles) {
    const inputPath = path.join(inputFolder, videoFile);
    const outputPath = path.join(outputFolder, videoFile);
    try {
      await compressVideo(inputPath, outputPath);
    } catch (error) {
      console.error(`Failed to compress ${videoFile}:`, error);
    }
  }

  console.log('All videos have been processed.');
};

processVideos();