import Tool from './tool';

class LineTool extends Tool {
  constructor() {
    super();

    this.shapeName = 'v-line';
    this.defaultParams = {
      color: 'black',
      strokeWidth: 10,
    };
    this.count = 0;
  }

  startDrawing(event, params) {
    if (!event || !event.evt) {
      return null;
    }
    this.count += 1;
    return {
      component: this.shapeName,
      toolName: 'line',
      config: {
        points: [event.evt.offsetX, event.evt.offsetY, event.evt.offsetX, event.evt.offsetY],
        stroke: params.color || this.defaultParams.color,
        strokeWidth: params.strokeWidth || this.defaultParams.strokeWidth,
        lineCap: 'round',
        lineJoin: 'round',
        x: 0,
        y: 0,
        name: `line-${this.count}`,
      },
    };
  }

  // eslint-disable-next-line
  draw(event, newShape) {
    if (!event || !event.evt) {
      return;
    }
    newShape.config.points[2] = event.evt.offsetX;
    newShape.config.points[3] = event.evt.offsetY;
  }

  // eslint-disable-next-line
  stopDrawing(event, newShape) {
    if (!event || !event.evt) {
      return;
    }
    newShape.config.points[2] = event.evt.offsetX;
    newShape.config.points[3] = event.evt.offsetY;
  }

  // eslint-disable-next-line
  getKey(shape) {
    return shape.config.points.reduce((sum, p) => sum + p, 0);
  }

  // eslint-disable-next-line
  update(oldConfig, newConfig) {
    oldConfig.x = newConfig.x;
    oldConfig.y = newConfig.y;
    return oldConfig;
  }

  // eslint-disable-next-line
  convertShapeToJSON(shape) {

    const points = [];
    let previous = 0;

    shape.config.points.forEach((item, index) => {
      if (index % 2) {
        points.push({ Item1: previous, Item2: item });
      } else {
        previous = item;
      }
    });

    return JSON.stringify({
      Vertices: points,
      Thickness: shape.config.strokeWidth,
      Color: shape.config.stroke,
    });
  }

  // eslint-disable-next-line
  convertJSONToShape(json) {
    return {
      component: 'v-Line',
      toolName: 'freeLine',
      config: {
        points: json.vertices.flatMap(x => [x.item1, x.item2]),
        stroke: json.color,
        strokeWidth: json.thickness,
        lineCap: 'round',
        lineJoin: 'round',
      },
    };
  }

  // eslint-disable-next-line
  getClass() {
    return 'Line';
  }
}

export default LineTool;
