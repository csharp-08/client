import Tool from './tool';

class Text extends Tool {
  constructor() {
    super();

    this.shapeName = 'v-text';
    this.defaultParams = {
      color: 'black',
      strokeWidth: 10,
      text: '',
    };
    this.count = 0;
  }

  startDrawing(event, params) {
    if (!event || !event.evt) {
      return null;
    }

    if (!params.text) {
      return null;
    }

    this.count += 1;
    return {
      component: this.shapeName,
      toolName: 'text',
      config: {
        x: event.evt.offsetX,
        y: event.evt.offsetY,
        text: params.text || this.defaultParams.text,
        fontSize: params.strokeWidth || this.defaultParams.strokeWidth,
        fontFamily: 'Calibri',
        fill: params.color || this.defaultParams.color,
        name: `text-${this.count}`,
      },
    };
  }

  // eslint-disable-next-line
  draw(event, newShape) {
    if (!event || !event.evt) {
      return;
    }
    newShape.config.x = event.evt.offsetX;
    newShape.config.y = event.evt.offsetY;
  }

  // eslint-disable-next-line
  stopDrawing(event, newShape) {}

  // eslint-disable-next-line
  getKey(shape) {
    return shape.config.text.length;
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
      ID: ID || undefined,
      InnerText: shape.config.text,
      FontSize: shape.config.fontSize,
      Config: {
        BorderColor: shape.config.stroke,
        Color: shape.config.fill,
        IsEmpty: shape.config.fillEnabled || true,
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
    return {
      component: 'v-text',
      toolName: 'text',
      config: {
        name: `text-${json.id}`,
        x: json.vertices[0].item1,
        y: json.vertices[0].item2,
        text: json.innerText,
        fontSize: json.fontSize || 10,
        fontFamily: 'Calibri',
        stroke: json.config.borderColor,
        strokeWidth: json.config.thickness,
        fill: json.config.color,
        fillEnabled: json.config.isEmpty,
        rotation: json.config.rotate || 0,
        scaleX: json.config.scaleX || 1,
        scaleY: json.config.scaleY || 1,
      },
    };
  }

  // eslint-disable-next-line
  getShapeType() {
    return '4';
  }
}

export default Text;
