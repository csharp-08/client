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
    return {
      component: this.shapeName,
      toolName: 'circle',
      config: {
        x: event.evt.offsetX,
        y: event.evt.offsetY,
        radius: 1,
        stroke: params.color || this.defaultParams.color,
        strokeWidth: params.strokeWidth || this.defaultParams.strokeWidth,
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
    
    newShape.config.radius = Math.sqrt(dx * dx + dy * dy);
  }

  // eslint-disable-next-line
  stopDrawing(event, newShape) {}

  // eslint-disable-next-line
  getKey(shape) {
    return shape.config.radius;
  }
}

export default FreeLineTool;
