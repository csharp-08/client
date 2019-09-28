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
  }

  startDrawing(event, params) {
    if (!event || !event.evt) {
      return null;
    }

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
      },
    };
  }

  // eslint-disable-next-line
  draw(event, newShape) {
  }

  // eslint-disable-next-line
  stopDrawing(event, newShape) {}

  // eslint-disable-next-line
  getKey(shape) {
    return shape.config.text.length;
  }
}

export default Text;
