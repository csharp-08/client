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
      return true;
    }
    newShape.config.points[2] = event.evt.offsetX;
    newShape.config.points[3] = event.evt.offsetY;
    return true;
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
  convertShapeToJSON(shape, ID = null) {

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
      ID: ID || undefined,
      Config: {
        BorderColor: shape.config.stroke,
        Color: shape.config.fill,
        IsEmpty: shape.config.fillEnabled || false,
        OffsetX: shape.config.x,
        OffsetY: shape.config.y,
        Rotate: shape.config.rotation,
        ScaleX: shape.config.scaleX,
        ScaleY: shape.config.scaleY,
        Thickness: shape.config.strokeWidth,
      },
    });
  }

  // eslint-disable-next-line
  convertJSONToShape(json) {
    return {
      component: 'v-Line',
      toolName: 'line',
      config: {
        name: `line-${json.id}`,
        points: json.vertices.flatMap(x => [x.item1, x.item2]),
        stroke: json.config.borderColor,
        strokeWidth: json.config.thickness,
        fill: json.config.color,
        fillEnabled: json.config.isEmpty,
        x: json.config.offsetX,
        y: json.config.offsetY,
        rotation: json.config.rotate || 0,
        scaleX: json.config.scaleX || 1,
        scaleY: json.config.scaleY || 1,
        lineCap: 'round',
        lineJoin: 'round',
      },
    };
  }

  // eslint-disable-next-line
  getShapeType() {
    return 1;
  }
}

export default LineTool;
