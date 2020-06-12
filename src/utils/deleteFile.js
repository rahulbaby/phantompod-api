import fs from 'fs';

export default (path) => {
  try {
    fs.unlinkSync(path);
  } catch (err) {
    console.error(err);
  }
};
