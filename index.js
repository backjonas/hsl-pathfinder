import _ from 'lodash';
import { getEdgeWeights } from './utils/routeplanner.js';
import { nameToPoint } from './utils/geocoding.js';

const permutations = arr => {
  if (arr.length <= 2) return arr.length === 2 ? [arr, [arr[1], arr[0]]] : arr;
  return arr.reduce(
    (acc, item, i) =>
      acc.concat(
        permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map(val => [
          item,
          ...val,
        ])
      ),
    []
  );
};

const findFastestRoute = (routeDurations) => {
  const routePermutations = permutations(Object.keys(routeDurations));
  const permDurations = routePermutations.map((route) => {
    let duration = 0;
    for (let i = 0; i < route.length - 1; i++) {
      duration += routeDurations[route[i]][route[i+1]].duration;
    }
    return {
      route: route,
      duration: duration
    }
  });
  // console.log(permDurations);
  return _.sortBy(permDurations, (i) => i.duration);
  
};

// const locations = [
//   'lat: 60.168992, lon: 24.932366', 
//   'lat: 60.175294, lon: 24.684855',
//   'lat: 60.165294, lon: 24.884855',
//   'lat: 60.168992, lon: 24.632366', 
//   'lat: 60.155294, lon: 24.884855',
//   'lat: 60.175294, lon: 24.584855',
//   'lat: 60.185294, lon: 24.784855',
//   'lat: 60.175294, lon: 24.784855',
// ];

const locations = [
  'Kamppi',
  'Aalto yliopisto',
  'Sello',
  'Sörnäinen'
]

const points = await Promise.all(locations.map(async i => await nameToPoint(i)));
console.log(points);
const calculatedRoutes = getEdgeWeights(points);
const startTime = new Date();
calculatedRoutes
  .then((routeDurations) => {
    console.log(routeDurations);
    const fastestRoutes = findFastestRoute(routeDurations);
    const routesWithNames = fastestRoutes.map(i => {
      const route = i.route.map(j => locations[Number(j)]);
      return { route: route, duration: i.duration }
    })
    console.log('fastest routes: ', routesWithNames.slice(0, 5));
    const endTime = new Date();
    console.log(`Runtime: ${(endTime - startTime) / 1000}s`)
  })
  .catch(e => console.log(e));
