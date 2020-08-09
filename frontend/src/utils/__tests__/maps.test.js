import {LatLng, LatLngBounds} from 'leaflet'
import {serialiseBounds} from "../maps";

describe("Helpers from the map module under utils.", () => {

    it('should take a Leaflet LatLngBounds and serialise it for JSON', () => {
        const tl = new L.LatLng(51.5, -2);
        const br = new L.LatLng(51, -2.2);
        const bounds = new L.latLngBounds(tl, br);

        const sBounds = serialiseBounds(bounds);
        expect(sBounds.ne.lat).toEqual(51.5);
        expect(sBounds.ne.lng).toEqual(-2);
        expect(sBounds.sw.lat).toEqual(51);
        expect(sBounds.sw.lng).toEqual(-2.2);
    })
})