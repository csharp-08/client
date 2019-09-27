import Tool from './tool';

class FreeLineTool extends Tool {
  constructor() {
    super();

    this.shapeName = 'v-line';
    this.defaultParams = {
      color: 'black',
      strokeWidth: 10,
    };
  }

  startDrawing(event, params) {
    if (!event || !event.evt) {
      return null;
    }
    return {
      component: this.shapeName,
      toolName: 'freeLine',
      config: {
        points: [event.evt.offsetX, event.evt.offsetY, event.evt.offsetX, event.evt.offsetY],
        stroke: params.color || this.defaultParams.color,
        strokeWidth: params.strokeWidth || this.defaultParams.strokeWidth,
        lineCap: 'round',
        lineJoin: 'round',
        draggable: true,
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
  stopDrawing(event, newShape) {}

  // eslint-disable-next-line
  getKey(shape) {
    return shape.config.points.length;
  }
}

export default FreeLineTool;
