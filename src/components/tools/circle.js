import Tool from './tool';

class FreeLineTool extends Tool {
  constructor() {
    super();

    this.shapeName = 'v-circle';
    this.defaultParams = {
      color: 'black',
      strokeWidth: 10,
    };
  }

  startDrawing(event, params) {
    if (!event || !event.evt) {
      return null;
    }
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
        lineCap: 'round',
        lineJoin: 'round',
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
}

export default FreeLineTool;
