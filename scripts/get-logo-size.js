import sharp from 'sharp';

sharp('src/logo.png')
  .metadata()
  .then(meta => {
    console.log(`Logo dimensions: ${meta.width}x${meta.height}, format: ${meta.format}`);
  })
  .catch(err => {
    console.error('Error reading logo:', err);
  });
