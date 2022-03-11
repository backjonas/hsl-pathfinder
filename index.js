import _ from 'lodash';
import { getEdgeWeights } from './routeplanner';

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

const locations = [
  'lat: 60.168992, lon: 24.932366', 
  'lat: 60.175294, lon: 24.684855',
  'lat: 60.165294, lon: 24.884855',
  // 'lat: 60.168992, lon: 24.632366', 
  // 'lat: 60.155294, lon: 24.884855',
  // 'lat: 60.175294, lon: 24.584855',
  // 'lat: 60.185294, lon: 24.784855',
  // 'lat: 60.175294, lon: 24.784855',
];

const calculatedRoutes = getEdgeWeights(locations);
const startTime = new Date();
calculatedRoutes
  .then((routeDurations) => {
    console.log(routeDurations);
    const fastestRoutes = findFastestRoute(routeDurations);
    console.log('fastest routes: ', fastestRoutes.slice(0, 5));
    const endTime = new Date();
    console.log(`Runtime: ${(endTime - startTime) / 1000}s`)
  })
  .catch(e => console.log(e));
