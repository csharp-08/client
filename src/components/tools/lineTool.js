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
      toolName: 'line',
      config: {
        points: [event.evt.offsetX, event.evt.offsetY, event.evt.offsetX, event.evt.offsetY],
        stroke: params.color || this.defaultParams.color,
        strokeWidth: params.strokeWidth || this.defaultParams.strokeWidth,
        lineCap: 'round',
        lineJoin: 'round',
        x: 0,
        y: 0,
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
      return;
    }
    newShape.config.points[2] = event.evt.offsetX;
    newShape.config.points[3] = event.evt.offsetY;
  }

  // eslint-disable-next-line
  getKey(shape) {
    return shape.config.points.reduce((sum, p) => sum + p, 0);
  }

  // eslint-disable-next-line
  update(oldConfig, newConfig) {
    const { x, y } = newConfig;
    for (let i = 0; i < oldConfig.points.length; i += 2) {
      oldConfig.points[i] += x;
      oldConfig.points[i + 1] += y;
    }
    oldConfig.x = 0;
    oldConfig.y = 0;
    return oldConfig;
  }
}

export default FreeLineTool;
