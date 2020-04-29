export function serialiseBounds(bnd) {
    return {
        ne: {
            lat: bnd.getNorthEast().lat,
            lng: bnd.getNorthEast().lng
        },
        sw: {
            lat: bnd.getSouthWest().lat,
            lng: bnd.getSouthWest().lng
        },
    }
}