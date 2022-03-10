import { request, gql } from 'graphql-request';
import _ from 'lodash';
const url = 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql';

const fetchTime = async (startPoint, endPoint) =>  {
  try {
    const query = gql`
    {
      plan(
        from: {${startPoint}}
        to: {${endPoint}}
        numItineraries: 1
      ) {
        itineraries {
          legs {
            startTime
            endTime
            mode
            duration
            realTime
            distance
            transitLeg
          }
        }
      }
    }`
    const response = await request(url, query);
    const route = response.plan.itineraries[0].legs;
    const totalDuration = _(route).sumBy('duration');
    return {route: route, duration: totalDuration};
  
  } catch (error) {
    console.log(`Error fetching from HSL: ${error}`);
  }
};

const populateGraph = async (locations) => {
  if (locations.length < 2) return;

  const res = {};
  for (let i = 0; i < locations.length; i++) {
    const currentObject = {};
    for (let j = 0; j < locations.length; j++) {
      if (i === j) continue;
      currentObject[j] = await fetchTime(locations[i], locations[j]);
    }
    res[i] = currentObject;
  }
  return res;
};

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
  let sum = 0;
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
  console.log(permDurations);
  return _.sortBy(permDurations, (i) => i.duration);
  
};

const locations = [
  'lat: 60.168992, lon: 24.932366', 
  'lat: 60.175294, lon: 24.684855',
  'lat: 60.165294, lon: 24.884855',
];

const testList = [1, 2, 3];

const calculatedRoutes = populateGraph(locations);

calculatedRoutes
  .then((routeDurations) => {
    console.log(routeDurations);
    const fastestRoutes = findFastestRoute(routeDurations);
    console.log('fastest routes: ', fastestRoutes.slice(0, 3));
  })
  .catch(e => console.log(e));
