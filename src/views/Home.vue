<template>
  <div class="home">
    <div id="map"></div>
  </div>
</template>

<script>
import { Map, View } from "ol";
import { Tile } from "ol/layer";
import { WMTS, XYZ } from "ol/source";
import { optionsFromCapabilities } from "ol/source/WMTS";
import { WMTSCapabilities } from "ol/format";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { fromLonLat, Projection, get } from "ol/proj";
import { getWidth, getTopLeft } from "ol/extent";
import WMTSTileGrid from "ol/tilegrid/WMTS";

import AMapLoader from "@amap/amap-jsapi-loader";

export default {
  name: "Home",
  data() {
    return {
      map: null,
      proj4490: null,
    };
  },
  async mounted() {
    this.definedProjection();
    this.map = new Map({
      target: "map",
      view: new View({
        zoom: 6,
        minZoom: 3,
        maxZoom: 18,
        center: [120.13046575684714, 30.243622691304385],
        projection: this.proj4490,
      }),
      layers: [
        // ...(await this.getTianDiTu()),
        ...(await this.getAMap()),
        // await this.getLocal(),
      ],
    });

    this.map.on("singleclick", (event) => {
      console.log(event);
      console.log(event.coordinate);
      console.log(fromLonLat(event.coordinate, this.proj4490));
    });
  },
  methods: {
    definedProjection() {
      proj4.defs("EPSG:4490", "+proj=longlat +ellps=GRS80 +no_defs");
      register(proj4);
      this.proj4490 = new Projection({
        code: "EPSG:4490",
        extent: [-180, -90, 180, 90],
        worldExtent: [-180, -90, 180, 90],
      });
    },
    async getTianDiTu() {
      return Promise.all([
        fetch(
          `http://t${Math.floor(
            Math.random() * 7
          )}.tianditu.gov.cn/vec_c/wmts?request=GetCapabilities&service=wmts&tk= your key`
        ),
        fetch(
          `http://t${Math.floor(
            Math.random() * 7
          )}.tianditu.gov.cn/cva_c/wmts?request=GetCapabilities&service=wmts&tk= your key`
        ),
      ])
        .then((response) => {
          return Promise.all(response.map((item) => item.text()));
        })
        .then((text) => {
          let projection = get("EPSG:3857");
          projection = this.proj4490;
          let projectionExtent = projection.getExtent();
          let size = getWidth(projectionExtent) / 256;
          let resolutions = new Array(18);
          let matrixIds = new Array(18);
          for (let z = 1; z < 19; ++z) {
            // generate resolutions and matrixIds arrays for this WMTS
            resolutions[z] = size / Math.pow(2, z);
            matrixIds[z] = z;
          }

          return text.map((item) => {
            let result = new WMTSCapabilities().read(item);

            let option = optionsFromCapabilities(result, {
              layer: result.Contents.Layer[0].Abstract,
              matrixSet: result.Contents.TileMatrixSet[0].Abstract,
            });

            option.projection = projection;
            option.tileGrid = new WMTSTileGrid({
              origin: getTopLeft(projectionExtent),
              resolutions: resolutions,
              matrixIds: matrixIds,
            });

            option.urls = option.urls.map((url) => url + "tk= your key");
            option.crossOrigin = "*";

            return new Tile({
              name: `${result.Contents.Layer[0].Abstract}_${result.Contents.TileMatrixSet[0].Abstract}`,
              source: new WMTS(option),
            });
          });
        });
    },
    async getAMap() {
      let AMap;
      // eslint-disable-next-line no-undef
      if (AMap === undefined) {
        await AMapLoader.load({
          key: "your key",
          version: "2.0",
          AMapUI: {
            version: "1.1",
          },
        }).then((_map) => {
          AMap = _map;
        });
      }
      return [
        new Tile({
          source: new XYZ({
            // eslint-disable-next-line no-undef
            url: new AMap.TileLayer()
              .getTileUrl()
              .replace(
                "{1,2,3,4}",
                (Math.floor(Math.random() * 4) + 1).toString()
              )
              .replace("[x]", "{x}")
              .replace("[y]", "{y}")
              .replace("[z]", "{z}"),
            projection: "EPSG:4490",
            crossOrigin: "*",
            minZoom: 3,
            maxZoom: 18,
          }),
          // zIndex: 1,
        }),
        new Tile({
          source: new XYZ({
            // eslint-disable-next-line no-undef
            url: new AMap.TileLayer.RoadNet()
              .getTileUrl()
              .replace(
                "{1,2,3,4}",
                (Math.floor(Math.random() * 4) + 1).toString()
              )
              .replace("[x]", "{x}")
              .replace("[y]", "{y}")
              .replace("[z]", "{z}"),
            projection: "EPSG:4490",
            crossOrigin: "*",
            minZoom: 7,
            maxZoom: 18,
          }),
          // zIndex: 1,
        }),
        new Tile({
          source: new XYZ({
            // eslint-disable-next-line no-undef
            url: new AMap.TileLayer.Satellite()
              .getTileUrl()
              .replace(
                "{1,2,3,4}",
                (Math.floor(Math.random() * 4) + 1).toString()
              )
              .replace("[x]", "{x}")
              .replace("[y]", "{y}")
              .replace("[z]", "{z}"),
            projection: "EPSG:4490",
            crossOrigin: "*",
            minZoom: 3,
            maxZoom: 18,
          }),
          // zIndex: 1,
        }),
        new Tile({
          source: new XYZ({
            url:
              "http://tm.amap.com/trafficengine/mapabc/traffictile?v=1.0&;t=1&x={x}&y={y}&z={z}&&t=" +
              parseInt(new Date().valueOf() / 1000) * 1000,
            projection: "EPSG:4490",
            crossOrigin: "*",
            minZoom: 7,
            maxZoom: 20,
          }),
          // zIndex: 1,
        }),
      ];
    },
    async getLocal() {
      return fetch("/geoserver/gwc/service/wmts?REQUEST=GetCapabilities")
        .then((response) => response.text())
        .then((text) => {
          // let projection = get("EPSG:3857");
          // projection = this.proj4490;
          // let projectionExtent = projection.getExtent();
          // let size = getWidth(projectionExtent) / 256;
          // let resolutions = new Array(18);
          // let matrixIds = new Array(18);
          // for (let z = 1; z < 19; ++z) {
          //   // generate resolutions and matrixIds arrays for this WMTS
          //   resolutions[z] = size / Math.pow(2, z);
          //   // matrixIds[z] = `EPSG:4490:${z}`;
          //   matrixIds[z] = z;
          // }
          let result = new WMTSCapabilities().read(text);
          let option = optionsFromCapabilities(result, {
            layer: "westlake:colorful_fix",
            matrixSet: "EPSG:3857",
          });
          console.log(option);

          // option.crossOrigin = "*";

          // option.projection = this.proj4490;
          // option.tileGrid = new WMTSTileGrid({
          //   origin: getTopLeft(projectionExtent),
          //   resolutions: resolutions,
          //   matrixIds: matrixIds,
          // });

          return new Tile({
            name: "local",
            source: new WMTS(option),
            zIndex: 99,
          });
        });
    },
  },
};
</script>

<style>
.home,
#map {
  width: 100%;
  height: 100%;
}
</style>
