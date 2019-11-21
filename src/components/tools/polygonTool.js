import Tool from './tool';

class PolygonTool extends Tool {
  constructor() {
    super();

    this.shapeName = 'v-line';
    this.defaultParams = {
      color: 'black',
      strokeWidth: 10,
    };
    this.count = 0;
    this.sensivity = 150;
  }

  startDrawing(event, params) {
    if (!event || !event.evt) {
      return null;
    }
    this.count += 1;
    return {
      component: this.shapeName,
      toolName: 'polygon',
      config: {
        points: [event.evt.offsetX, event.evt.offsetY, event.evt.offsetX, event.evt.offsetY],
        stroke: params.color || this.defaultParams.color,
        strokeWidth: params.strokeWidth || this.defaultParams.strokeWidth,
        lineCap: 'round',
        lineJoin: 'round',
        x: 0,
        y: 0,
        name: `polygon-${this.count}`,
      },
    };
  }

  capturePoint(event, newShape) {
    return this.distance(event.evt.offsetX, event.evt.offsetY, newShape.config.points[0], newShape.config.points[1]) > this.sensivity;
  }

  // eslint-disable-next-line
  draw(event, newShape) {
    if (!event || !event.evt) {
      return;
    }

    if (this.capturePoint(event, newShape)) {
      newShape.config.points[newShape.config.points.length - 2] = event.evt.offsetX;
      newShape.config.points[newShape.config.points.length - 1] = event.evt.offsetY;
    } else {
      // eslint-disable-next-line prefer-destructuring
      newShape.config.points[newShape.config.points.length - 2] = newShape.config.points[0];
      // eslint-disable-next-line prefer-destructuring
      newShape.config.points[newShape.config.points.length - 1] = newShape.config.points[1];
    }
  }

  // eslint-disable-next-line
  stopDrawing(event, newShape) {
    if (!event || !event.evt) {
      return true;
    }

    if (this.capturePoint(event, newShape)) {
      newShape.config.points.push(event.evt.offsetX);
      newShape.config.points.push(event.evt.offsetY);
      return false;
    }
    return true;
  }

  // eslint-disable-next-line
  distance(x1,y1,x2,y2) {
    const x = x1 - x2;
    const y = y1 - y2;
    return x * x + y * y;
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
    return 5;
  }
}

export default PolygonTool;
