import Tool from './tool';

class FreeLineTool extends Tool {
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
      toolName: 'freeLine',
      config: {
        points: [event.evt.offsetX, event.evt.offsetY, event.evt.offsetX, event.evt.offsetY],
        stroke: params.color || this.defaultParams.color,
        strokeWidth: params.strokeWidth || this.defaultParams.strokeWidth,
        lineCap: 'round',
        lineJoin: 'round',
        x: 0,
        y: 0,
        name: `freeline-${this.count}`,
      },
    };
  }

  // eslint-disable-next-line
  draw(event, newShape) {
    if (!event || !event.evt) {
      return;
    }
    newShape.config.points.push(event.evt.offsetX, event.evt.offsetY);
  }

  // eslint-disable-next-line
  stopDrawing(event, newShape) {
    return true;
  }

  // eslint-disable-next-line
  getKey(shape) {
    return shape.config.points.length;
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
        Rotation: shape.config.rotation,
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
      toolName: 'freeLine',
      config: {
        points: json.vertices.flatMap(x => [x.item1, x.item2]),
        lineCap: 'round',
        lineJoin: 'round',
        name: `freeline-${json.id}`,
        stroke: json.config.borderColor,
        strokeWidth: json.config.thickness,
        fill: json.config.color,
        fillEnabled: json.config.isEmpty,
        x: json.config.offsetX,
        y: json.config.offsetY,
        rotation: json.config.rotation || 0,
        scaleX: json.config.scaleX || 1,
        scaleY: json.config.scaleY || 1,
      },
    };
  }

  // eslint-disable-next-line
  getShapeType() {
    return 2;
  }
}

export default FreeLineTool;
