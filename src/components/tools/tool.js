class Tool {
  constructor() {
    if (this.constructor === Tool) {
      throw new TypeError('Abstract class "Shape" cannot be instantiated directly');
    }

    this.shapeName = '';
  }

  // eslint-disable-next-line
  startDrawing(event, params) {
    throw new Error('You must implement this function');
  }

  // eslint-disable-next-line
  draw(event, newShape) {
    throw new Error('You must implement this function');
  }

  // eslint-disable-next-line
  stopDrawing(event, newShape) {
    throw new Error('You must implement this function');
  }

  // eslint-disable-next-line
  getKey(shape) {
    throw new Error('You must implement this function');
  }

  // eslint-disable-next-line
  update(oldConfig, updateConfig) {
    return oldConfig;
  }

  // eslint-disable-next-line
  convertShapeToJSON() {
    throw new Error('You must implement this function');
  }

  // eslint-disable-next-line
  convertJSONToShape(json) {
    throw new Error('You must implement this function');
  }

  // eslint-disable-next-line
  getShapeType() {
    throw new Error('You must implement this function');
  }
}

export default Tool;
