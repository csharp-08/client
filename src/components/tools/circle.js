import Tool from './tool';

class Cirle extends Tool {
  constructor() {
    super();

    this.shapeName = 'v-circle';
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
    const strokeWidth = params.strokeWidth || this.defaultParams.strokeWidth;
    return {
      component: this.shapeName,
      toolName: 'circle',
      config: {
        x: event.evt.offsetX,
        y: event.evt.offsetY,
        radius: strokeWidth / 2,
        minRadius: strokeWidth / 2,
        stroke: params.color || this.defaultParams.color,
        strokeWidth,
        fillEnabled: false,
        lineCap: 'round',
        lineJoin: 'round',
        name: `circle-${this.count}`,
      },
    };
  }

  // eslint-disable-next-line
  draw(event, newShape) {
    if (!event || !event.evt) {
      return;
    }
    const dx = (event.evt.offsetX - newShape.config.x);
    const dy = (event.evt.offsetY - newShape.config.y);

    newShape.config.radius = Math.max(Math.sqrt(dx * dx + dy * dy), newShape.config.minRadius);
  }

  // eslint-disable-next-line
  stopDrawing(event, newShape) {}

  // eslint-disable-next-line
  getKey(shape) {
    return shape.config.radius;
  }

  // eslint-disable-next-line
  update(oldConfig, newConfig) {
    oldConfig.x = newConfig.x;
    oldConfig.y = newConfig.y;
    return oldConfig;
  }

  // eslint-disable-next-line
  convertShapeToJSON(shape, ID = null) {
    return JSON.stringify({
      Vertices: [{ Item1: shape.config.x, Item2: shape.config.y }],
      Radius: shape.config.radius,
      ID: ID || undefined,
      Config: {
        BorderColor: shape.config.stroke,
        Color: shape.config.fill,
        IsEmpty: shape.config.fillEnabled || false,
        OffsetX: 0,
        OffsetY: 0,
        Rotate: shape.config.rotation,
        ScaleX: shape.config.scaleX,
        ScaleY: shape.config.scaleY,
        Thickness: shape.config.strokeWidth,
      },
    });
  }

  // eslint-disable-next-line
  convertJSONToShape(json) {
    const points = json.vertices.flatMap(x => [x.item1, x.item2]);
    console.log(json);
    return {
      component: this.shapeName,
      toolName: 'circle',
      config: {
        radius: json.radius,
        minRadius: json.config.thickness / 2,
        name: `circle-${json.id}`,
        stroke: json.config.borderColor,
        strokeWidth: json.config.thickness,
        fill: json.config.color,
        fillEnabled: json.config.isEmpty,
        x: points[0],
        y: points[1],
        rotation: json.config.rotate || 0,
        scaleX: json.config.scaleX || 1,
        scaleY: json.config.scaleY || 1,
        lineCap: 'round',
        lineJoin: 'round',
      },
    };
  }

  // eslint-disable-next-line
  getClass() {
    return 'Circle';
  }
}

export default Cirle;
