// src/utils/locationSorter.js
// ordena tipo A01-B02-C03 corretamente
export function sortLocations(locations) {
  return locations.sort((a, b) => {
    return a.code.localeCompare(b.code, undefined, { numeric: true });
  });
}