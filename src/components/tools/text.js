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
  convertShapeToJSON(shape) {

    return JSON.stringify({
      Vertices: [{ Item1: shape.config.x, Item2: shape.config.y }],
      Thickness: shape.config.fontSize,
      Color: shape.config.fill,
      Text: shape.config.text,
    });
  }

  // eslint-disable-next-line
  convertJSONToShape(json) {
    return {
      component: 'v-text',
      toolName: 'text',
      config: {
        x: json.vertices[0].item1,
        y: json.vertices[0].item2,
        text: json.innerText,
        fontSize: json.thickness,
        fontFamily: 'Calibri',
        fill: json.color || this.defaultParams.color,
      },
    };
  }

  // eslint-disable-next-line
  getClass() {
    return 'Text';
  }
}

export default Text;
