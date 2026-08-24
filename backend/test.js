const mongoose = require('mongoose');
const OceanData = require('./models/OceanData');
mongoose.connect('mongodb://127.0.0.1:27017/oceanographic').then(async () => {
  const EARTH_RADIUS_KM = 6378.1;
  const count = await OceanData.countDocuments({
    location: {
      $geoWithin: {
        $centerSphere: [[73, 15], 350 / EARTH_RADIUS_KM]
      }
    }
  });
  console.log('ocean count:', count);
  process.exit(0);
});

