import { request, gql } from 'graphql-request';
import _ from 'lodash';
const url = 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql';

const fetchDuration = async (startPoint, endPoint) =>  {
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
    if (response.plan.itineraries.length === 0) {
      return {route: {}, duration: 100000000000};
    }
    const route = response.plan.itineraries[0].legs;
    const totalDuration = _(route).sumBy('duration');
    return {route: route, duration: totalDuration};
  
  } catch (error) {
    console.log(`Error fetching from HSL: ${error}`);
  }
};

export const getEdgeWeights = async (locations) => {
  if (locations.length < 2) return;

  const res = {};
  for (let i = 0; i < locations.length; i++) {
    const currentObject = {};
    for (let j = 0; j < locations.length; j++) {
      if (i === j) continue;
      currentObject[j] = await fetchDuration(locations[i], locations[j]);
    }
    res[i] = currentObject;
  }
  return res;
};
