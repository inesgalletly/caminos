import './style.css';
import {Map, View} from 'ol';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import './node_modules/ol-layerswitcher/dist/ol-layerswitcher.css';
import LayerSwitcher from 'ol-layerswitcher';
import {OSM, Vector as VectorSource} from 'ol/source'
import TileWMS from 'ol/source/TileWMS';
import {GeoJSON} from 'ol/format';
import {
  OverviewMap,
  ZoomToExtent,
  defaults as defaultControls} from "ol/control";
import LayerGroup from 'ol/layer/Group';
import {Style, Fill, Stroke} from 'ol/style';
import Overlay from 'ol/Overlay';

//MAPA SITUACION
const overviewMapControl = new OverviewMap({
  layers: [
    new TileLayer({
      source: new OSM(),
      })
  ],
  collapsed: false
}) 
const extendControls =[
  overviewMapControl,
];



//ESTILO CAMINOS
const stylecaminos = (feature) => {
  const agrupacion = feature.get ('agrupacion');
  let color;

  switch(agrupacion) {
    case'Camino Francés':
      color= 'red';
      break;
    case 'Caminos Andaluces':
      color ='green';
      break;
    case 'Caminos Catalanes':
      color = 'blue';
      break;
    case 'Caminos de Galicia':
      color = 'yellow';
      break;
    case 'Caminos del Centro':
      color='orange';
      break;
    case 'Caminos del Este':
      color='purple';
      break;
    case 'Caminos del Norte':
      color= 'grey';
      break;
    case 'Caminos del Sureste':
      color='pink';
      break;
    case 'Caminos Insulares':
      color='brown';
      break;
    case 'Caminos Portugueses':
      color= 'CadetBlue';
      break;
    case 'Chemins vers Via des Piemonts':
      color= 'Coral';
      break;
    case 'Chemins vers Via Turonensis':
      color = 'DarkOliveGreen';
      break;
    case 'Via Tolosana Arles':
      color= 'DarkSlateBlue';
      break;
    case 'Voie des Piemonts':
      color= 'DarkTurquoise';
      break;
    case 'Voie Turonensis - Paris':
      color ='FireBrick';
      break;
    
    default: 
    color = 'black'
  }
  return new Style ({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.6)',

    }),
    stroke: new Stroke({
      color: color,
      width: 1.5,
    }),
  });
};

//FUNCIÓN POP UP

//MAPA CAMINOS

const caminosSantiago = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: './data/caminos_santiago.geojson',
    title: 'Caminos de Santiago',
    type: 'overlay',
    visible: true,
  }),
  style: stylecaminos
});

//MAPA PNOA
const ortoPNOA = new TileLayer({
  source: new TileWMS({
    url: 'https://www.ign.es/wms-inspire/pnoa-ma?',
    params: {'LAYERS': 'OI.OrthoimageCoverage', 'TILED': true},
    attribution: 'IGN',
    }),  
    title: 'PNOA',
    type: 'base',
    visible: false
});

//MAPA MTN50
const MTN50 = new TileLayer({
  source: new TileWMS({
    url: 'https://www.ign.es/wms/primera-edicion-mtn',
    params: {'LAYERS': 'MTN50', 'TILED': true},
    attribution: 'IGN',
    }),
    title: 'MTN50',
    type: 'base',
    visible: true
});

//MAPA OSM

const OpenStreetMap = new TileLayer({
  source: new OSM(),
  title: 'Open Street Maps',
  visible: true,
  type: 'base',
});

//GRUPO CAPAS BASE

const baseMap_layers = new LayerGroup({
  title: 'Mapas base',
  layers: [MTN50,ortoPNOA,OpenStreetMap],
  fold: 'open',
});
const overlayMap_layers = new LayerGroup ({
  title: 'Caminos de Santiago',
  layers: [caminosSantiago],
  fold: 'open',
});

//MAPA GENERAL
const extentSpain= [-2093763.078788, 3732572.965222, 1829596.709034, 6755810.307957]
const extentCoruna =[-1126376.048810, 5132593.575293, -664084.901742, 5539238.565770]

const zoomtoCoruna = new ZoomToExtent({
  extent: extentCoruna,
  label: "La Coruña, Galicia"
});


const map = new Map({
  target: 'map',
  layers: [baseMap_layers,overlayMap_layers],
  view: new View({
    center: [0, 0],
    zoom: 6,
    extent: extentSpain
  }),
  controls: defaultControls({
    zoom: true,
    attribution: true,
    OverviewMap: true,
  }).extend(extendControls),
  
});

map.addControl(zoomtoCoruna);


//POP UP

const container = document.getElementById("pop-up");
const content = document.getElementById("popup-content");
const closer = document.getElementById("popup-closer");

closer.onclick = function() {
  overlay_popup.setPosition(undefined);
  closer.blur();
  return false;
};

const overlay_popup = new Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250,
  }
});
map.addOverlay(overlay_popup);

function sync(map) {
  // Lógica para sincronizar el mapa
  console.log('Syncing map:', map);
}
sync(map);

map.on("singleclick",function (evt) {
  let info = map.forEachFeatureAtPixel(evt.pixel, function (feature){
    let name = feature.get ("nombre");
    let group = feature.get("agrupacion");
    let data = [name,group];
    return data;
  })


if (info){
  container.style.display = "block";
  const coordinate = evt.coordinate;
  content.innerHTML = `<h3> Información</h3>
                      <p><b>Nombre:</b> ${info[0]}</p>
                      <p><b>Agrupación:</b> ${info[1]}</p>`;
  overlay_popup.setPosition(coordinate);
} else {
  container.style.display= "none";
}
});

map.on("pointermove",function (evt){
  map.getTargetElement().style.cursor = map.hasFeatureAtPixel(evt.pixel)
  ? "pointer"
  :"";
});

//CONTROL DE CAPAS 
const layerSwitcher = new LayerSwitcher({
  tipLabel: 'Legend',
});
map.addControl(layerSwitcher);
