class Tool {
  constructor() {
    if (this.constructor === Tool) {
      throw new TypeError('Abstract class "Shape" cannot be instantiated directly');
    }

    this.shapeName = '';
  }

  // eslint-disable-next-line
  startDrawing(event) {
    throw new Error('You must implement this function');
  }

  // eslint-disable-next-line
  draw(event) {
    throw new Error('You must implement this function');
  }

  // eslint-disable-next-line
  stopDrawing(event) {
    throw new Error('You must implement this function');
  }

  // eslint-disable-next-line
  getKey(shape) {
    throw new Error('You must implement this function');
  }
}

export default Tool;
