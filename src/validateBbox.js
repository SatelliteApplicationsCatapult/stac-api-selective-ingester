// TODO: Replace with propper WSG84 validation

function validateBbox(bbox) {
  if (!bbox) {
    return false;
  }
  if (bbox.length !== 4 && bbox.length !== 6) {
    return false;
  }
  let size = bbox.length;
  for (let i = 0; i < size; i++) {
    if (isNaN(bbox[i])) {
      return false;
    }
  }

  // if size is 4, any value must be between -180 and 180
  if (size === 4) {
    for (let i = 0; i < size; i++) {
      if (bbox[i] < -180 || bbox[i] > 180) {
        return false;
      }
    }
  }
  // if size is 6, indexes 0,1,3,4 must be between -180 and 180
  if (size === 6) {
    for (let i = 0; i < size; i++) {
      if (i === 2) {
        continue;
      }
      if (i === 5){
        continue;
      }
      if (bbox[i] < -180 || bbox[i] > 180) {
        return false;
      }
    }
  }

  return true;
}

module.exports = validateBbox;
