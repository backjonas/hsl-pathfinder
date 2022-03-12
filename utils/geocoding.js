import axios from 'axios';

const url = 'https://api.digitransit.fi/geocoding/v1';

export const nameToPoint = async (name, focusPoint) => {
  const focusPointStr = !focusPoint || focusPoint.length === 0 
    ? ''
    : `&focus.point.long=${focusPoint[0]}&focus.point.lat=${focusPoint[1]}`;
  // console.log(`${url}/search?text=${name}${focusPointStr}`);
  const res = await axios.get(`${url}/search?text=${name}${focusPointStr}&size=1`);
  console.log(res.data.features[0].geometry.coordinates);
  const coordinates = res.data.features[0].geometry.coordinates;
  const coordinateStr = `lat: ${coordinates[1]}, lon: ${coordinates[0]}`
  return coordinateStr;
}